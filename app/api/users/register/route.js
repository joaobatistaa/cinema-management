import { NextResponse } from "next/server";
import { addUser } from "@/src/services/users";
import { sendEmail } from "@/src/utils/email";
import { addAuditLog } from "@/src/services/auditLog";

export async function POST(request) {
  try {
    const userData = await request.json();
    if (!userData.name || !userData.email || !userData.password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    if (userData.name && userData.name.length > 25) {
      return NextResponse.json({ error: "O nome não pode ter mais de 25 caracteres." }, { status: 400 });
    }
    if (userData.email && userData.email.length > 25) {
      return NextResponse.json({ error: "O email não pode ter mais de 25 caracteres." }, { status: 400 });
    }
    // Validação do NIF (opcional, mas se existir tem de ser válido)
    if (userData.nif && !/^\d{9}$/.test(userData.nif)) {
      return NextResponse.json({ error: "NIF inválido. Deve ter 9 dígitos." }, { status: 400 });
    }
    // Validação da password: mínimo 8 caracteres, pelo menos uma letra e um caracter especial
    if (
      !/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).*$/.test(userData.password)
    ) {
      return NextResponse.json(
        { error: "A password deve ter pelo menos 8 caracteres, uma letra e um caracter especial." },
        { status: 400 }
      );
    }
    const newUser = await addUser(userData);
    const { password, ...userWithoutPassword } = newUser;

    // Registrar criação de utilizador no log de auditoria
    try {
      await addAuditLog({
        userID: newUser.id,
        userName: newUser.name,
        description: `Novo utilizador registado: ${newUser.email} (ID: ${newUser.id})`,
        date: new Date().toISOString()
      });
    } catch (auditError) {
      console.error('Erro ao registrar no log de auditoria:', auditError);
    }

    // Enviar email de confirmação
    const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/confirmEmail?a=${newUser.purl}`;
    await sendEmail({
      to: newUser.email,
      subject: "Confirmação de Email - Cinema Management",
      text: `Por favor, confirme o seu email clicando no link: ${confirmUrl}`,
      html: `<p>Bem-vindo ao Cinema Management!</p>
             <p>Para confirmar o seu email, clique no link abaixo:</p>
             <p><a href="${confirmUrl}">${confirmUrl}</a></p>`
    });



    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
