import { HttpClient } from '../http/client.js';
import type { SessionHeaders } from '../http/headers.js';
import type { UserProfile, Account, AccountType } from '../types/models.js';

/** Account type mapping from API codes */
const ACCOUNT_TYPE_MAP: Record<string, AccountType> = {
  '1025': 'spend',
  '1026': 'goal',
  '1027': 'term',
  '1028': 'money_market',
  '9999': 'credit',
  '1910': 'split_bill',
  '6511': 'insurance',
};

interface AccountPreviewItem {
  no: string;
  accountType: string;
  name: string;
  balance?: number;
  accountBalance?: number;
  availableAmount?: number;
}

interface AccountPreviewResponse {
  accounts: AccountPreviewItem[];
}

interface ProfileResponseData {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  legalId?: string;
  cityName?: string;
  address?: string;
  birthday?: string;
  gender?: string;
}

/**
 * Fetch user profile from /user/getProfile
 * Note: accountNo is not available from this API - must be provided via options
 */
export async function fetchUserProfile(
  httpClient: HttpClient,
  sessionHeaders: SessionHeaders
): Promise<UserProfile | null> {
  const response = await httpClient.get<ProfileResponseData>('/user/getProfile', {
    headers: sessionHeaders,
  });

  if (!response.success || !response.data) {
    return null;
  }

  const data = response.data;
  const fullName = `${data.firstName} ${data.lastName}`.trim();

  return {
    userId: String(data.userId),
    phoneNumber: data.phone,
    fullName: fullName || undefined,
    email: data.email,
  };
}

/**
 * Fetch all accounts from /user/accountPreview
 * Returns list of all user accounts (spend, goal, term, etc.)
 */
export async function fetchAccounts(
  httpClient: HttpClient,
  sessionHeaders: SessionHeaders
): Promise<Account[]> {
  const response = await httpClient.get<AccountPreviewResponse>('/user/accountPreview', {
    headers: sessionHeaders,
  });

  if (!response.success || !response.data?.accounts) {
    return [];
  }

  return response.data.accounts
    .filter((item) => item.no) // Only include accounts with a number
    .map((item) => ({
      no: item.no,
      accountType: item.accountType,
      type: ACCOUNT_TYPE_MAP[item.accountType] ?? 'spend',
      name: item.name,
      balance: item.balance,
      accountBalance: item.accountBalance,
      availableAmount: item.availableAmount,
    }));
}

/**
 * Fetch spend account number from /user/accountPreview
 * Returns the main Spend Account number (accountType: 1025)
 */
export async function fetchSpendAccountNo(
  httpClient: HttpClient,
  sessionHeaders: SessionHeaders
): Promise<string | null> {
  const accounts = await fetchAccounts(httpClient, sessionHeaders);
  const spendAccount = accounts.find((a) => a.type === 'spend');
  return spendAccount?.no ?? null;
}
