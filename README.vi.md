[English](./README.md) | [Tiếng Việt](./README.vi.md)

# timo-bank-unofficial

SDK TypeScript không chính thức để tích hợp API Timo Bank.

> **Cảnh báo**: Đây là package không chính thức. Vui lòng đọc [TUYÊN BỐ MIỄN TRỪ](./DISCLAIMER.vi.md) trước khi sử dụng.

## Packages

| Package | Mô tả |
|---------|-------|
| [@timo-bank/core](./packages/core) | SDK cốt lõi với CLI thiết lập |
| [@timo-bank/nestjs](./packages/nestjs) | Tích hợp module NestJS |

## Cài đặt

```bash
# Package cốt lõi (sử dụng độc lập)
npm install @timo-bank/core

# Tích hợp NestJS
npm install @timo-bank/core @timo-bank/nestjs
```

## Bắt đầu nhanh

### 1. Thiết lập thông tin xác thực

Chạy CLI thiết lập để đăng ký thiết bị:

```bash
npx @timo-bank/core setup
```

CLI sẽ:
- Yêu cầu nhập số điện thoại và mật khẩu
- Gửi OTP để xác minh thiết bị
- Tạo credential token

### 2. Cấu hình môi trường

Thêm token đã tạo vào file `.env`:

```env
TIMO_CREDENTIALS=timo_v1_eyJ1c2VybmFtZSI6...
```

### 3. Sử dụng SDK

#### Sử dụng độc lập

```typescript
import { TimoClient } from '@timo-bank/core';

const client = new TimoClient({
  credentials: process.env.TIMO_CREDENTIALS!,
  // accountNo được tự động lấy sau khi đăng nhập, nhưng có thể ghi đè:
  // accountNo: '1234567890123',
});

// Tự động đăng nhập (tự động lấy accountNo)
await client.login();
const balance = await client.getBalance();
console.log(`Số dư: ${balance.accountBalance} VND`);

// Lấy lịch sử giao dịch
const transactions = await client.getTransactions({
  fromDate: '01/01/2026',
  toDate: '10/01/2026',
  limit: 10,
});
```

#### Tích hợp NestJS

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

## Tham chiếu API

### TimoClient

```typescript
class TimoClient {
  constructor(options: TimoClientOptions);

  // Xác thực
  login(): Promise<void>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;

  // Tài khoản
  getAccountInfo(): Promise<AccountInfo>;
  getUserProfile(): Promise<UserProfile>;

  // Số dư & Giao dịch
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
  fromDate?: string;  // Định dạng DD/MM/YYYY
  toDate?: string;    // Định dạng DD/MM/YYYY
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

## Bảo mật

- Thông tin xác thực được lưu dưới dạng hash
- Fingerprinting thiết bị để xác thực
- Tất cả API calls sử dụng HTTPS
- Token phải được giữ bí mật (không commit vào git)

## Yêu cầu

- Node.js >= 18.0.0
- Tài khoản Timo Bank đang hoạt động

## Giấy phép

MIT - Xem [LICENSE](./LICENSE)

## Tuyên bố miễn trừ

Xem [DISCLAIMER.vi.md](./DISCLAIMER.vi.md) để biết các thông báo pháp lý quan trọng.
