import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

function parseMeta(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { return null; }
}

function serializeMeta(meta: unknown): string | undefined {
  if (meta === undefined || meta === null) return undefined;
  return JSON.stringify(meta);
}

function toEntry(e: { id: string; type: string; content: string; metadata: string | null; createdAt: Date; userId: string }) {
  return { ...e, metadata: parseMeta(e.metadata), createdAt: e.createdAt.toISOString() };
}

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, from, to, limit } = req.query;

    const where: Record<string, unknown> = { userId: req.userId };
    if (type) where.type = type as string;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.gte = new Date(from as string);
      if (to) range.lte = new Date(to as string);
      where.createdAt = range;
    }

    const entries = await prisma.entry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.json(entries.map(toEntry));
  } catch {
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, content, metadata } = req.body;

    if (!type || content === undefined) {
      res.status(400).json({ error: 'type y content son requeridos' });
      return;
    }

    const entry = await prisma.entry.create({
      data: {
        type,
        content,
        metadata: serializeMeta(metadata),
        userId: req.userId!,
      },
    });

    res.status(201).json(toEntry(entry));
  } catch {
    res.status(500).json({ error: 'Error al crear registro' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content, metadata } = req.body;

    const existing = await prisma.entry.findFirst({ where: { id, userId: req.userId! } });
    if (!existing) { res.status(404).json({ error: 'Registro no encontrado' }); return; }

    const updated = await prisma.entry.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(metadata !== undefined && { metadata: serializeMeta(metadata) }),
      },
    });

    res.json(toEntry(updated));
  } catch {
    res.status(500).json({ error: 'Error al actualizar registro' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.entry.findFirst({ where: { id, userId: req.userId! } });
    if (!existing) { res.status(404).json({ error: 'Registro no encontrado' }); return; }
    await prisma.entry.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});

export { router as entriesRouter };
