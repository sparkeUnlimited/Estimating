import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, signToken } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

const usersPath = path.join(process.cwd(), 'data', 'users.json');

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const data = JSON.parse(await fs.readFile(usersPath, 'utf8'));
  const user = data.find((u: any) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
  if (!user.approved) {
    return NextResponse.json({ message: 'Account not approved' }, { status: 403 });
  }
  const token = signToken({ id: user.id, email: user.email });
  const res = NextResponse.json({ success: true });
  res.cookies.set('token', token, { httpOnly: true, path: '/' });
  return res;
}
