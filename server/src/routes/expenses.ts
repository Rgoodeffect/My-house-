import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const { month, from, to } = req.query as { month?: string; from?: string; to?: string };
  const where: any = { userId: req.userId! };
  if (month) {
    where.date = { startsWith: month };
  } else if (from && to) {
    where.date = { gte: from, lte: to };
  }
  const expenses = await prisma.expense.findMany({
    where,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });
  res.json({ expenses });
});

const expenseSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.number().positive(),
  category: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pay: z.string().trim().min(1).default('نقداً'),
  note: z.string().trim().optional().nullable(),
});

router.post('/', async (req: AuthedRequest, res) => {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'بيانات غير صالحة' });
  const expense = await prisma.expense.create({
    data: { ...parsed.data, note: parsed.data.note || null, userId: req.userId! },
  });
  res.status(201).json({ expense });
});

router.put('/:id', async (req: AuthedRequest, res) => {
  const parsed = expenseSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'بيانات غير صالحة' });

  const existing = await prisma.expense.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: 'المصروف غير موجود' });

  const expense = await prisma.expense.update({
    where: { id: existing.id },
    data: parsed.data,
  });
  res.json({ expense });
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const existing = await prisma.expense.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: 'المصروف غير موجود' });

  await prisma.expense.delete({ where: { id: existing.id } });
  res.json({ ok: true });
});

export default router;
