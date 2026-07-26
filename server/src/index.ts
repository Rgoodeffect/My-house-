import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import expenseRoutes from './routes/expenses';
import budgetRoutes from './routes/budgets';
import balanceRoutes from './routes/balances';
import dataRoutes from './routes/data';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/data', dataRoutes);

app.use((_req, res) => res.status(404).json({ error: 'غير موجود' }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'خطأ في الخادم' });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
