import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { DEFAULT_CATEGORIES } from '../lib/defaultCategories';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  name: z.string().trim().min(1),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'بيانات غير صالحة' });
  }
  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      categories: {
        create: DEFAULT_CATEGORIES.map((c, i) => ({ ...c, position: i })),
      },
    },
  });

  const token = signToken({ userId: user.id });
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'بيانات غير صالحة' });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  const token = signToken({ userId: user.id });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

export default router;
