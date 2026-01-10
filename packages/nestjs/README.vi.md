[English](./README.md) | [Tiếng Việt](./README.vi.md)

# @timo-bank/nestjs

Module NestJS để tích hợp SDK Timo Bank.

> **Cảnh báo**: Đây là package không chính thức. Xem [TUYÊN BỐ MIỄN TRỪ](../../DISCLAIMER.vi.md).

## Cài đặt

```bash
npm install @timo-bank/core @timo-bank/nestjs
```

## Thiết lập

Trước tiên, chạy CLI thiết lập core:

```bash
npx @timo-bank/core setup
```

Thêm credential token vào file `.env`:

```env
TIMO_CREDENTIALS=timo_v1_eyJ1c2VybmFtZSI6...
```

## Sử dụng

### Thiết lập cơ bản

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

### Cấu hình bất đồng bộ

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
        autoLogin: true, // mặc định
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Sử dụng Client

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

| Option | Type | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `credentials` | `string` | Có | Credential token từ CLI |
| `logger` | `Logger` | Không | Logger tùy chỉnh |
| `autoLogin` | `boolean` | Không | Tự động đăng nhập khi khởi tạo (mặc định: true) |

### TimoModuleAsyncOptions

| Option | Type | Mô tả |
|--------|------|-------|
| `imports` | `any[]` | Modules cần import |
| `useFactory` | `Function` | Factory function |
| `useClass` | `Type` | Options provider class |
| `useExisting` | `Type` | Existing options provider |
| `inject` | `any[]` | Dependencies cần inject |

## Exports

### Từ @timo-bank/nestjs

- `TimoModule` - Module NestJS chính
- `InjectTimo()` - Decorator để inject TimoClient
- `TimoClient` - Re-export từ core
- Types: `Balance`, `Transaction`, `AccountInfo`, `UserProfile`

## Auto-Login

Mặc định, module tự động gọi `client.login()` trong quá trình khởi tạo. Điều này có nghĩa service của bạn có thể sử dụng ngay các phương thức của client.

Để tắt auto-login:

```typescript
TimoModule.forRoot({
  credentials: process.env.TIMO_CREDENTIALS!,
  autoLogin: false,
}),
```

Sau đó đăng nhập thủ công khi cần:

```typescript
@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(@InjectTimo() private readonly timo: TimoClient) {}

  async onModuleInit() {
    await this.timo.login();
  }
}
```

## Giấy phép

MIT
