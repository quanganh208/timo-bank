# @timo-bank/nestjs

NestJS module for Timo Bank SDK integration.

> **Warning**: This is an unofficial package. See [DISCLAIMER](../../DISCLAIMER.md).

## Installation

```bash
npm install @timo-bank/core @timo-bank/nestjs
```

## Setup

First, run the core setup CLI:

```bash
npx @timo-bank/core setup
```

Add the credential token to your `.env`:

```env
TIMO_CREDENTIALS=timo_v1_eyJ1c2VybmFtZSI6...
```

## Usage

### Basic Setup

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
```

### Async Configuration

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TimoModule } from '@timo-bank/nestjs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TimoModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        credentials: config.get('TIMO_CREDENTIALS')!,
        autoLogin: true, // default
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Using the Client

```typescript
// payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectTimo, TimoClient } from '@timo-bank/nestjs';

@Injectable()
export class PaymentService {
  constructor(@InjectTimo() private readonly timo: TimoClient) {}

  async getBalance() {
    return this.timo.getBalance();
  }

  async getRecentTransactions() {
    return this.timo.getTransactions({
      limit: 10,
    });
  }
}
```

## Module Options

### TimoModuleOptions

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `credentials` | `string` | Yes | Credential token from CLI |
| `logger` | `Logger` | No | Custom logger |
| `autoLogin` | `boolean` | No | Auto-login on init (default: true) |

### TimoModuleAsyncOptions

| Option | Type | Description |
|--------|------|-------------|
| `imports` | `any[]` | Modules to import |
| `useFactory` | `Function` | Factory function |
| `useClass` | `Type` | Options provider class |
| `useExisting` | `Type` | Existing options provider |
| `inject` | `any[]` | Dependencies to inject |

## Exports

### From @timo-bank/nestjs

- `TimoModule` - Main NestJS module
- `InjectTimo()` - Decorator to inject TimoClient
- `TimoClient` - Re-exported from core
- Types: `Balance`, `Transaction`, `AccountInfo`, `UserProfile`

## Auto-Login

By default, the module automatically calls `client.login()` during initialization. This means your service can immediately use the client methods.

To disable auto-login:

```typescript
TimoModule.forRoot({
  credentials: process.env.TIMO_CREDENTIALS!,
  autoLogin: false,
}),
```

Then manually login when needed:

```typescript
@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(@InjectTimo() private readonly timo: TimoClient) {}

  async onModuleInit() {
    await this.timo.login();
  }
}
```

## License

MIT
