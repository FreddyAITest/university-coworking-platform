# Coworking Platform — Architecture & Implementation Plan

## Overview

A web platform that connects to a shared OneDrive space, uses AI to sort university documents into folders, generates daily/weekly/monthly task overviews from those docs, and presents everything on a Google OAuth-protected website.

## Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React + Vite | Fast, simple SPA, easy to deploy |
| Backend | Node.js + Express | JS everywhere, massive ecosystem, simple |
| Auth | Supabase Auth (Google OAuth provider) | Managed, JWT-based, free tier |
| AI | Claude API (Anthropic SDK) | Best doc understanding, already in toolchain |
| Storage | Local filesystem | Zero external dependencies, simple file ops |
| Database | SQLite (via better-sqlite3) | Zero setup, enough for single-user/small team |
| Deployment | Netlify (client) + any Node host (server) | Free tier, fast CDN, simple config |

## System Design

```
┌──────────────────────────────────────────────────┐
│                    Browser                        │
│  React SPA (Vite) — Dashboard, Doc Browser       │
└──────────────────┬───────────────────────────────┘
                   │ HTTPS
                   ▼
┌──────────────────────────────────────────────────┐
│              Express API Server                   │
│                                                   │
│  /api/auth/*       Supabase JWT verification       │
│  /api/docs/*       Document listing & search      │
│  /api/overview/*   Task overview (day/week/month) │
│  /api/sort/*       Trigger/manage doc sorting     │
│  /api/admin/*      Folder config, settings        │
└──────┬──────────────┬───────────────┬─────────────┘
       │              │               │
       ▼              ▼               ▼
┌────────────┐ ┌────────────┐ ┌──────────────┐
│  SQLite    │ │  Claude    │ │  Local       │
│  (local)   │ │  API       │ │  Filesystem  │
│            │ │            │ │              │
│ users      │ │ doc sort   │ │ file storage │
│ sessions   │ │ overview   │ │ folder mgmt  │
│ tasks      │ │ extraction │ │              │
│ config     │ │            │ │              │
└────────────┘ └────────────┘ └──────────────┘
```

## Component Details

### 1. Auth (`/api/auth/*`)

- Supabase Auth with Google as OAuth provider
- Client-side sign-in via `@supabase/supabase-js` OAuth flow
- Server validates Supabase JWT on every request (Bearer token)
- User whitelist in config (only allowed Google accounts can log in)
- Users auto-synced to local SQLite on first authenticated request

### 2. File Storage (`/api/docs/*`)

- Local filesystem storage in a configurable directory (`STORAGE_PATH`)
- File listing with metadata (size, modified date, type)
- Folder creation and file move operations
- File content reads for AI processing (Claude API)

### 3. AI Document Sorting

- On new file detection: send file content to Claude API
- Claude classifies the document and returns target folder path
- System moves the file to the target folder on local filesystem
- Sorting rules configurable per folder hierarchy

### 4. Task Overview Engine (`/api/overview/*`)

- Scans documents in relevant folders
- Claude API extracts tasks, deadlines, and priorities
- Aggregates into day/week/month views
- Outputs structured JSON rendered by frontend

### 5. Frontend Dashboard

- React + Vite SPA
- Pages: Dashboard (overview), Documents (browse/sort), Settings
- Simple clean UI — no design system, just clean CSS or Tailwind
- Google Sign-In button → Supabase OAuth redirect

## Implementation Phases

### Phase 1: Foundation (1-2 days)
- Express server with Supabase JWT verification
- React shell with Supabase login page
- SQLite schema (users, tasks, documents)

### Phase 2: File Storage (1 day)
- Local filesystem storage module
- File listing/browsing API
- Folder tree UI in frontend

### Phase 3: AI Sorting (1 day)
- Claude API integration for doc classification
- Sort trigger (on-upload and manual)
- Sort status/review UI

### Phase 4: Task Overviews (1 day)
- Claude extraction of tasks from documents
- Day/week/month aggregation logic
- Dashboard UI with overview cards

### Phase 5: Polish & Deploy (1 day)
- Error handling, loading states
- Deploy client to Netlify, server to preferred Node host
- README + setup docs

## Data Flow: Document Upload → Sorted

1. User drops file in storage "Inbox" folder (or uploads via web)
2. Scan detects new file → stores metadata in SQLite
3. Sort job picks up unsorted files → sends content to Claude API
4. Claude returns classification → file moved to target folder on local filesystem
5. Frontend updates to show sorted status

## Data Flow: Overview Generation

1. Cron/trigger runs daily
2. Scans all documents modified in the relevant period
3. Sends batch to Claude API with prompt: "Extract all tasks, deadlines, and priorities"
4. Claude returns structured task list
5. Stored in SQLite, rendered on dashboard

## Security Notes

- Supabase Auth (Google OAuth) ensures only authorized users access the site
- JWT-based auth — no sessions, no cookies
- Claude API key server-side only
- User data stored on local filesystem, never leaves the server except to Claude API (processing)
