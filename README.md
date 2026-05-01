# Coworking Platform

AI-powered document sorting and task overviews for your local workspace. Designed for university data management.

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase project (for Google OAuth)
- Anthropic API key (for Claude)

### Setup

```bash
# Server
cd server
cp .env.example .env
# Edit .env with your keys
npm install
npm run dev

# Client
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `ALLOWED_EMAILS` | Comma-separated whitelist (empty = all Google-authenticated users) |
| `ANTHROPIC_API_KEY` | Claude API key for doc sorting + task extraction |
| `STORAGE_PATH` | Local filesystem path for document storage (default: `./storage`) |

The client also needs a `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values).

### Deployment

**Client (Netlify):** Connect your repo and Netlify auto-detects the Vite config. Set the `netlify.toml` API redirect target to your server URL.

**Server:** Deploy to any Node.js host (Render, Railway, VPS). Set the environment variables above.

### Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Project Structure

```
server/           Express API server
  src/
    index.js      Entry point
    auth.js       Supabase JWT verification
    db.js         SQLite schema
    storage.js    Local filesystem storage
    sorter.js     Claude API doc classification + task extraction
    routes/
      documents.js  File browsing API
      sort.js       AI document sorting
      overview.js   Task overview generation

client/           React + Vite frontend
  src/
    App.jsx       Root component with auth gate
    pages/
      Login.jsx     Supabase Google sign-in page
      Dashboard.jsx Task overview dashboard
      Documents.jsx File browser
```
