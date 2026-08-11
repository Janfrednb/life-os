import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { Entry, MoodMeta } from '../../types';

interface DataPoint {
  date: string;
  value: number;
  label: string;
  note: string;
}

const MOOD_COLOR: Record<number, string> = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#6b8f6b',
  4: '#16a34a',
  5: '#22c55e',
};

const MOOD_LABEL: Record<number, string> = {
  1: 'Muy bajo',
  2: 'Bajo',
  3: 'Neutral',
  4: 'Bueno',
  5: 'Excelente',
};

function buildData(entries: Entry[]): DataPoint[] {
  // Take last entry per day
  const byDay = new Map<string, Entry>();
  [...entries].reverse().forEach((e) => {
    const day = e.createdAt.slice(0, 10);
    byDay.set(day, e);
  });

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([day, e]) => {
      const meta = e.metadata as MoodMeta | null;
      const value = meta?.escalaAnimo ?? 3;
      const [, month, dayNum] = day.split('-');
      return {
        date: `${dayNum}/${month}`,
        value,
        label: MOOD_LABEL[value] ?? '',
        note: e.content,
      };
    });
}

function CustomDot(props: {
  cx?: number; cy?: number; payload?: DataPoint;
}) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const color = MOOD_COLOR[payload.value] ?? '#22c55e';
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke={color} strokeWidth={2} />;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: DataPoint }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = MOOD_COLOR[d.value] ?? '#22c55e';
  return (
    <div className="bg-bg-2 border border-bg-3 rounded-xl px-3 py-2 text-xs max-w-[180px]">
      <div className="font-semibold mb-0.5" style={{ color }}>{d.label}</div>
      <div className="text-text-dim">{d.date}</div>
      {d.note && <div className="text-text-muted mt-1 break-words">{d.note}</div>}
    </div>
  );
}

interface Props {
  entries: Entry[];
}

export function MoodChart({ entries }: Props) {
  const data = buildData(entries);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-text-dim text-sm">
        Sin datos suficientes para el grafico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2d1f" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#3d5c3d', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fill: '#3d5c3d', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => MOOD_LABEL[v]?.[0] ?? v}
        />
        <ReferenceLine y={3} stroke="#1f2d1f" strokeDasharray="4 4" />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#263826', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#22c55e"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
