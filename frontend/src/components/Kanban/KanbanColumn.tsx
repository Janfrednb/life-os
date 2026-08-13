import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import type { Entry } from '../../types';
import { KanbanCard } from './KanbanCard';

interface Props {
  id: string;
  title: string;
  accent: string;
  entries: Entry[];
}

export function KanbanColumn({ id, title, accent, entries }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col gap-3 min-w-[260px] w-[260px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${accent}`} />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</span>
        </div>
        <span className="text-xs text-text-dim">{entries.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 min-h-[120px] rounded-2xl p-3 border transition-all duration-150 ${
          isOver ? 'bg-bg-3 border-green/50 scale-[1.02]' : 'bg-bg-1 border-bg-3'
        }`}
      >
        <AnimatePresence>
          {entries.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
            >
              <KanbanCard entry={e} />
            </motion.div>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <div
            className={`flex-1 flex items-center justify-center text-xs py-4 transition-colors ${
              isOver ? 'text-green' : 'text-text-dim'
            }`}
          >
            Suelta aqui
          </div>
        )}
      </div>
    </div>
  );
}
