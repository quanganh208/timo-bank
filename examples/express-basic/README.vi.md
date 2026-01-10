[English](./README.md) | [Tiếng Việt](./README.vi.md)

# Ví dụ Express Timo

Ví dụ Express cơ bản sử dụng @timo-bank/core.

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
pnpm dev
```

## Endpoints

- `GET /balance` - Lấy số dư tài khoản
- `GET /transactions?limit=10` - Lấy lịch sử giao dịch
- `GET /account` - Lấy thông tin tài khoản
