import type { EntryType } from '../../types';

const TYPES: { type: EntryType; emoji: string; label: string }[] = [
  { type: 'MOOD', emoji: '🎭', label: 'Ánimo' },
  { type: 'ENTRENO', emoji: '💪', label: 'Entreno' },
  { type: 'PENDIENTE_TRABAJO', emoji: '💼', label: 'Tarea' },
  { type: 'DEUDA', emoji: '💸', label: 'Deuda' },
  { type: 'PAGO', emoji: '✅', label: 'Pago' },
  { type: 'NOTA_LIBRE', emoji: '📝', label: 'Nota' },
];

interface Props {
  selected: EntryType | null;
  onSelect: (t: EntryType) => void;
}

export function TypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TYPES.map(({ type, emoji, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all duration-150 ${
            selected === type
              ? 'border-green bg-bg-3 text-green'
              : 'border-bg-3 bg-bg-2 text-text-muted hover:border-green-muted hover:text-text-base'
          }`}
        >
          <span className="text-2xl">{emoji}</span>
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
