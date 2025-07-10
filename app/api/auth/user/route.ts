import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { readUsers, User } from "@/lib/userStore";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ user: null });
    const data = verifyToken(token);
    if (!data) return NextResponse.json({ user: null });
    const users = await readUsers();
    const user = users.find((u: User) => u.id === data.id && u.approved);
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
