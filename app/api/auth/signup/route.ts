import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { readUsers, writeUsers, User } from "@/lib/userStore";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }
    const users = await readUsers();
    if (users.find((u: User) => u.email === email)) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }
    const id = Date.now();
    users.push({ id, email, passwordHash: hashPassword(password), approved: false });
    await writeUsers(users);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
