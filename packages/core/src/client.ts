import { HttpClient } from './http/client.js';
import { buildSessionHeaders } from './http/headers.js';
import { LoginManager } from './auth/login.js';
import type { SessionData } from './auth/login.js';
import { parseCredentialToken } from './credentials/parser.js';
import { fetchBalance } from './api/balance.js';
import { fetchTransactions } from './api/transaction.js';
import { fetchUserProfile, fetchSpendAccountNo } from './api/account.js';
import type { TimoClientOptions, CredentialData, Logger } from './types/config.js';
import type { Balance, Transaction, TransactionOptions, AccountInfo, UserProfile } from './types/models.js';
import { AuthError } from './errors/classes.js';

/**
 * Main Timo Bank client
 */
export class TimoClient {
  private readonly credentials: CredentialData;
  private readonly httpClient: HttpClient;
  private readonly logger?: Logger;
  private session: SessionData | null = null;
  private accountNo: string | null = null;

  constructor(options: TimoClientOptions) {
    this.credentials = parseCredentialToken(options.credentials);
    this.httpClient = new HttpClient();
    this.logger = options.logger;
    this.accountNo = options.accountNo ?? null;
  }

  /**
   * Login to Timo Bank
   * Uses saved device credentials for automatic login without OTP
   */
  async login(): Promise<void> {
    const loginManager = new LoginManager(
      this.credentials.deviceId,
      this.credentials.browserSignature,
      this.httpClient
    );

    // Login using saved credentials (should not require OTP with valid timoDeviceId)
    const result = await loginManager.login(this.credentials.username, this.credentials.password);

    if (!result.success) {
      throw new AuthError(
        `Device requires re-authorization. OTP type: ${result.otpRequired.type}. ` +
          'Run "npx @timo-bank/core setup" to re-authorize this device.'
      );
    }

    this.session = result.session;
    this.logger?.info('Login successful', { userId: this.session.userId });

    // Fetch account number for API calls
    await this.fetchAccountNumber();
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    this.session = null;
    this.accountNo = null;
    this.logger?.info('Logged out');
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return this.session !== null;
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<Balance> {
    await this.ensureAuthenticated();

    if (!this.accountNo) {
      throw new AuthError('Account number not available');
    }

    return fetchBalance(this.httpClient, this.accountNo, this.getSessionHeaders());
  }

  /**
   * Get transaction history
   */
  async getTransactions(options?: TransactionOptions): Promise<Transaction[]> {
    await this.ensureAuthenticated();

    if (!this.accountNo) {
      throw new AuthError('Account number not available');
    }

    return fetchTransactions(this.httpClient, this.accountNo, this.getSessionHeaders(), options);
  }

  /**
   * Get account information
   * Uses fetchUserProfile internally, adds accountNo from options/session
   */
  async getAccountInfo(): Promise<AccountInfo> {
    await this.ensureAuthenticated();

    // Try to fetch from API first
    const profile = await fetchUserProfile(this.httpClient, this.getSessionHeaders());

    if (profile) {
      return {
        userId: profile.userId,
        phoneNumber: profile.phoneNumber,
        accountNo: this.accountNo ?? undefined,
      };
    }

    // Fallback to session data
    if (this.session) {
      return {
        userId: String(this.session.userId),
        phoneNumber: this.session.phoneNumber,
        accountNo: this.accountNo ?? undefined,
      };
    }

    throw new AuthError('Failed to fetch account info');
  }

  /**
   * Get user profile
   * Note: /user API may not be available, returns basic info from session
   */
  async getUserProfile(): Promise<UserProfile> {
    await this.ensureAuthenticated();

    // Try to fetch from API first
    const profile = await fetchUserProfile(this.httpClient, this.getSessionHeaders());

    if (profile) {
      return profile;
    }

    // Fallback to session data
    if (this.session) {
      return {
        userId: String(this.session.userId),
        phoneNumber: this.session.phoneNumber,
      };
    }

    throw new AuthError('Failed to fetch user profile');
  }

  /**
   * Ensure client is authenticated, login if needed
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.session) {
      await this.login();
    }
  }

  /**
   * Get session headers for API requests
   */
  private getSessionHeaders() {
    if (!this.session) {
      throw new AuthError('Not authenticated');
    }

    return buildSessionHeaders(
      this.session.token,
      this.session.timoDeviceId,
      this.session.contextId,
      this.credentials.browserSignature
    );
  }

  /**
   * Fetch and store account number from /user/accountPreview
   * Falls back to provided accountNo in options if API fails
   */
  private async fetchAccountNumber(): Promise<void> {
    // Skip if already set via options
    if (this.accountNo) {
      this.logger?.debug('Using provided account number', { accountNo: this.accountNo });
      return;
    }

    try {
      const accountNo = await fetchSpendAccountNo(this.httpClient, this.getSessionHeaders());
      if (accountNo) {
        this.accountNo = accountNo;
        this.logger?.debug('Account number fetched from API', { accountNo });
      } else {
        this.logger?.warn('No Spend Account found. Provide accountNo in options.');
      }
    } catch {
      this.logger?.warn('Failed to fetch account number. Provide accountNo in options.');
    }
  }
}
