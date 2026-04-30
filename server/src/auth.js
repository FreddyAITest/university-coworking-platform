import { createClient } from '@supabase/supabase-js';
import db from './db.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Not authenticated' });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const email = user.email?.toLowerCase();
  if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email)) {
    return res.status(403).json({ error: 'Email not authorized' });
  }

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  if (!existing) {
    db.prepare('INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)').run(
      user.id, email, user.user_metadata?.full_name || email
    );
  }

  req.user = { id: user.id, email, displayName: user.user_metadata?.full_name || email };
  next();
}
