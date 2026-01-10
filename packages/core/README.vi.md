[English](./README.md) | [Tiếng Việt](./README.vi.md)

# @timo-bank/core

SDK cốt lõi để tích hợp API Timo Bank.

> **Cảnh báo**: Đây là package không chính thức. Xem [TUYÊN BỐ MIỄN TRỪ](../../DISCLAIMER.vi.md).

## Cài đặt

```bash
npm install @timo-bank/core
```

## Thiết lập

Chạy CLI thiết lập để đăng ký thiết bị:

```bash
npx @timo-bank/core setup
```

Làm theo hướng dẫn để:
1. Nhập số điện thoại
2. Nhập mật khẩu
3. Xác minh bằng OTP

CLI sẽ xuất credential token để thêm vào file `.env`:

```env
TIMO_CREDENTIALS=timo_v1_eyJ1c2VybmFtZSI6...
```

## Sử dụng

```typescript
import { TimoClient } from '@timo-bank/core';

const client = new TimoClient({
  credentials: process.env.TIMO_CREDENTIALS!,
  logger: console, // tùy chọn
});

// Đăng nhập
await client.login();

// Lấy số dư
const balance = await client.getBalance();
console.log(`Số dư: ${balance.accountBalance} VND`);

// Lấy lịch sử giao dịch
const transactions = await client.getTransactions({
  fromDate: '01/01/2026',
  toDate: '10/01/2026',
  limit: 10,
});

// Lấy thông tin tài khoản
const info = await client.getAccountInfo();
const profile = await client.getUserProfile();

// Đăng xuất
await client.logout();
```

## API

### TimoClient

#### Constructor

```typescript
new TimoClient(options: TimoClientOptions)
```

Options:
- `credentials: string` - Credential token từ CLI setup
- `logger?: Logger` - Logger interface tùy chọn

#### Methods

| Method | Returns | Mô tả |
|--------|---------|-------|
| `login()` | `Promise<void>` | Xác thực với Timo |
| `logout()` | `Promise<void>` | Xóa session |
| `isAuthenticated()` | `boolean` | Kiểm tra trạng thái xác thực |
| `getBalance()` | `Promise<Balance>` | Lấy số dư tài khoản |
| `getTransactions(options?)` | `Promise<Transaction[]>` | Lấy lịch sử giao dịch |
| `getAccountInfo()` | `Promise<AccountInfo>` | Lấy chi tiết tài khoản |
| `getUserProfile()` | `Promise<UserProfile>` | Lấy hồ sơ người dùng |

### Types

Xem [README chính](../../README.vi.md#types) để biết định nghĩa types.

## Xử lý lỗi

```typescript
import { TimoClient, AuthError, ApiError } from '@timo-bank/core';

try {
  await client.login();
} catch (error) {
  if (error instanceof AuthError) {
    console.error('Xác thực thất bại:', error.message);
  } else if (error instanceof ApiError) {
    console.error('Lỗi API:', error.message, error.code);
  }
}
```

## Giấy phép

MIT
