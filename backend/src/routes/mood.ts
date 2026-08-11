import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getMoodSuggestion } from '../services/moodSuggestion';

const router = Router();
const prisma = new PrismaClient();

// GET /api/mood/suggestion — devuelve sugerencia basada en moods recientes
router.get('/suggestion', authenticate, async (req: AuthRequest, res) => {
  try {
    const moodEntries = await prisma.entry.findMany({
      where: { userId: req.userId!, type: 'MOOD' },
      orderBy: { createdAt: 'desc' },
      take: 7,
    });

    const recentMoods = moodEntries
      .map((e) => {
        let meta: Record<string, unknown> | null = null;
        try { meta = e.metadata ? (JSON.parse(e.metadata) as Record<string, unknown>) : null; } catch { /* noop */ }
        const value = meta && typeof meta.escalaAnimo === 'number' ? meta.escalaAnimo : null;
        return value !== null ? { value, date: e.createdAt.toISOString() } : null;
      })
      .filter((m): m is { value: number; date: string } => m !== null);

    if (recentMoods.length === 0) {
      res.json({ suggestion: null, isStreak: false });
      return;
    }

    const result = await getMoodSuggestion(recentMoods);
    res.json(result);
  } catch (err) {
    console.error('Error en mood suggestion:', err);
    res.status(500).json({ error: 'Error al generar sugerencia' });
  }
});

export { router as moodRouter };
