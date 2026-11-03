import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
  response.cookies.set('wepass_session', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
