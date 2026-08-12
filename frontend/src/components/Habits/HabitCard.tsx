import { useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Habit } from '../../types';
import { useToggleHabit } from '../../hooks/useHabits';
import { HabitMonthCalendar } from './HabitMonthCalendar';

interface Props {
  habit: Habit;
}

function shouldShowReminder(habit: Habit): boolean {
  if (habit.completedToday) return false;
  const now = new Date();
  return now.getHours() >= 20;
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
        <span className="ml-auto text-text-dim">
          {habit.targetPerWeek}x/sem
        </span>
      </div>

      {/* Calendario mensual */}
      <HabitMonthCalendar completions={habit.completions} />
    </div>
  );
}
