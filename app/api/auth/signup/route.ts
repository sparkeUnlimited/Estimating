import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

const usersPath = path.join(process.cwd(), 'data', 'users.json');

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const users = JSON.parse(await fs.readFile(usersPath, 'utf8'));
  if (users.find((u: any) => u.email === email)) {
    return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
  }
  const id = Date.now();
  users.push({ id, email, passwordHash: hashPassword(password), approved: false });
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
  return NextResponse.json({ success: true });
}
