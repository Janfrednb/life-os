import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

function parseLocalDate(localDate?: string): Date {
  if (localDate && /^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    return new Date(localDate + 'T00:00:00.000Z');
  }
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

// Lista todos los hábitos con estado de completado hoy y racha actual
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const today = parseLocalDate(req.query.localDate as string | undefined);
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId! },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 365,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = habits.map((h) => {
      const completedToday = h.completions.some(
        (c) => c.date >= startOfDay(today) && c.date <= endOfDay(today),
      );
      const dates = h.completions.map((c) => c.date);
      const streak = calcStreak(dates, today);
      const maxStreak = calcMaxStreak(dates);
      return { ...h, completedToday, streak, maxStreak };
    });

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error al obtener hábitos' });
  }
});

function calcStreak(dates: Date[], today: Date): number {
  if (dates.length === 0) return 0;
  const days = new Set(dates.map((d) => startOfDay(d).getTime()));
  let streak = 0;
  const check = new Date(startOfDay(today));
  while (days.has(check.getTime())) {
    streak++;
    check.setUTCDate(check.getUTCDate() - 1);
  }
  return streak;
}

function calcMaxStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates.map((d) => startOfDay(d).getTime()))].sort((a, b) => a - b);
  let max = 1;
  let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = (sorted[i] - sorted[i - 1]) / 86_400_000;
    if (diffDays === 1) {
      cur++;
      if (cur > max) max = cur;
    } else {
      cur = 1;
    }
  }
  return max;
}

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, targetPerWeek } = req.body;
    if (!name) {
      res.status(400).json({ error: 'name es requerido' });
      return;
    }
    const habit = await prisma.habit.create({
      data: { name, targetPerWeek: targetPerWeek ?? 7, userId: req.userId! },
    });
    res.status(201).json({ ...habit, completedToday: false, streak: 0, maxStreak: 0 });
  } catch {
    res.status(500).json({ error: 'Error al crear hábito' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const habit = await prisma.habit.findFirst({ where: { id, userId: req.userId! } });
    if (!habit) {
      res.status(404).json({ error: 'Hábito no encontrado' });
      return;
    }
    await prisma.habitCompletion.deleteMany({ where: { habitId: id } });
    await prisma.habit.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar hábito' });
  }
});

// Marcar hábito como completado hoy
router.post('/:id/complete', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const today = parseLocalDate(req.body.localDate);

    const habit = await prisma.habit.findFirst({ where: { id, userId: req.userId! } });
    if (!habit) {
      res.status(404).json({ error: 'Hábito no encontrado' });
      return;
    }

    const existing = await prisma.habitCompletion.findFirst({
      where: { habitId: id, date: { gte: startOfDay(today), lte: endOfDay(today) } },
    });
    if (existing) {
      res.status(409).json({ error: 'Ya completado hoy' });
      return;
    }

    const completion = await prisma.habitCompletion.create({
      data: { habitId: id, date: startOfDay(today) },
    });
    res.status(201).json(completion);
  } catch {
    res.status(500).json({ error: 'Error al completar hábito' });
  }
});

// Desmarcar hábito de hoy
router.delete('/:id/complete', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const today = parseLocalDate(req.query.localDate as string | undefined);

    const habit = await prisma.habit.findFirst({ where: { id, userId: req.userId! } });
    if (!habit) {
      res.status(404).json({ error: 'Hábito no encontrado' });
      return;
    }

    await prisma.habitCompletion.deleteMany({
      where: { habitId: id, date: { gte: startOfDay(today), lte: endOfDay(today) } },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error al desmarcar hábito' });
  }
});

export { router as habitsRouter };
