import { useDroppable } from '@dnd-kit/core';
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
        className={`flex flex-col gap-2 min-h-[120px] rounded-2xl p-3 transition-colors ${
          isOver ? 'bg-bg-3' : 'bg-bg-1'
        } border border-bg-3`}
      >
        {entries.map((e) => (
          <KanbanCard key={e.id} entry={e} />
        ))}
        {entries.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-text-dim text-xs py-4">
            Suelta aqui
          </div>
        )}
      </div>
    </div>
  );
}
