/**
 * Account balance information
 */
export interface Balance {
  accountNo: string;
  accountBalance: number;
  availableAmount: number;
}

/**
 * Transaction record
 */
export interface Transaction {
  refNo: string;
  txnAmount: number;
  txnDesc: string;
  txnTime: string;
  txnType: string;
  transactionTime?: string;
  txnBankName?: string;
  txnBankAccount?: string;
}

/**
 * Options for fetching transactions
 */
export interface TransactionOptions {
  fromDate?: string; // DD/MM/YYYY
  toDate?: string; // DD/MM/YYYY
  limit?: number;
}

/**
 * User account information
 */
export interface AccountInfo {
  userId: string;
  phoneNumber: string;
  accountNo?: string;
}

/**
 * User profile information
 */
export interface UserProfile {
  userId: string;
  phoneNumber: string;
  fullName?: string;
  email?: string;
}

/**
 * Account types from Timo API
 */
export type AccountType = 'spend' | 'goal' | 'term' | 'money_market' | 'credit' | 'split_bill' | 'insurance';

/**
 * Account information from /user/accountPreview
 */
export interface Account {
  no: string;
  accountType: string;
  type: AccountType;
  name: string;
  balance?: number;
  accountBalance?: number;
  availableAmount?: number;
}
