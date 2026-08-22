import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'samadhan-ai-civic-secret-key-2026';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    departmentId?: string;
    designation?: string;
    officerBadge?: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // 1. Try Local JWT verification first (for OTP & Officer sessions)
  try {
    const decodedJwt = jwt.verify(token, JWT_SECRET) as any;
    if (decodedJwt && decodedJwt.uid) {
      req.user = decodedJwt;
      return next();
    }
  } catch (jwtErr) {
    // If not standard JWT, attempt Firebase ID Token verification
  }

  // 2. Try Firebase ID Token verification
  try {
    const decodedFirebaseToken: DecodedIdToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedFirebaseToken.uid,
      name: decodedFirebaseToken.name || decodedFirebaseToken.email?.split('@')[0] || 'Citizen',
      email: decodedFirebaseToken.email,
      phone: decodedFirebaseToken.phone_number,
      role: 'CITIZEN',
    };
    return next();
  } catch (error) {
    console.error('Error verifying Auth token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication credentials' });
  }
};
