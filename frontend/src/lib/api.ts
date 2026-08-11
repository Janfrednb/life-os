import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { Entry, EntryType, Habit, User } from '../types';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);

// Auth
export async function apiRegister(body: {
  email: string;
  name: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const { data } = await http.post('/auth/register', body);
  return data;
}

export async function apiLogin(body: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const { data } = await http.post('/auth/login', body);
  return data;
}

// Entries
export async function fetchEntries(params?: {
  type?: EntryType;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<Entry[]> {
  const { data } = await http.get('/entries', { params });
  return data;
}

export async function createEntry(body: {
  type: EntryType;
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<Entry> {
  const { data } = await http.post('/entries', body);
  return data;
}

export async function updateEntry(
  id: string,
  body: { content?: string; metadata?: Record<string, unknown> },
): Promise<Entry> {
  const { data } = await http.put(`/entries/${id}`, body);
  return data;
}

export async function deleteEntry(id: string): Promise<void> {
  await http.delete(`/entries/${id}`);
}

// Habits
export async function fetchHabits(): Promise<Habit[]> {
  const { data } = await http.get('/habits');
  return data;
}

export async function createHabit(body: {
  name: string;
  targetPerWeek?: number;
}): Promise<Habit> {
  const { data } = await http.post('/habits', body);
  return data;
}

export async function completeHabit(id: string): Promise<void> {
  await http.post(`/habits/${id}/complete`);
}

export async function uncompleteHabit(id: string): Promise<void> {
  await http.delete(`/habits/${id}/complete`);
}

export async function deleteHabit(id: string): Promise<void> {
  await http.delete(`/habits/${id}`);
}

// Mood suggestion
export async function fetchMoodSuggestion(): Promise<{
  suggestion: string | null;
  isStreak: boolean;
}> {
  const { data } = await http.get('/mood/suggestion');
  return data;
}
