import type { HabitCompletion } from '../../types';

interface Props {
  completions: HabitCompletion[];
}

const WEEKS = 16;
const DAYS = 7; // Mon=0 … Sun=6

function toISODay(d: Date): number {
  // 0=Mon … 6=Sun
  return (d.getDay() + 6) % 7;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildGrid(completions: HabitCompletion[]): { date: Date; completed: boolean }[][] {
  const completedSet = new Set(completions.map((c) => c.date.slice(0, 10)));

  // Anchor: today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Last day of the grid is the coming Sunday (or today if Sunday)
  const dayOfWeek = toISODay(today); // 0=Mon … 6=Sun
  const daysUntilSunday = (6 - dayOfWeek + 7) % 7;
  const gridEnd = new Date(today);
  gridEnd.setDate(today.getDate() + daysUntilSunday);

  const totalDays = WEEKS * DAYS;
  const gridStart = new Date(gridEnd);
  gridStart.setDate(gridEnd.getDate() - totalDays + 1);

  const weeks: { date: Date; completed: boolean }[][] = [];
  let cur = new Date(gridStart);

  for (let w = 0; w < WEEKS; w++) {
    const week: { date: Date; completed: boolean }[] = [];
    for (let d = 0; d < DAYS; d++) {
      week.push({ date: new Date(cur), completed: completedSet.has(dateKey(cur)) });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function getMonthLabels(weeks: { date: Date }[][]): { label: string; colIndex: number }[] {
  const labels: { label: string; colIndex: number }[] = [];
  const seen = new Set<string>();
  weeks.forEach((week, i) => {
    const monthKey = week[0].date.toLocaleDateString('es', { month: 'short', year: '2-digit' });
    if (!seen.has(monthKey)) {
      seen.add(monthKey);
      labels.push({ label: week[0].date.toLocaleDateString('es', { month: 'short' }), colIndex: i });
    }
  });
  return labels;
}

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function ContributionsGrid({ completions }: Props) {
  const weeks = buildGrid(completions);
  const monthLabels = getMonthLabels(weeks);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = dateKey(today);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-1 ml-5">
          {weeks.map((_, i) => {
            const lbl = monthLabels.find((m) => m.colIndex === i);
            return (
              <div key={i} className="w-[14px] mr-[2px] text-[9px] text-text-dim shrink-0">
                {lbl ? lbl.label : ''}
              </div>
            );
          })}
        </div>

        {/* Grid rows: day labels + cells */}
        <div className="flex gap-1">
          {/* Day labels col */}
          <div className="flex flex-col gap-[2px] mr-[2px]">
            {DAY_LABELS.map((d) => (
              <div key={d} className="h-[14px] text-[9px] text-text-dim flex items-center leading-none">
                {d}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map(({ date, completed }, di) => {
                const key = dateKey(date);
                const isFuture = date > today;
                const isToday = key === todayKey;

                let bg = 'bg-bg-3';
                if (!isFuture && completed) bg = 'bg-green';
                else if (!isFuture && !completed) bg = 'bg-bg-3';

                return (
                  <div
                    key={di}
                    title={key}
                    className={`w-[14px] h-[14px] rounded-[3px] ${bg} ${
                      isToday ? 'ring-1 ring-green-glow ring-offset-0' : ''
                    } ${isFuture ? 'opacity-20' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
