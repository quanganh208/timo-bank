/**
 * Base API response structure from Timo
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message?: string;
  data?: T;
}

/**
 * Login response data
 */
export interface LoginResponseData {
  token: string;
  userId: string;
  phoneNumber: string;
  timoDeviceId?: string;
  refNo?: string;
}

/**
 * Transaction list request payload
 */
export interface TransactionListRequest {
  format: string;
  index: number;
  offset: number;
  accountNo: string;
  accountType: string;
  fromDate: string; // DD/MM/YYYY
  toDate: string; // DD/MM/YYYY
}

/**
 * Transaction list response data
 */
export interface TransactionListResponseData {
  items: TransactionGroup[];
  accountBalance: number;
  availableAmount: number;
}

/**
 * Transaction group by date
 */
export interface TransactionGroup {
  date: string;
  item: TransactionItem[];
}

/**
 * Individual transaction item from API
 */
export interface TransactionItem {
  refNo: string;
  txnAmount: number;
  txnDesc: string;
  txnTime: string;
  txnType: string;
  transactionTime?: string;
  txnBankName?: string;
  txnBankAccount?: string;
}
