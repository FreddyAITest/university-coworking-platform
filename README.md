# Coworking Platform

AI-powered document sorting and task overviews for your shared OneDrive workspace. Designed for university data management.

## Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud Console project (for OAuth)
- Microsoft Azure app registration (for OneDrive)
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
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SESSION_SECRET` | Random string for session encryption |
| `ALLOWED_EMAILS` | Comma-separated whitelist (empty = all Google users) |
| `ANTHROPIC_API_KEY` | Claude API key for doc sorting + task extraction |
| `MICROSOFT_CLIENT_ID` | Azure AD app client ID for OneDrive |
| `MICROSOFT_CLIENT_SECRET` | Azure AD app client secret |
| `MICROSOFT_TENANT_ID` | Azure tenant ID (use `common` for personal accounts) |

### Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Project Structure

```
server/           Express API server
  src/
    index.js      Entry point
    auth.js       Google OAuth (Passport.js)
    db.js         SQLite schema
    onedrive.js   Microsoft Graph client
    sorter.js     Claude API doc classification + task extraction
    routes/
      documents.js  File browsing API
      sort.js       AI document sorting
      overview.js   Task overview generation

client/           React + Vite frontend
  src/
    App.jsx       Root component with auth gate
    pages/
      Login.jsx     Google sign-in page
      Dashboard.jsx Task overview dashboard
      Documents.jsx OneDrive file browser
```
