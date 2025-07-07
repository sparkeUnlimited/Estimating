import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

const usersPath = path.join(process.cwd(), 'data', 'users.json');

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ user: null });
  const data = verifyToken(token);
  if (!data) return NextResponse.json({ user: null });
  const users = JSON.parse(await fs.readFile(usersPath, 'utf8'));
  const user = users.find((u: any) => u.id === data.id && u.approved);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
