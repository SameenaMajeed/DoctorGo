import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authenticateToken = (requiredRole?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
      console.log('body',req.cookies)

      if (!token) {
        res.status(401).json({ message: 'Access token is missing or invalid' });
        return;
      }

      const decoded = verifyToken(token);
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
      }

      console.log('Decoded token:', decoded);

      // Populate req.data with decoded token info
      req.data = {
        id: decoded.id, 
        role: decoded.role,
        email: decoded.email,
      }as {
        id: string;
        role: string;
        userId?: string;
        email: string;
      }

      // // If it's a user, add userId to req.data
      // if (decoded.role === 'user') {
      //   req.data.userId = decoded.id;
      // }

      // Check if the required role matches the token's role
      if (requiredRole && decoded.role !== requiredRole) {
        console.log(`Forbidden: Role mismatch. Required: ${requiredRole}, Found: ${decoded.role}`);        
        res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        return;
      }

      next();
    } catch (error: any) {
      console.error('Token Authentication Error:', error.message);
      res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
  };
};