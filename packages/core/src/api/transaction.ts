import { HttpClient } from '../http/client.js';
import type { SessionHeaders } from '../http/headers.js';
import type { Transaction, TransactionOptions } from '../types/models.js';
import type { TransactionListResponseData, TransactionItem } from '../types/api.js';
import { ACCOUNT_TYPE_SPEND } from '../utils/constants.js';

/**
 * Format a date as DD/MM/YYYY for Timo API
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get default date range (last 30 days)
 */
function getDefaultDateRange(): { fromDate: string; toDate: string } {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    fromDate: formatDate(thirtyDaysAgo),
    toDate: formatDate(today),
  };
}

/**
 * Map API transaction item to Transaction model
 */
function mapTransaction(item: TransactionItem): Transaction {
  return {
    refNo: item.refNo,
    txnAmount: item.txnAmount,
    txnDesc: item.txnDesc,
    txnTime: item.txnTime,
    txnType: item.txnType,
    transactionTime: item.transactionTime,
    txnBankName: item.txnBankName,
    txnBankAccount: item.txnBankAccount,
  };
}

/**
 * Fetch transaction history
 */
export async function fetchTransactions(
  httpClient: HttpClient,
  accountNo: string,
  sessionHeaders: SessionHeaders,
  options?: TransactionOptions
): Promise<Transaction[]> {
  const dateRange = getDefaultDateRange();

  const payload = {
    format: 'group',
    index: 0,
    offset: -1,
    accountNo,
    accountType: ACCOUNT_TYPE_SPEND,
    fromDate: options?.fromDate ?? dateRange.fromDate,
    toDate: options?.toDate ?? dateRange.toDate,
  };

  const response = await httpClient.post<TransactionListResponseData>(
    '/user/account/transaction/list',
    payload,
    { headers: sessionHeaders }
  );

  if (!response.success || !response.data) {
    return [];
  }

  // Flatten grouped transactions
  const allTransactions: Transaction[] = [];
  for (const group of response.data.items ?? []) {
    for (const item of group.item ?? []) {
      allTransactions.push(mapTransaction(item));
    }
  }

  // Apply limit if specified
  if (options?.limit && options.limit > 0) {
    return allTransactions.slice(0, options.limit);
  }

  return allTransactions;
}
