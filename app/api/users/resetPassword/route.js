import { NextResponse } from "next/server";
import { getUsers } from "@/src/services/users";
import { promises as fs } from "fs";
import path from "path";
import { sendEmail } from "@/src/utils/email";
let bcrypt;
try {
  bcrypt = require("bcryptjs");
} catch (e) {
  throw new Error("O módulo 'bcryptjs' não está instalado. Execute 'npm install bcryptjs' na raiz do projeto.");
}

const filePath = path.join(process.cwd(), "src", "data", "users.json");

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const purl = searchParams.get("purl");
  if (!purl) {
    return NextResponse.json({ error: "Purl em falta" }, { status: 400 });
  }
  const users = await getUsers();
  const user = users.find(u => u.purl === purl && !!u.active);
  if (!user) {
    return NextResponse.json({ error: "Purl inválido" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(request) {
  try {
    const { purl, password } = await request.json();
    if (!purl || !password) {
      return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
    }
    if (!/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).*$/.test(password)) {
      return NextResponse.json({ error: "A password deve ter pelo menos 8 caracteres, uma letra e um caracter especial." }, { status: 400 });
    }
    const users = await getUsers();
    const idx = users.findIndex(u => u.purl === purl && !!u.active);
    if (idx === -1) {
      return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 404 });
    }
    const user = users[idx];
    // Verificar se a nova password é igual à antiga
    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
      return NextResponse.json({ error: "Password invalida." }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users[idx].password = hashedPassword;
    users[idx].purl = null; 
    users[idx].desc = "changed password"; 

    await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");

    // Enviar email de notificação de alteração de password
    try {
      await sendEmail({
        to: user.email,
        subject: "Password alterada - Cinema Management",
        text:
          `A sua password foi alterada com sucesso.\n\n` +
          `Se não foi você que fez esta alteração, contacte imediatamente o suporte.`,
        html:
          `<p>A sua password foi alterada com sucesso.</p>` +
          `<p style="margin-top:16px;color:#888;">Se não foi você que fez esta alteração, contacte imediatamente o suporte.</p>`,
      });
    } catch (err) {
      console.error("Erro ao enviar email de alteração de password:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao alterar password." }, { status: 500 });
  }
}
