import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { configureAuth, requireAuth } from './auth.js';
import documentsRouter from './routes/documents.js';
import sortRouter from './routes/sort.js';
import overviewRouter from './routes/overview.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

const passport = configureAuth();
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
  (_req, res) => res.redirect('/dashboard')
);

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/auth/logout', (req, res) => {
  req.logout(() => res.json({ ok: true }));
});

// Document / OneDrive routes
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
