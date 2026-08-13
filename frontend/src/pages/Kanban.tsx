import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Layout } from '../components/Layout/Layout';
import { useEntries, useUpdateEntry } from '../hooks/useEntries';
import { KanbanColumn } from '../components/Kanban/KanbanColumn';
import { KanbanCardContent } from '../components/Kanban/KanbanCard';
import type { PendienteMeta, TaskStatus } from '../types';

const COLUMNS: { id: TaskStatus; title: string; accent: string }[] = [
  { id: 'TODO', title: 'Por hacer', accent: 'bg-text-dim' },
  { id: 'IN_PROGRESS', title: 'En progreso', accent: 'bg-warn' },
  { id: 'DONE', title: 'Hecho', accent: 'bg-green' },
];

export function KanbanPage() {
  const { data: entries, isLoading } = useEntries({ type: 'PENDIENTE_TRABAJO' });
  const updateEntry = useUpdateEntry();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !entries) return;

    const targetStatus = over.id as TaskStatus;
    const entry = entries.find((e) => e.id === active.id);
    if (!entry) return;

    const meta = entry.metadata as PendienteMeta | null;
    if (meta?.estado === targetStatus) return;

    updateEntry.mutate({
      id: entry.id,
      metadata: { ...meta, estado: targetStatus },
    });
  }

  const byStatus = (status: TaskStatus) =>
    (entries ?? []).filter((e) => {
      const m = e.metadata as PendienteMeta | null;
      return (m?.estado ?? 'TODO') === status;
    });

  const totalDone = byStatus('DONE').length;
  const total = entries?.length ?? 0;
  const activeEntry = entries?.find((e) => e.id === activeId) ?? null;

  return (
    <Layout>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text-base">Trabajo</h1>
          {total > 0 && (
            <span className="text-sm text-text-muted">
              <span className="text-green">{totalDone}</span>/{total} hechas
            </span>
          )}
        </div>

        {isLoading && (
          <div className="text-center text-text-muted py-12 text-sm">Cargando...</div>
        )}

        {!isLoading && total === 0 && (
          <div className="text-center py-16 flex flex-col gap-2">
            <span className="text-4xl">📋</span>
            <p className="text-text-muted text-sm">Sin tareas pendientes.</p>
            <p className="text-text-dim text-xs">Usa el + para agregar una tarea.</p>
          </div>
        )}

        {!isLoading && total > 0 && (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4 w-max">
                {COLUMNS.map((col) => (
                  <KanbanColumn
                    key={col.id}
                    id={col.id}
                    title={col.title}
                    accent={col.accent}
                    entries={byStatus(col.id)}
                  />
                ))}
              </div>
            </div>
            <DragOverlay>
              {activeEntry && <KanbanCardContent entry={activeEntry} floating />}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </Layout>
  );
}
