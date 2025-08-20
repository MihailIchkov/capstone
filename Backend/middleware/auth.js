import jwt from 'jsonwebtoken';
const { JsonWebTokenError, TokenExpiredError } = jwt;

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err instanceof TokenExpiredError) {
        return res.status(401).json({ error: 'Token has expired' });
      }
      if (err instanceof JsonWebTokenError) {
        return res.status(403).json({ error: 'Invalid access token' });
      }
      return res.status(500).json({ error: 'Failed to authenticate token' });
    }

    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}

export { authenticateToken, requireAdmin };