# @timo-bank/core

Core SDK for Timo Bank API integration.

> **Warning**: This is an unofficial package. See [DISCLAIMER](../../DISCLAIMER.md).

## Installation

```bash
npm install @timo-bank/core
```

## Setup

Run the setup CLI to register your device:

```bash
npx @timo-bank/core setup
```

Follow the prompts to:
1. Enter your phone number
2. Enter your password
3. Verify with OTP

The CLI will output a credential token to add to your `.env`:

```env
TIMO_CREDENTIALS=timo_v1_eyJ1c2VybmFtZSI6...
```

## Usage

```typescript
import { TimoClient } from '@timo-bank/core';

const client = new TimoClient({
  credentials: process.env.TIMO_CREDENTIALS!,
  logger: console, // optional
});

// Login
await client.login();

// Get balance
const balance = await client.getBalance();
console.log(`Balance: ${balance.accountBalance} VND`);

// Get transactions
const transactions = await client.getTransactions({
  fromDate: '01/01/2026',
  toDate: '10/01/2026',
  limit: 10,
});

// Get account info
const info = await client.getAccountInfo();
const profile = await client.getUserProfile();

// Logout
await client.logout();
```

## API

### TimoClient

#### Constructor

```typescript
new TimoClient(options: TimoClientOptions)
```

Options:
- `credentials: string` - Credential token from CLI setup
- `logger?: Logger` - Optional logger interface

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `login()` | `Promise<void>` | Authenticate with Timo |
| `logout()` | `Promise<void>` | Clear session |
| `isAuthenticated()` | `boolean` | Check auth status |
| `getBalance()` | `Promise<Balance>` | Get account balance |
| `getTransactions(options?)` | `Promise<Transaction[]>` | Get transaction history |
| `getAccountInfo()` | `Promise<AccountInfo>` | Get account details |
| `getUserProfile()` | `Promise<UserProfile>` | Get user profile |

### Types

See main [README](../../README.md#types) for type definitions.

## Error Handling

```typescript
import { TimoClient, AuthError, ApiError } from '@timo-bank/core';

try {
  await client.login();
} catch (error) {
  if (error instanceof AuthError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof ApiError) {
    console.error('API error:', error.message, error.code);
  }
}
```

## License

MIT
