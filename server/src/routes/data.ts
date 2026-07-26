import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { DEFAULT_CATEGORIES } from '../lib/defaultCategories';

const router = Router();
router.use(requireAuth);

router.get('/export', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const [expenses, categories, budgetRows, balanceRows] = await Promise.all([
    prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.category.findMany({ where: { userId }, orderBy: { position: 'asc' } }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.balance.findMany({ where: { userId } }),
  ]);

  const budgets: Record<string, Record<string, number>> = {};
  budgetRows.forEach((b) => {
    if (!budgets[b.monthKey]) budgets[b.monthKey] = {};
    budgets[b.monthKey][b.key] = b.amount;
  });

  const balances: Record<string, { salaryCash: number; salaryBank: number; prevCash: number; prevBank: number }> = {};
  balanceRows.forEach((b) => {
    balances[b.monthKey] = { salaryCash: b.salaryCash, salaryBank: b.salaryBank, prevCash: b.prevCash, prevBank: b.prevBank };
  });

  res.json({
    expenses: expenses.map((e) => ({
      id: e.id, name: e.name, amount: e.amount, category: e.category, date: e.date, pay: e.pay, note: e.note,
    })),
    categories: categories.map((c) => ({ name: c.name, icon: c.icon, bg: c.bg })),
    budgets,
    balances,
    exported: new Date().toISOString(),
  });
});

const importSchema = z.object({
  expenses: z.array(z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
    category: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    pay: z.string().optional(),
    note: z.string().nullable().optional(),
  })).default([]),
  categories: z.array(z.object({
    name: z.string().min(1),
    icon: z.string().min(1),
    bg: z.string().min(1),
  })).optional(),
  budgets: z.record(z.string(), z.record(z.string(), z.number())).optional(),
  balances: z.record(z.string(), z.object({
    salaryCash: z.number().optional(),
    salaryBank: z.number().optional(),
    prevCash: z.number().optional(),
    prevBank: z.number().optional(),
  })).optional(),
});

// Replaces ALL of the current user's data with the imported dataset.
router.post('/import', async (req: AuthedRequest, res) => {
  const parsed = importSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'ملف غير صالح' });
  const { expenses, categories, budgets, balances } = parsed.data;
  const userId = req.userId!;

  await prisma.$transaction(async (tx) => {
    await tx.expense.deleteMany({ where: { userId } });
    await tx.budget.deleteMany({ where: { userId } });
    await tx.balance.deleteMany({ where: { userId } });

    if (categories && categories.length) {
      await tx.category.deleteMany({ where: { userId } });
      await tx.category.createMany({
        data: categories.map((c, i) => ({ ...c, userId, position: i })),
      });
    }

    if (expenses.length) {
      await tx.expense.createMany({
        data: expenses.map((e) => ({
          userId, name: e.name, amount: e.amount, category: e.category, date: e.date,
          pay: e.pay || 'نقداً', note: e.note || null,
        })),
      });
    }

    if (budgets) {
      const rows: { userId: string; monthKey: string; key: string; amount: number }[] = [];
      Object.entries(budgets).forEach(([monthKey, entries]) => {
        Object.entries(entries).forEach(([key, amount]) => {
          if (amount > 0) rows.push({ userId, monthKey, key, amount });
        });
      });
      if (rows.length) await tx.budget.createMany({ data: rows });
    }

    if (balances) {
      const rows = Object.entries(balances).map(([monthKey, b]) => ({
        userId, monthKey,
        salaryCash: b.salaryCash || 0, salaryBank: b.salaryBank || 0,
        prevCash: b.prevCash || 0, prevBank: b.prevBank || 0,
      }));
      if (rows.length) await tx.balance.createMany({ data: rows });
    }
  });

  res.json({ ok: true });
});

// Wipes all of the user's data and resets categories to the defaults.
router.post('/clear', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  await prisma.$transaction([
    prisma.expense.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
    prisma.balance.deleteMany({ where: { userId } }),
    prisma.category.deleteMany({ where: { userId } }),
  ]);
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c, i) => ({ ...c, userId, position: i })),
  });
  res.json({ ok: true });
});

export default router;
