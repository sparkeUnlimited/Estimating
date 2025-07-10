import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken } from "@/lib/auth";
import { readUsers, User } from "@/lib/userStore";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }
    const users = await readUsers();
    const user = users.find((u: User) => u.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    if (!user.approved) {
      return NextResponse.json({ message: "Account not approved" }, { status: 403 });
    }
    const token = signToken({ id: user.id, email: user.email });
    const res = NextResponse.json({ success: true });
    res.cookies.set("token", token, { httpOnly: true, path: "/" });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
