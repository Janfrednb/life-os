import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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

export function KanbanCard({ entry }: Props) {
  const meta = entry.metadata as PendienteMeta | null;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: entry.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const days = daysLeft(meta?.fechaLimite);
  const prioridad = meta?.prioridad ?? 'baja';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-bg-0 border border-bg-3 rounded-xl p-3 flex flex-col gap-2 select-none touch-none"
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
