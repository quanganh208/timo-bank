# Express Timo Example

Basic Express example using @timo-bank/core.

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
pnpm dev
```

## Endpoints

- `GET /balance` - Get account balance
- `GET /transactions?limit=10` - Get transactions
- `GET /account` - Get account info
