-- Add quests table to schema
CREATE TABLE IF NOT EXISTS quests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problems TEXT NOT NULL, -- JSON array of problems
  music_url TEXT, -- YouTube URL for final performance
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Seed default quests (will replace if they already exist)
INSERT OR REPLACE INTO quests (id, title, description, problems) VALUES 
('intro-algebra', 'Intro to Algebra', 'Basic algebra problems for beginners', 
'[{"question":"Solve: x + 5 = 12","answer":"7","type":"multiple-choice","choices":["5","7","17","12"],"stage":1},{"question":"The answer to x - 3 = 10 is ___","answer":"13","type":"fill-blank","stage":2},{"question":"x + 8 = 20. True or False: x = 12","answer":"True","type":"true-false","choices":["True","False"],"stage":3},{"question":"Solve: x - 7 = 5","answer":"12","type":"short-answer","stage":4},{"question":"If x + 9 = 15, what is x?","answer":"6","type":"multiple-choice","choices":["3","6","9","24"],"stage":5}]'),

('linear-equations', 'Linear Equations', 'Practice solving linear equations', 
'[{"question":"Solve: 2x = 10","answer":"5","type":"multiple-choice","choices":["2","5","8","20"],"stage":1},{"question":"3x + 6 = 15. The value of x is ___","answer":"3","type":"fill-blank","stage":2},{"question":"4x - 8 = 0. True or False: x = 2","answer":"True","type":"true-false","choices":["True","False"],"stage":3},{"question":"Solve: 5x + 10 = 35","answer":"5","type":"short-answer","stage":4},{"question":"If 2x - 4 = 10, what is x?","answer":"7","type":"multiple-choice","choices":["3","5","7","14"],"stage":5}]'),

('finding-x-dance', 'Finding x: Dance Mission', 'Solve equations and unlock dance moves!', 
'[{"question":"Solve: x + 3 = 8","answer":"5","type":"multiple-choice","choices":["3","5","8","11"],"stage":1,"move":"Step Touch","songPart":"Intro"},{"question":"2x = 12. x = ___","answer":"6","type":"fill-blank","stage":2,"move":"Grapevine","songPart":"Verse 1"},{"question":"x - 4 = 7. True or False: x = 11","answer":"True","type":"true-false","choices":["True","False"],"stage":3,"move":"Box Step","songPart":"Pre-Chorus"},{"question":"Solve: 3x + 5 = 20","answer":"5","type":"short-answer","stage":4,"move":"Pivot Turn","songPart":"Chorus"},{"question":"If 4x - 8 = 12, what is x?","answer":"5","type":"multiple-choice","choices":["2","3","5","8"],"stage":5,"move":"Jazz Square","songPart":"Bridge"}]');
