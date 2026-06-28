#!/usr/bin/env node
/**
 * Detect whether Timo's web client bumped its app version.
 *
 * Timo embeds the version as a literal in its public JS bundle, e.g.
 *   ":WEB:WEB:".concat("324", ":WEB:")...      // x-timo-devicereg
 *   sha256("WEB.".concat(deviceId, ".").concat("324"))  // x-gofs-context-id
 * A mismatch with the SDK's APP_VERSION causes /login to reject with code 6777.
 *
 * Usage:
 *   node scripts/check-timo-version.mjs            # report only (exit 0 ok / 1 error)
 *   node scripts/check-timo-version.mjs --write    # also patch constants.ts when drifted
 *
 * In GitHub Actions, writes `current`, `latest`, `drift` to $GITHUB_OUTPUT.
 */
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONSTANTS = resolve(ROOT, 'packages/core/src/utils/constants.ts');
const WEB_APP = 'https://my.timo.vn/';
const FETCH_TIMEOUT_MS = 30000;

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'timo-bank-version-check' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Read the SDK's pinned version from constants.ts source. */
function readCurrentVersion() {
  const src = readFileSync(CONSTANTS, 'utf8');
  const m = src.match(/APP_VERSION\s*=\s*'(\d+)'/);
  if (!m) throw new Error('APP_VERSION not found in constants.ts');
  return m[1];
}

/** Scrape the live version from Timo's web bundle. */
async function fetchLiveVersion() {
  const html = await fetchText(WEB_APP);
  // Collect script bundle URLs (main chunk first — version lives there).
  const srcs = [...html.matchAll(/src="([^"]+\.js)"/g)]
    .map((m) => new URL(m[1], WEB_APP).href)
    .sort((a) => (a.includes('/main.') ? -1 : 1));
  if (srcs.length === 0) throw new Error('No script bundles found in web app HTML');

  // Primary + fallback patterns for the version literal in the minified bundle.
  const patterns = [/:WEB:WEB:"\.concat\("(\d+)"/, /WEB\.".concat\([^)]*\)\.concat\("(\d+)"\)/];
  for (const url of srcs) {
    const js = await fetchText(url);
    for (const re of patterns) {
      const m = js.match(re);
      if (m) return m[1];
    }
  }
  throw new Error('Version literal not found in any bundle (Timo may have changed their build)');
}

function emitOutput(current, latest, drift) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `current=${current}\nlatest=${latest}\ndrift=${drift}\n`
    );
  }
}

async function main() {
  const write = process.argv.includes('--write');
  const current = readCurrentVersion();
  const latest = await fetchLiveVersion();
  const drift = current !== latest;

  console.log(`SDK APP_VERSION : ${current}`);
  console.log(`Timo live version: ${latest}`);
  console.log(drift ? `DRIFT: Timo updated ${current} -> ${latest}` : 'OK: versions match');

  emitOutput(current, latest, drift);

  if (drift && write) {
    const src = readFileSync(CONSTANTS, 'utf8');
    writeFileSync(
      CONSTANTS,
      src.replace(/(APP_VERSION\s*=\s*')\d+(')/, `$1${latest}$2`),
      'utf8'
    );
    console.log(`Patched constants.ts -> APP_VERSION = '${latest}'`);
  }
}

main().catch((err) => {
  console.error(`check-timo-version failed: ${err.message}`);
  process.exit(1);
});
