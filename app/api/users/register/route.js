import { NextResponse } from "next/server";
import { addUser } from "@/src/services/users";

export async function POST(request) {
  try {
    const userData = await request.json();
    if (!userData.name || !userData.email || !userData.password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    const newUser = await addUser(userData);
    // Nunca retornar a password no response
    const { password, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
