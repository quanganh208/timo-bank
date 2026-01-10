import * as readline from 'node:readline';
import { LoginManager } from '../auth/login.js';
import { generateDeviceCredentials } from '../auth/device.js';
import { encodeCredentials } from '../credentials/encoder.js';
import { sha512 } from '../utils/crypto.js';
import type { CredentialData } from '../types/config.js';

/**
 * Create a readline interface for user input
 */
function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompt user for input
 */
async function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Prompt for password with masking (shows * for each character)
 */
async function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);

    let password = '';

    // Use raw mode for character-by-character input
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onData = (char: string): void => {
      char = char.toString();

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
          }
          process.stdin.removeListener('data', onData);
          process.stdin.pause();
          console.log(); // New line
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          console.log();
          process.exit();
          break;
        case '\u007F': // Backspace
        case '\b':
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b'); // Erase last *
          }
          break;
        default:
          if (char.charCodeAt(0) >= 32) { // Printable characters only
            password += char;
            process.stdout.write('*');
          }
          break;
      }
    };

    process.stdin.on('data', onData);
  });
}

/**
 * Print colored output
 */
function print(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info'): void {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    reset: '\x1b[0m',
  };

  console.log(`${colors[type]}${message}${colors.reset}`);
}

/**
 * Run the setup CLI
 */
export async function runSetup(): Promise<void> {
  const rl = createInterface();

  console.log('\n');
  print('=================================', 'info');
  print('   Timo Bank SDK Setup', 'info');
  print('=================================', 'info');
  console.log('\n');

  print('This tool will register your device and generate a credential token.', 'info');
  print('The token should be stored securely as an environment variable.\n', 'warn');

  try {
    // Get user credentials
    const username = await prompt(rl, 'Phone number: ');
    if (!username) {
      print('Phone number is required', 'error');
      rl.close();
      process.exit(1);
    }

    rl.close(); // Close readline for password input
    const password = await promptPassword('Password: ');
    if (!password) {
      print('Password is required', 'error');
      process.exit(1);
    }

    // Generate device credentials
    print('\nGenerating device credentials...', 'info');
    const deviceCreds = generateDeviceCredentials();

    // Hash password
    const hashedPassword = sha512(password);

    // Create login manager
    const loginManager = new LoginManager(
      deviceCreds.deviceId,
      deviceCreds.browserSignature
    );

    // Attempt login
    print('Connecting to Timo Bank...', 'info');
    const loginResult = await loginManager.login(username, hashedPassword);

    if (loginResult.success) {
      // Direct login success (rare for new device)
      const credentialData: CredentialData = {
        username,
        password: hashedPassword,
        deviceId: deviceCreds.deviceId,
        timoDeviceId: loginResult.session.timoDeviceId,
        browserSignature: deviceCreds.browserSignature,
        createdAt: new Date().toISOString(),
      };

      outputCredentials(credentialData);
    } else {
      // OTP required
      print('\nOTP sent to your registered phone or email', 'success');

      const rlOtp = createInterface();
      const otp = await prompt(rlOtp, 'Enter OTP: ');
      rlOtp.close();

      if (!otp) {
        print('OTP is required', 'error');
        process.exit(1);
      }

      print('\nVerifying OTP...', 'info');

      let session;
      if (loginResult.otpRequired.type === 'device') {
        session = await loginManager.verifyDeviceOtp(
          otp,
          loginResult.otpRequired.refNo,
          loginResult.otpRequired.token
        );
      } else {
        session = await loginManager.verifyTwoFactorOtp(
          otp,
          loginResult.otpRequired.refNo,
          loginResult.otpRequired.token
        );
      }

      const credentialData: CredentialData = {
        username,
        password: hashedPassword,
        deviceId: deviceCreds.deviceId,
        timoDeviceId: session.timoDeviceId,
        browserSignature: deviceCreds.browserSignature,
        createdAt: new Date().toISOString(),
      };

      outputCredentials(credentialData);
    }
  } catch (error) {
    print(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    process.exit(1);
  }
}

/**
 * Output the credentials token
 */
function outputCredentials(data: CredentialData): void {
  const token = encodeCredentials(data);

  console.log('\n');
  print('=================================', 'success');
  print('   Setup Complete!', 'success');
  print('=================================', 'success');
  console.log('\n');

  print('Add this to your .env file:\n', 'info');
  console.log(`TIMO_CREDENTIALS=${token}`);
  console.log('\n');

  print('Usage example:', 'info');
  console.log(`
import { TimoClient } from '@timo-bank/core';

const client = new TimoClient({
  credentials: process.env.TIMO_CREDENTIALS!,
});

await client.login();
const balance = await client.getBalance();
console.log(balance);
`);

  print('Important: Keep your credentials token secure!', 'warn');
  console.log('\n');
}
