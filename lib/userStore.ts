import { promises as fs } from "fs";
import path from "path";

const usersPath = path.join(process.cwd(), "data", "users.json");

export type User = {
  id: number | string;
  email: string;
  passwordHash: string;
  approved: boolean;
};

export async function readUsers(): Promise<User[]> {
  try {
    const text = await fs.readFile(usersPath, "utf8");
    return JSON.parse(text || "[]");
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

export async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(path.dirname(usersPath), { recursive: true });
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
}
