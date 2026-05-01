import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './auth.js';
import documentsRouter from './routes/documents.js';
import sortRouter from './routes/sort.js';
import overviewRouter from './routes/overview.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Auth routes (Supabase handles OAuth on the client; server only validates tokens)
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ ok: true });
});

// Document / storage routes
app.use('/api/documents', documentsRouter);

// AI sorting routes
app.use('/api/sort', sortRouter);

// Task overview routes
app.use('/api/overview', overviewRouter);

// Protected API placeholder
app.get('/api/status', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve static frontend in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
