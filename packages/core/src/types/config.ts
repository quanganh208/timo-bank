/**
 * Credential data stored in the timo_v1 token
 */
export interface CredentialData {
  username: string;
  password: string; // SHA512 hashed
  deviceId: string;
  timoDeviceId: string;
  browserSignature: string;
  createdAt: string;
}

/**
 * Options for creating a TimoClient instance
 */
export interface TimoClientOptions {
  /** Credential token in format: timo_v1_<base64> */
  credentials: string;
  /** Account number (optional - will try to fetch if not provided) */
  accountNo?: string;
  /** Callback when session expires and re-login is needed */
  onSessionExpired?: () => void;
  /** Optional logger for debugging */
  logger?: Logger;
}

/**
 * Logger interface for custom logging
 */
export interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}
