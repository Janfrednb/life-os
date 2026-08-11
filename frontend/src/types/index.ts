export type EntryType =
  | 'MOOD'
  | 'DEUDA'
  | 'PAGO'
  | 'PENDIENTE_TRABAJO'
  | 'ENTRENO'
  | 'NOTA_LIBRE';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'alta' | 'media' | 'baja';

export interface Entry {
  id: string;
  type: EntryType;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  userId: string;
}

export interface MoodMeta {
  escalaAnimo: number;
}

export interface DeudaMeta {
  monto: number;
  acreedor: string;
  fechaLimite: string;
  montoPagado: number;
  moneda?: string;
}

export interface PagoMeta {
  monto: number;
}

export interface PendienteMeta {
  estado: TaskStatus;
  cliente?: string;
  prioridad?: Priority;
  fechaLimite?: string;
}

export interface EntrenoMeta {
  tipo?: string;
  duracionMin?: number;
}

export interface Habit {
  id: string;
  name: string;
  targetPerWeek: number;
  createdAt: string;
  userId: string;
  completedToday: boolean;
  streak: number;
  maxStreak: number;
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  id: string;
  date: string;
  habitId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
