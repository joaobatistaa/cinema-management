import { NextResponse } from "next/server";
import { authenticateUser, getUserByEmail } from "@/src/services/users";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    // Busca o utilizador pelo email
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }
    // Verifica se está pendente de confirmação de email
    if (
      user.active === 0 &&
      user.desc === "pending email confirmation"
    ) {
      return NextResponse.json(
        { error: "Tem de confirmar o email antes de iniciar sessão." },
        { status: 403 }
      );
    }
    // Se precisa de definir nova password, redirecionar para reset
    if (user.desc === "needs to set new password" && user.purl) {
      return NextResponse.json(
        { redirectTo: `resetPassword?purl=${user.purl}` },
        { status: 307 }
      );
    }
    // Autentica a password (bcrypt)
    const authenticatedUser = await authenticateUser(email, password);
    return NextResponse.json(authenticatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
