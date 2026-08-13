import { useDraggable } from '@dnd-kit/core';
import type { Entry, PendienteMeta } from '../../types';

interface Props {
  entry: Entry;
}

const PRIORITY_STYLE: Record<string, string> = {
  alta: 'text-danger border-danger/30 bg-danger/10',
  media: 'text-warn border-warn/30 bg-warn/10',
  baja: 'text-text-dim border-bg-4 bg-bg-3',
};

function daysLeft(fecha?: string): number | null {
  if (!fecha) return null;
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / 86_400_000);
}

interface ContentProps {
  entry: Entry;
  floating?: boolean;
}

export function KanbanCardContent({ entry, floating = false }: ContentProps) {
  const meta = entry.metadata as PendienteMeta | null;
  const days = daysLeft(meta?.fechaLimite);
  const prioridad = meta?.prioridad ?? 'baja';

  return (
    <div
      className={`bg-bg-0 border rounded-xl p-3 flex flex-col gap-2 select-none ${
        floating ? 'border-green/40 shadow-xl shadow-black/30 rotate-2 scale-105' : 'border-bg-3'
      }`}
    >
      <p className="text-sm text-text-base leading-snug">{entry.content}</p>

      <div className="flex flex-wrap gap-1.5 items-center">
        {meta?.prioridad && (
          <span className={`text-[10px] border rounded-full px-2 py-0.5 font-medium ${PRIORITY_STYLE[prioridad]}`}>
            {prioridad}
          </span>
        )}
        {meta?.cliente && (
          <span className="text-[10px] text-text-dim bg-bg-3 rounded-full px-2 py-0.5">
            {meta.cliente}
          </span>
        )}
        {days !== null && (
          <span className={`text-[10px] ml-auto ${days < 0 ? 'text-danger' : days <= 3 ? 'text-warn' : 'text-text-dim'}`}>
            {days < 0 ? `+${-days}d` : days === 0 ? 'hoy' : `${days}d`}
          </span>
        )}
      </div>
    </div>
  );
}

// La tarjeta arrastrable deja un hueco punteado en su lugar mientras se
// arrastra: el clon flotante que sigue al cursor lo dibuja el DragOverlay
// en Kanban.tsx, así evitamos que la misma tarjeta se vea duplicada.
export function KanbanCard({ entry }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: entry.id });

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="rounded-xl border-2 border-dashed border-bg-4 min-h-[68px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      <KanbanCardContent entry={entry} />
    </div>
  );
}
