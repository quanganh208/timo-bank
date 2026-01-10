import { HttpClient } from '../http/client.js';
import type { SessionHeaders } from '../http/headers.js';
import type { Balance } from '../types/models.js';
import type { TransactionListResponseData } from '../types/api.js';
import { ACCOUNT_TYPE_SPEND } from '../utils/constants.js';
import { ApiError } from '../errors/classes.js';

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
 * Fetch account balance via transaction list endpoint
 */
export async function fetchBalance(
  httpClient: HttpClient,
  accountNo: string,
  sessionHeaders: SessionHeaders
): Promise<Balance> {
  // Use transaction list endpoint to get balance info
  const today = new Date();
  const payload = {
    format: 'group',
    index: 0,
    offset: -1,
    accountNo,
    accountType: ACCOUNT_TYPE_SPEND,
    fromDate: formatDate(today),
    toDate: formatDate(today),
  };

  const response = await httpClient.post<TransactionListResponseData>(
    '/user/account/transaction/list',
    payload,
    { headers: sessionHeaders }
  );

  if (!response.success || !response.data) {
    throw new ApiError('Failed to fetch balance', response.code);
  }

  return {
    accountNo,
    accountBalance: response.data.accountBalance ?? 0,
    availableAmount: response.data.availableAmount ?? 0,
  };
}
