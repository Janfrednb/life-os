import { useMemo, useState } from 'react';
import type { HabitCompletion } from '../../types';

interface Props {
  completions: HabitCompletion[];
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function localKey(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

// El backend guarda cada completado como medianoche UTC representando el día
// local del usuario (ver fix de timezone), así que lo leemos con getters UTC
// para recuperar ese mismo día de calendario sin importar la zona del viewer.
function completionKey(dateStr: string): string {
  const d = new Date(dateStr);
  return localKey(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

interface Cell {
  day: number;
  key: string;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export function HabitMonthCalendar({ completions }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const completedSet = useMemo(
    () => new Set(completions.map((c) => completionKey(c.date))),
    [completions],
  );

  const todayKey = localKey(today.getFullYear(), today.getMonth(), today.getDate());

  const { cells, leadingBlanks } = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Lun=0 ... Dom=6

    const cells: Cell[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const key = localKey(viewYear, viewMonth, day);
      cells.push({
        day,
        key,
        completed: completedSet.has(key),
        isToday: key === todayKey,
        isFuture: key > todayKey,
      });
    }
    return { cells, leadingBlanks };
  }, [viewYear, viewMonth, completedSet, todayKey]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Mes anterior"
          className="w-6 h-6 flex items-center justify-center rounded-md text-text-dim hover:bg-bg-3 hover:text-text-base"
        >
          ‹
        </button>
        <span className="text-xs font-medium text-text-base capitalize">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          disabled={isCurrentMonth}
          aria-label="Mes siguiente"
          className="w-6 h-6 flex items-center justify-center rounded-md text-text-dim hover:bg-bg-3 hover:text-text-base disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-dim"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-[9px] text-text-dim text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {cells.map(({ day, key, completed, isToday, isFuture }) => (
          <div
            key={key}
            title={key}
            className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold ${
              completed
                ? 'bg-green text-bg-0'
                : isFuture
                ? 'text-text-dim opacity-40'
                : 'bg-bg-3 text-text-muted'
            } ${isToday ? 'ring-1 ring-green-glow' : ''}`}
          >
            {completed ? '✓' : day}
          </div>
        ))}
      </div>
    </div>
  );
}
