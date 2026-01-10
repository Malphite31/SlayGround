# Cloudflare D1 Backend Integration

## Overview
We migrated the state management from local-only (Zustand) to a distributed model using **Cloudflare D1** (Serverless SQLite) and **Pages Functions**. This enables multiplayer capabilities without external providers like Supabase.

## Architecture
- **Database**: Cloudflare D1 (`slayground-db`)
- **API**: Cloudflare Pages Functions (`functions/api/*`)
- **Frontend**: React + Zustand (syncs via polling)

## API Endpoints (`functions/api`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/game/create` | Creates a new game session with a PIN (Default: "1234!") |
| `POST` | `/api/student/join` | Adds a student to the game session |
| `GET` | `/api/game/:pin` | Returns full game state for client polling |
| `POST` | `/api/game/update` | Updates game stage/status (Host only) |
| `POST` | `/api/student/answer` | Records student answer and updates score |

## Deployment Guide

### 1. Prerequisites
- GitHub Repository connected to Cloudflare Pages.
- Cloudflare Account with D1 enabled.

### 2. Initial Setup (Dashboard)
1.  **Create Pages Project**: Connect Git repo, select `Vite` framework.
2.  **Create Database**: Cloudflare Dashboard > Workers & Pages > D1 > Create `slayground-db`.

### 3. Database Configuration
**This is the most critical step.**
1.  Go to your Pages Project **Settings** > **Functions**.
2.  Scroll to **D1 Database Bindings**.
3.  Add Binding:
    *   Variable: `DB`
    *   My Database: `slayground-db`
4.  **Redeploy** the latest build for changes to take effect.

### 4. Initialize Tables
Run this SQL in the D1 Console (Cloudflare Dashboard > D1 > `slayground-db` > Console):
```sql
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  pin TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'idle',
  current_stage INTEGER DEFAULT 0,
  quest_id TEXT NOT NULL,
  total_stages INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  current_stage INTEGER DEFAULT 1,
  has_answered BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_games_pin ON games(pin);
CREATE INDEX IF NOT EXISTS idx_students_game_id ON students(game_id);
```

## How to Test
1.  Open the deployed URL (Host).
2.  Select a Quest and launch.
3.  Open a new window/phone (Student).
4.  Join using PIN `1234!` and a name.
5.  Verify both screens are synced!

## Troubleshooting

### "Cannot read properties of undefined (reading 'prepare')"
This means the **D1 Binding** is missing from the environment you are currently viewing.

**The Fix:**
1.  Go to Cloudflare Pages > Settings > Functions.
2.  You will see two tabs: **Production** and **Preview**.
3.  You likely set the `DB` key for Production but **forgot to add it for Preview**.
4.  Add the same `DB` binding to the **Preview** tab.
5.  Redeploy.
