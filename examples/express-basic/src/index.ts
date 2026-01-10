import express from 'express';
import { TimoClient } from '@timo-bank/core';

const app = express();
const port = 3000;

// Initialize Timo client
const timo = new TimoClient({
  credentials: process.env.TIMO_CREDENTIALS!,
});

// Login on startup
await timo.login();
console.log('Timo client authenticated');

// Routes
app.get('/balance', async (req, res) => {
  try {
    const balance = await timo.getBalance();
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const transactions = await timo.getTransactions({ limit });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/account', async (req, res) => {
  try {
    const info = await timo.getAccountInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
