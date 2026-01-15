-- Drop tables if they exist to start fresh (optional, for dev)
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS games;

-- Games Table: Stores active game sessions
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,           -- Unique Game ID (e.g. UUID)
  pin TEXT UNIQUE NOT NULL,      -- "1234!" or generated PIN
  status TEXT DEFAULT 'idle',    -- 'idle', 'playing', 'paused', 'finished'
  current_stage INTEGER DEFAULT 0,
  quest_id TEXT NOT NULL,
  total_stages INTEGER DEFAULT 0,
  timer_duration INTEGER DEFAULT 30,  -- Timer duration in seconds (default 30)
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Students Table: Stores players in a game
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,           -- Unique Student ID (UUID)
  game_id TEXT NOT NULL,         -- Links to games.id
  name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  current_stage INTEGER DEFAULT 1,
  has_answered BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_games_pin ON games(pin);
CREATE INDEX IF NOT EXISTS idx_students_game_id ON students(game_id);
