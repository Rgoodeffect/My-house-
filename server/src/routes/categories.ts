import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { CATEGORY_BG_COLORS } from '../lib/defaultCategories';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId! },
    orderBy: { position: 'asc' },
  });
  res.json({ categories });
});

const createSchema = z.object({
  name: z.string().trim().min(1),
  icon: z.string().trim().min(1),
});

router.post('/', async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'بيانات غير صالحة' });
  const { name, icon } = parsed.data;

  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId: req.userId!, name } },
  });
  if (existing) return res.status(409).json({ error: 'هذه الفئة موجودة مسبقاً' });

  const count = await prisma.category.count({ where: { userId: req.userId! } });
  const category = await prisma.category.create({
    data: {
      userId: req.userId!,
      name,
      icon,
      bg: CATEGORY_BG_COLORS[count % CATEGORY_BG_COLORS.length],
      position: count,
    },
  });
  res.status(201).json({ category });
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const count = await prisma.category.count({ where: { userId: req.userId! } });
  if (count <= 1) {
    return res.status(400).json({ error: 'يجب أن تبقى فئة واحدة على الأقل' });
  }
  const category = await prisma.category.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!category) return res.status(404).json({ error: 'الفئة غير موجودة' });

  await prisma.category.delete({ where: { id: category.id } });
  res.json({ ok: true });
});

export default router;
