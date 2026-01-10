[English](./README.md) | [Tiếng Việt](./README.vi.md)

# Ví dụ NestJS Timo

Ví dụ NestJS cơ bản sử dụng @timo-bank/nestjs.

## Thiết lập

1. Cài đặt dependencies:
```bash
pnpm install
```

2. Sao chép file môi trường:
```bash
cp .env.example .env
```

3. Chạy CLI setup để lấy credentials:
```bash
npx @timo-bank/core setup
```

4. Thêm token đã tạo vào `.env`

## Chạy

```bash
pnpm start:dev
```

## Endpoints

- `GET /payment/balance` - Lấy số dư tài khoản
- `GET /payment/transactions?limit=10` - Lấy lịch sử giao dịch
- `GET /payment/account` - Lấy thông tin tài khoản
