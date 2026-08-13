import { motion } from 'framer-motion';

const MOOD = [
  { value: 1, emoji: '😞', label: 'Muy bajo', color: 'rgba(185,28,28,0.18)' },
  { value: 2, emoji: '😟', label: 'Bajo', color: 'rgba(180,83,9,0.18)' },
  { value: 3, emoji: '😐', label: 'Regular', color: 'rgba(31,45,31,0.6)' },
  { value: 4, emoji: '😊', label: 'Bien', color: 'rgba(21,128,61,0.18)' },
  { value: 5, emoji: '😄', label: 'Excelente', color: 'rgba(22,163,74,0.28)' },
];

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function MoodSlider({ value, onChange }: Props) {
  const current = MOOD[value - 1];

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1">
        <motion.span
          key={value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-5xl select-none"
        >
          {current.emoji}
        </motion.span>
        <motion.span
          key={`label-${value}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-text-muted"
        >
          {current.label}
        </motion.span>
      </div>

      {/* Slider */}
      <div className="relative px-2">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mood-slider w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgb(var(--color-green)) ${((value - 1) / 4) * 100}%, rgb(var(--color-bg-3)) ${((value - 1) / 4) * 100}%)`,
          }}
        />
        <div className="flex justify-between mt-1.5">
          {MOOD.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(m.value)}
              className={`text-xs transition-opacity ${
                m.value === value ? 'opacity-100 text-green' : 'opacity-40 text-text-muted'
              }`}
            >
              {m.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function getMoodBg(value: number): string {
  return MOOD[value - 1]?.color ?? 'rgba(31,45,31,0.6)';
}
