import { createHash, randomUUID } from 'node:crypto';
import { ENCRYPTION_KEY_SEED } from './constants.js';

/**
 * Generate SHA256 hash
 */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Generate SHA512 hash
 */
export function sha512(input: string): string {
  return createHash('sha512').update(input).digest('hex');
}

/**
 * Get derived encryption key (first 16 chars of SHA256 of seed)
 */
export function getEncryptionKey(): string {
  return sha256(ENCRYPTION_KEY_SEED).substring(0, 16);
}

/**
 * Generate a cryptographically secure UUID v4
 */
export function generateUUID(): string {
  return randomUUID();
}
