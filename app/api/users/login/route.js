import { NextResponse } from "next/server";
import { authenticateUser } from "@/src/services/users";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    const user = await authenticateUser(email, password);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
