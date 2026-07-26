import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const monthKeyRegex = /^\d{4}-\d{2}$/;

// Returns { total?: number, [categoryName]: number } for the given month
router.get('/', async (req: AuthedRequest, res) => {
  const month = String(req.query.month || '');
  if (!monthKeyRegex.test(month)) return res.status(400).json({ error: 'شهر غير صالح' });

  const rows = await prisma.budget.findMany({ where: { userId: req.userId!, monthKey: month } });
  const budget: Record<string, number> = {};
  rows.forEach((r) => { budget[r.key] = r.amount; });
  res.json({ month, budget });
});

const putSchema = z.object({
  month: z.string().regex(monthKeyRegex),
  entries: z.record(z.string(), z.number()),
});

// Replaces the full set of budget entries for a month (total + per-category limits).
// Keys with amount <= 0 are removed.
router.put('/', async (req: AuthedRequest, res) => {
  const parsed = putSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'بيانات غير صالحة' });
  const { month, entries } = parsed.data;
  const userId = req.userId!;

  const positiveKeys = Object.entries(entries).filter(([, v]) => v > 0);

  await prisma.$transaction([
    prisma.budget.deleteMany({ where: { userId, monthKey: month } }),
    ...positiveKeys.map(([key, amount]) =>
      prisma.budget.create({ data: { userId, monthKey: month, key, amount } })
    ),
  ]);

  const budget: Record<string, number> = {};
  positiveKeys.forEach(([k, v]) => { budget[k] = v; });
  res.json({ month, budget });
});

export default router;
