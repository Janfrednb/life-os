import { useRef, useState } from 'react';
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
  const [activeCol, setActiveCol] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // En mobile las columnas ocupan casi todo el ancho y se navegan por swipe;
  // esto detecta cuál está centrada para resaltar el punto correspondiente.
  function handleScroll() {
    const row = scrollRef.current?.firstElementChild;
    if (!row) return;
    const columns = Array.from(row.children) as HTMLElement[];
    const container = scrollRef.current!;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    let closest = 0;
    let minDist = Infinity;
    columns.forEach((col, i) => {
      const center = col.offsetLeft + col.offsetWidth / 2;
      const dist = Math.abs(center - containerCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveCol(closest);
  }

  function scrollToCol(i: number) {
    const row = scrollRef.current?.firstElementChild;
    const col = row?.children[i] as HTMLElement | undefined;
    col?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

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
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scroll-px-4"
            >
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

            {/* Indicador de columna, solo en mobile */}
            <div className="flex justify-center gap-1.5 sm:hidden -mt-2">
              {COLUMNS.map((col, i) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => scrollToCol(i)}
                  aria-label={`Ir a ${col.title}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeCol === i ? 'w-5 bg-green' : 'w-1.5 bg-bg-3'
                  }`}
                />
              ))}
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
