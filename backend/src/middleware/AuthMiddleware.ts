import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-key-change-in-production';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscriptionStatus: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Also support token from query parameter (for SSE EventSource)
  if (!token && req.query.token) {
    token = req.query.token as string;
  }

  // Easy development bypass: if no token is sent, or if token is 'dev-mock-token'
  if (!token || token === 'dev-mock-token') {
    req.user = {
      id: 'mock-user-id-12345',
      email: 'premium-user@researchgpt.ai',
      subscriptionStatus: 'PRO'
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      subscriptionStatus: decoded.subscriptionStatus || 'FREE'
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired authentication token.' });
  }
};
