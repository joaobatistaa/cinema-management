import { NextResponse } from "next/server";
import { getUserByEmail, generateUniquePurl, getUsers } from "@/src/services/users";
import { promises as fs } from "fs";
import path from "path";
import { sendEmail } from "@/src/utils/email";

const filePath = path.join(process.cwd(), "src", "data", "users.json");

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email em falta" }, { status: 400 });
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
