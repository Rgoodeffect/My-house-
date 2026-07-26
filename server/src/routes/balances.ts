import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const monthKeyRegex = /^\d{4}-\d{2}$/;

router.get('/', async (req: AuthedRequest, res) => {
  const month = String(req.query.month || '');
  if (!monthKeyRegex.test(month)) return res.status(400).json({ error: 'شهر غير صالح' });

  const row = await prisma.balance.findUnique({
    where: { userId_monthKey: { userId: req.userId!, monthKey: month } },
  });
  res.json({
    month,
    balance: row
      ? { salaryCash: row.salaryCash, salaryBank: row.salaryBank, prevCash: row.prevCash, prevBank: row.prevBank }
      : { salaryCash: 0, salaryBank: 0, prevCash: 0, prevBank: 0 },
  });
});

const putSchema = z.object({
  month: z.string().regex(monthKeyRegex),
  salaryCash: z.number().min(0).default(0),
  salaryBank: z.number().min(0).default(0),
  prevCash: z.number().min(0).default(0),
  prevBank: z.number().min(0).default(0),
});

router.put('/', async (req: AuthedRequest, res) => {
  const parsed = putSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'بيانات غير صالحة' });
  const { month, salaryCash, salaryBank, prevCash, prevBank } = parsed.data;
  const userId = req.userId!;

  const row = await prisma.balance.upsert({
    where: { userId_monthKey: { userId, monthKey: month } },
    update: { salaryCash, salaryBank, prevCash, prevBank },
    create: { userId, monthKey: month, salaryCash, salaryBank, prevCash, prevBank },
  });
  res.json({
    month,
    balance: { salaryCash: row.salaryCash, salaryBank: row.salaryBank, prevCash: row.prevCash, prevBank: row.prevBank },
  });
});

export default router;
