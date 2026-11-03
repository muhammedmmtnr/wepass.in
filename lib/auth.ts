import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'wepass-super-secret-production-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  restaurantId?: string;
}

export function signToken(payload: TokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getAuthSession(req: NextRequest): Promise<TokenPayload | null> {
  // 1. Try Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // 2. Try cookie
  const cookie = req.cookies.get('wepass_session');
  if (cookie?.value) {
    return verifyToken(cookie.value);
  }

  return null;
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: string[]
): Promise<{ user: TokenPayload | null; errorResponse?: NextResponse }> {
  const session = await getAuthSession(req);
  if (!session) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 }),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Forbidden. Insufficient permissions.' }, { status: 403 }),
    };
  }

  return { user: session };
}
