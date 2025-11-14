import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserById } from '../utils/auth';

export interface AdminRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    avatar?: string | null;
    provider: string;
    isVerified: boolean;
    roles?: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Middleware to authenticate admin users
 * Verifies JWT token and checks if user has admin role
 */
export async function authenticateAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  try {
    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // Check if user has admin role
    const isAdmin = user.roles && user.roles.includes('admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    (req as AdminRequest).user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
