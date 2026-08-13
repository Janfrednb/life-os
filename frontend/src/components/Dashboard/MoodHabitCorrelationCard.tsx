import { useMemo } from 'react';
import { useHabits } from '../../hooks/useHabits';
import { useEntries } from '../../hooks/useEntries';
import type { MoodMeta } from '../../types';
import { localDayKey, habitCompletionDayKey as habitDayKey } from '../../lib/dates';

const WINDOW_DAYS = 60;
const MIN_POINTS = 6;
const MIN_GROUP = 3;

interface DayPoint {
  key: string;
  mood: number;
  rate: number;
}

function pearson(points: DayPoint[]): number | null {
  const n = points.length;
  if (n < 2) return null;
  const xs = points.map((p) => p.rate);
  const ys = points.map((p) => p.mood);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return null;
  return num / Math.sqrt(denX * denY);
}

function avg(points: DayPoint[]): number {
  return points.reduce((a, p) => a + p.mood, 0) / points.length;
}

export function MoodHabitCorrelationCard() {
  const { data: habits, isLoading: loadingHabits } = useHabits();

  const { from, to } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - WINDOW_DAYS);
    return { from: start.toISOString(), to: now.toISOString() };
  }, []);

  const { data: moodEntries, isLoading: loadingMood } = useEntries({ type: 'MOOD', from, to });

  const points = useMemo(() => {
    if (!habits || !moodEntries || habits.length === 0) return [];

    const moodByDay = new Map<string, number>();
    // Los entries llegan ordenados desc por createdAt: nos quedamos con el
    // primero visto (el más reciente) si hay varios registros el mismo día.
    moodEntries.forEach((e) => {
      const value = (e.metadata as MoodMeta | null)?.escalaAnimo;
      if (typeof value !== 'number') return;
      const key = localDayKey(new Date(e.createdAt));
      if (!moodByDay.has(key)) moodByDay.set(key, value);
    });

    const completionByDay = new Map<string, number>();
    habits.forEach((h) => {
      h.completions.forEach((c) => {
        const key = habitDayKey(c.date);
        completionByDay.set(key, (completionByDay.get(key) ?? 0) + 1);
      });
    });

    const totalHabits = habits.length;
    const result: DayPoint[] = [];
    moodByDay.forEach((mood, key) => {
      const rate = (completionByDay.get(key) ?? 0) / totalHabits;
      result.push({ key, mood, rate });
    });
    return result;
  }, [habits, moodEntries]);

  if (loadingHabits || loadingMood) {
    return (
      <CardShell>
        <div className="h-16 bg-bg-2 rounded-xl animate-pulse" />
      </CardShell>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <CardShell>
        <p className="text-text-muted text-sm">
          Crea al menos un hábito para ver si se relaciona con tu ánimo.
        </p>
      </CardShell>
    );
  }

  if (points.length < MIN_POINTS) {
    return (
      <CardShell>
        <p className="text-text-muted text-sm">
          Aún no hay suficientes datos ({points.length}/{MIN_POINTS} días). Registra tu ánimo
          y marca tus hábitos por más días para ver si están relacionados.
        </p>
      </CardShell>
    );
  }

  const r = pearson(points);
  const activeDays = points.filter((p) => p.rate >= 0.5);
  const passiveDays = points.filter((p) => p.rate < 0.5);
  const canCompareGroups = activeDays.length >= MIN_GROUP && passiveDays.length >= MIN_GROUP;
  const activeAvg = canCompareGroups ? avg(activeDays) : null;
  const passiveAvg = canCompareGroups ? avg(passiveDays) : null;

  let headline = 'Por ahora no hay una relación clara entre tus hábitos y tu ánimo.';
  let tone: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (r !== null && r >= 0.3) {
    headline = 'Cuando completas más hábitos, tu ánimo tiende a subir.';
    tone = 'positive';
  } else if (r !== null && r <= -0.3) {
    headline = 'Los días que completas más hábitos, tu ánimo tiende a bajar.';
    tone = 'negative';
  }

  return (
    <CardShell>
      <p
        className={`text-sm font-medium mb-3 ${
          tone === 'positive' ? 'text-green' : tone === 'negative' ? 'text-warn' : 'text-text-base'
        }`}
      >
        {headline}
      </p>

      {canCompareGroups && activeAvg !== null && passiveAvg !== null && (
        <div className="flex items-end gap-6">
          <MoodBar label="Días activos" sublabel={`≥50% hábitos · ${activeDays.length}d`} value={activeAvg} />
          <MoodBar label="Días pasivos" sublabel={`<50% hábitos · ${passiveDays.length}d`} value={passiveAvg} />
        </div>
      )}

      <p className="text-text-dim text-[11px] mt-3">
        Basado en {points.length} días con ánimo registrado de los últimos {WINDOW_DAYS}.
      </p>
    </CardShell>
  );
}

function MoodBar({ label, sublabel, value }: { label: string; sublabel: string; value: number }) {
  const pct = Math.max(4, (value / 5) * 100);
  return (
    <div className="flex-1 flex flex-col items-center gap-1 max-w-[120px]">
      <div className="w-full h-16 bg-bg-2 rounded-lg flex items-end overflow-hidden">
        <div className="w-full bg-green rounded-lg transition-all" style={{ height: `${pct}%` }} />
      </div>
      <p className="text-text-base text-xs font-semibold font-mono">{value.toFixed(1)}</p>
      <p className="text-text-dim text-[10px] text-center leading-tight">
        {label}
        <br />
        {sublabel}
      </p>
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-1 border border-bg-3 rounded-2xl p-4">
      <p className="text-text-dim text-xs font-mono uppercase tracking-widest mb-3">
        ánimo × hábitos
      </p>
      {children}
    </div>
  );
}
