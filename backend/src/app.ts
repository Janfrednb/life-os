import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { entriesRouter } from './routes/entries';
import { habitsRouter } from './routes/habits';
import { moodRouter } from './routes/mood';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/mood', moodRouter);

export default app;
