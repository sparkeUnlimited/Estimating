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
    const user = users.find((u: User) => u.email === email);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    user.passwordHash = hashPassword(password);
    await writeUsers(users);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
