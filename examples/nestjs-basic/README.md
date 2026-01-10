[English](./README.md) | [Tiếng Việt](./README.vi.md)

# NestJS Timo Example

Basic NestJS example using @timo-bank/nestjs.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Run CLI setup to get credentials:
```bash
npx @timo-bank/core setup
```

4. Add the generated token to `.env`

## Run

```bash
pnpm start:dev
```

## Endpoints

- `GET /payment/balance` - Get account balance
- `GET /payment/transactions?limit=10` - Get transactions
- `GET /payment/account` - Get account info
