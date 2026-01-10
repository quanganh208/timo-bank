# timo-bank-unofficial

Unofficial TypeScript SDK for Timo Bank API integration.

> **Warning**: This is an unofficial package. Please read the [DISCLAIMER](./DISCLAIMER.md) before using.

## Packages

| Package | Description |
|---------|-------------|
| [@timo-bank/core](./packages/core) | Core SDK with CLI setup |
| [@timo-bank/nestjs](./packages/nestjs) | NestJS module integration |

## Installation

```bash
# Core package (standalone usage)
npm install @timo-bank/core

# NestJS integration
npm install @timo-bank/core @timo-bank/nestjs
```

## Quick Start

### 1. Setup Device Credentials

Run the setup CLI to register your device:

```bash
npx @timo-bank/core setup
```

This will:
- Prompt for phone number and password
- Send OTP for device verification
- Generate a credential token

### 2. Configure Environment

Add the generated token to your `.env` file:

```env
TIMO_CREDENTIALS=timo_v1_eyJ1c2VybmFtZSI6...
```

### 3. Use the SDK

#### Standalone Usage

```typescript
import { TimoClient } from '@timo-bank/core';

const client = new TimoClient({
  credentials: process.env.TIMO_CREDENTIALS!,
  // accountNo is auto-fetched after login, but can be overridden:
  // accountNo: '1234567890123',
});

// Auto-login (fetches accountNo automatically)
await client.login();
const balance = await client.getBalance();
console.log(`Balance: ${balance.accountBalance} VND`);

// Get transactions
const transactions = await client.getTransactions({
  fromDate: '01/01/2026',
  toDate: '10/01/2026',
  limit: 10,
});
```

#### NestJS Integration

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TimoModule } from '@timo-bank/nestjs';

@Module({
  imports: [
    TimoModule.forRoot({
      credentials: process.env.TIMO_CREDENTIALS!,
    }),
  ],
})
export class AppModule {}

// payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectTimo, TimoClient } from '@timo-bank/nestjs';

@Injectable()
export class PaymentService {
  constructor(@InjectTimo() private readonly timo: TimoClient) {}

  async getBalance() {
    return this.timo.getBalance();
  }
}
```

## API Reference

### TimoClient

```typescript
class TimoClient {
  constructor(options: TimoClientOptions);

  // Authentication
  login(): Promise<void>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;

  // Account
  getAccountInfo(): Promise<AccountInfo>;
  getUserProfile(): Promise<UserProfile>;

  // Balance & Transactions
  getBalance(): Promise<Balance>;
  getTransactions(options?: TransactionOptions): Promise<Transaction[]>;
}
```

### Types

```typescript
interface Balance {
  accountNo: string;
  accountBalance: number;
  availableAmount: number;
}

interface Transaction {
  refNo: string;
  txnAmount: number;
  txnDesc: string;
  txnTime: string;
  txnType: string;
  transactionTime?: string;
  txnBankName?: string;
  txnBankAccount?: string;
}

interface TransactionOptions {
  fromDate?: string;  // DD/MM/YYYY format
  toDate?: string;    // DD/MM/YYYY format
  limit?: number;
}

interface AccountInfo {
  userId: string;
  phoneNumber: string;
  accountNo?: string;
}

interface UserProfile {
  userId: string;
  phoneNumber: string;
  fullName?: string;
  email?: string;
}

type AccountType = 'spend' | 'goal' | 'term' | 'money_market' | 'credit' | 'split_bill' | 'insurance';

interface Account {
  no: string;
  accountType: string;
  type: AccountType;
  name: string;
  balance?: number;
  accountBalance?: number;
  availableAmount?: number;
}
```

## Security

- Credentials are stored in hashed format
- Device fingerprinting for authorization
- All API calls use HTTPS
- Tokens should be kept secret (never commit to git)

## Requirements

- Node.js >= 18.0.0
- Active Timo Bank account

## License

MIT - See [LICENSE](./LICENSE)

## Disclaimer

See [DISCLAIMER.md](./DISCLAIMER.md) for important legal notices.
