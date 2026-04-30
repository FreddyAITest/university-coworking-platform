import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from './db.js';

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

export function configureAuth() {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails[0]?.value?.toLowerCase();
        if (!email) return done(null, false, { message: 'No email found' });

        if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email)) {
          return done(null, false, { message: 'Email not authorized' });
        }

        const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!existing) {
          db.prepare('INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)').run(
            profile.id, email, profile.displayName
          );
        }

        return done(null, { id: profile.id, email, displayName: profile.displayName });
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    done(null, user || null);
  });

  return passport;
}

export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
}
