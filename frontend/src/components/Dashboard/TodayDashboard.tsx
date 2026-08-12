import { motion } from 'framer-motion';
import { MoodCard } from './MoodCard';
import { HabitsCard } from './HabitsCard';
import { PendingCard } from './PendingCard';
import { MoodHabitCorrelationCard } from './MoodHabitCorrelationCard';
import { useTodayEntries } from '../../hooks/useEntries';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export function TodayDashboard() {
  const today = new Date();
  const { data: entrenos } = useTodayEntries('ENTRENO');
  const entrenoHoy = (entrenos?.length ?? 0) > 0;

  const dayName = today.toLocaleDateString('es-CO', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-text-dim text-xs font-mono uppercase tracking-widest">
          {dayName}
        </p>
        <h1 className="text-text-base text-2xl font-semibold capitalize">{dateStr}</h1>
      </div>

      {/* Pill entreno */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, duration: 0.25 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${
          entrenoHoy
            ? 'border-green-dim bg-green/10 text-green'
            : 'border-bg-3 text-text-muted'
        }`}
      >
        <span>💪</span>
        {entrenoHoy ? 'Entrenaste hoy' : 'Sin entreno registrado'}
      </motion.div>

      {/* Cards con stagger */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <motion.div variants={card}>
          <MoodCard />
        </motion.div>
        <motion.div variants={card}>
          <HabitsCard />
        </motion.div>
        <motion.div variants={card} className="md:col-span-2">
          <MoodHabitCorrelationCard />
        </motion.div>
        <motion.div variants={card} className="md:col-span-2">
          <PendingCard />
        </motion.div>
      </motion.div>
    </div>
  );
}
