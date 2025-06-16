import { NextResponse } from "next/server";
import { getUserByEmail } from "@/src/services/users";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email em falta" }, { status: 400 });
  }
  const user = await getUserByEmail(email.trim());
  if (!user || !user.active) {
    return NextResponse.json(null, { status: 404 });
  }
  return NextResponse.json(user);
}
