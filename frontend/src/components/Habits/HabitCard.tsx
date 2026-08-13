import { useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Habit } from '../../types';
import { useToggleHabit } from '../../hooks/useHabits';
import { HabitMonthCalendar } from './HabitMonthCalendar';
import { localDayKey, habitCompletionDayKey, startOfWeek } from '../../lib/dates';

interface Props {
  habit: Habit;
}

function shouldShowReminder(habit: Habit): boolean {
  if (habit.completedToday) return false;
  const now = new Date();
  return now.getHours() >= 20;
}

function weeklyCompletionCount(habit: Habit): number {
  const today = new Date();
  const weekStartKey = localDayKey(startOfWeek(today));
  const todayKey = localDayKey(today);
  return habit.completions.filter((c) => {
    const key = habitCompletionDayKey(c.date);
    return key >= weekStartKey && key <= todayKey;
  }).length;
}

export function HabitCard({ habit }: Props) {
  const toggle = useToggleHabit();
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleToggle() {
    if (!habit.completedToday) {
      const rect = btnRef.current?.getBoundingClientRect();
      const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
      const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;
      confetti({
        particleCount: 80,
        spread: 55,
        origin: { x, y },
        colors: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
        scalar: 0.9,
      });
    }
    toggle.mutate({ id: habit.id, completedToday: habit.completedToday });
  }

  const reminder = shouldShowReminder(habit);
  const weekCount = weeklyCompletionCount(habit);
  const weekGoalMet = weekCount >= habit.targetPerWeek;
  const weekPct = Math.min(100, (weekCount / habit.targetPerWeek) * 100);

  return (
    <div className="bg-bg-1 border border-bg-3 rounded-2xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {reminder && (
            <span title="Aun no completado hoy" className="w-2 h-2 rounded-full bg-warn shrink-0" />
          )}
          <span className="text-text-base font-medium truncate">{habit.name}</span>
        </div>

        <motion.button
          ref={btnRef}
          whileTap={{ scale: 0.88 }}
          onClick={handleToggle}
          disabled={toggle.isPending}
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors ${
            habit.completedToday
              ? 'bg-green text-bg-0'
              : 'bg-bg-3 text-text-muted hover:bg-bg-4'
          }`}
          aria-label={habit.completedToday ? 'Desmarcar' : 'Completar'}
        >
          {habit.completedToday ? '✓' : '○'}
        </motion.button>
      </div>

      {/* Streak badges */}
      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-1 text-text-muted">
          <span>🔥</span>
          <span>
            <span className="text-text-base font-semibold">{habit.streak}</span>
            {' '}racha
          </span>
        </span>
        <span className="flex items-center gap-1 text-text-muted">
          <span>🏆</span>
          <span>
            <span className="text-text-base font-semibold">{habit.maxStreak}</span>
            {' '}max
          </span>
        </span>
      </div>

      {/* Progreso semanal */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-dim">Esta semana</span>
          <span className={`font-mono font-medium ${weekGoalMet ? 'text-green' : 'text-text-muted'}`}>
            {weekCount}/{habit.targetPerWeek}
          </span>
        </div>
        <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${weekGoalMet ? 'bg-green' : 'bg-green-dim'}`}
            style={{ width: `${weekPct}%` }}
          />
        </div>
      </div>

      {/* Calendario mensual */}
      <HabitMonthCalendar completions={habit.completions} />
    </div>
  );
}
