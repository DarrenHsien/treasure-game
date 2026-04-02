// Scores routes: POST /api/scores (save score), GET /api/scores/me (get user's scores).
import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Saves a game score for the authenticated user: accepts {score}, returns saved record.
router.post('/', requireAuth, (req, res) => {
  const { score } = req.body;
  if (score === undefined || typeof score !== 'number') {
    return res.status(400).json({ error: 'Score must be a number' });
  }
  try {
    const stmt = db.prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)');
    const result = stmt.run(req.user.id, score);
    const saved = db.prepare('SELECT * FROM scores WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(saved);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Returns the last 10 scores for the authenticated user, newest first.
router.get('/me', requireAuth, (req, res) => {
  try {
    const scores = db.prepare(
      'SELECT id, score, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC LIMIT 10'
    ).all(req.user.id);
    return res.json(scores);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
