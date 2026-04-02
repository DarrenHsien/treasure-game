// JWT middleware: reads Bearer token from Authorization header, verifies it, attaches req.user = {id, username}.
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'treasure-hunt-secret-key';

export function requireAuth(req, res, next) {
  // Extract token from "Authorization: Bearer <token>"
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
