import { NextResponse } from "next/server";
import { getUsers, getUserByEmail, generateUniquePurl } from "@/src/services/users";
import { addAuditLog } from "@/src/services/auditLog";
import fs from 'fs/promises';
import path from 'path';
import { sendEmail } from "@/src/utils/email";

const filePath = path.join(process.cwd(), "src", "data", "users.json");

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email em falta" }, { status: 400 });
    }
    if (email && email.length > 25) {
      return NextResponse.json({ error: "O email não pode ter mais de 25 caracteres." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    // Usa sempre getUserByEmail para procurar o utilizador
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json({ error: "Email não existe ou não está registado." }, { status: 404 });
    }
    if (!user.active) {
      return NextResponse.json({ error: "A conta deste email está inativa." }, { status: 403 });
    }

    // Atualiza o utilizador com novo purl
    const users = await getUsers();
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx === -1) {
      return NextResponse.json({ error: "Erro interno ao processar utilizador." }, { status: 500 });
    }

    const newPurl = await generateUniquePurl(user.email);
    users[idx].purl = newPurl;
    users[idx].desc = "asked new password"; 
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");

    // Registrar pedido de recuperação de senha no log de auditoria
    try {
      await addAuditLog({
        userID: user.id ,
        userName: user.name,
        description: `Pedido de recuperação de senha`,
        date: new Date().toISOString()
      });
    } catch (auditError) {
      console.error('Erro ao registrar no log de auditoria:', auditError);
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const link = `${baseUrl}/resetPassword?a=${newPurl}`;
      await sendEmail({
        to: user.email,
        subject: "Recuperação de Password - Cinema Management",
        text:
          `Foi feito um pedido de recuperação de password para a sua conta.\n\n` +
          `Para definir uma nova password, clique no link: ${link}\n\n` +
          `Se não foi você que fez este pedido, ignore este email.`,
        html:
          `<p>Foi feito um pedido de recuperação de password para a sua conta.</p>` +
          `<p>Para definir uma nova password, clique no link abaixo:</p>` +
          `<p><a href="${link}">${link}</a></p>` +
          `<p style="margin-top:16px;color:#888;">Se não foi você que fez este pedido, ignore este email.</p>`,
      });
    } catch (err) {
      console.error("Erro ao enviar email de recuperação de password:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao processar pedido de recuperação:", error);
    return NextResponse.json({ error: "Erro ao processar pedido." }, { status: 500 });
  }
}
