import { motion } from 'framer-motion';
import { useEntries, useUpdateEntry } from '../../hooks/useEntries';
import type { PendienteMeta } from '../../types';

const PRIORITY_COLOR: Record<string, string> = {
  alta: 'text-danger',
  media: 'text-warn',
  baja: 'text-text-muted',
};

export function PendingCard() {
  const { data: entries, isLoading } = useEntries({ type: 'PENDIENTE_TRABAJO', limit: 20 });
  const { mutate: updateEntry } = useUpdateEntry();

  const active = (entries ?? []).filter((e) => {
    const meta = e.metadata as PendienteMeta | null;
    return meta?.estado !== 'DONE';
  });

  if (isLoading) {
    return (
      <CardShell>
        <Skeleton />
      </CardShell>
    );
  }

  if (active.length === 0) {
    return (
      <CardShell>
        <p className="text-text-muted text-sm">Sin tareas pendientes.</p>
      </CardShell>
    );
  }

  function markDone(id: string, meta: PendienteMeta) {
    updateEntry({ id, metadata: { ...meta, estado: 'DONE' } });
  }

  function toggleProgress(id: string, meta: PendienteMeta) {
    const next = meta.estado === 'TODO' ? 'IN_PROGRESS' : 'TODO';
    updateEntry({ id, metadata: { ...meta, estado: next } });
  }

  return (
    <CardShell>
      <div className="space-y-2.5">
        {active.slice(0, 5).map((entry) => {
          const meta = (entry.metadata as PendienteMeta | null) ?? { estado: 'TODO' };
          return (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 group"
            >
              {/* Completar */}
              <button
                onClick={() => markDone(entry.id, meta)}
                title="Marcar como hecho"
                className="mt-0.5 w-5 h-5 rounded border border-bg-4 hover:border-green hover:bg-green/10 transition-all flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-base truncate">{entry.content}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {meta.cliente && (
                    <span className="text-xs text-text-dim">{meta.cliente}</span>
                  )}
                  {meta.prioridad && (
                    <span className={`text-xs font-mono ${PRIORITY_COLOR[meta.prioridad] ?? ''}`}>
                      {meta.prioridad}
                    </span>
                  )}
                  {meta.fechaLimite && (
                    <span className="text-xs text-text-dim font-mono">
                      {new Date(meta.fechaLimite).toLocaleDateString('es-CO', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Toggle estado */}
              <button
                onClick={() => toggleProgress(entry.id, meta)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors flex-shrink-0 ${
                  meta.estado === 'IN_PROGRESS'
                    ? 'border-green-dim text-green-dim'
                    : 'border-bg-4 text-text-dim hover:border-bg-3'
                }`}
              >
                {meta.estado === 'IN_PROGRESS' ? 'En curso' : 'Pendiente'}
              </button>
            </motion.div>
          );
        })}

        {active.length > 5 && (
          <p className="text-text-dim text-xs text-center">+{active.length - 5} más</p>
        )}
      </div>
    </CardShell>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-1 border border-bg-3 rounded-2xl p-4">
      <p className="text-text-dim text-xs font-mono uppercase tracking-widest mb-3">
        trabajo pendiente
      </p>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="h-8 bg-bg-2 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
