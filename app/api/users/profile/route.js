import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "users.json");
import { sendEmail } from "@/src/utils/email";
import { generateUniquePurl } from "@/src/services/users";

export async function GET(request) {
  try {
    // Simulação: obter email do header (ajustar para autenticação real)
    const email = request.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const fileContents = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(fileContents);
    const user = users.find(u => u.email === email && u.active && u.role === "customer");
    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado ou sem permissões." }, { status: 404 });
    }
    // Não devolver password
    const { password, ...userNoPass } = user;
    return NextResponse.json(userNoPass);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao obter perfil." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const email = request.headers.get("x-user-email");
    if (!email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const body = await request.json();
    const { name, email: newEmail, nif } = body;
    if (!name || !newEmail) {
      return NextResponse.json({ error: "Nome e email são obrigatórios." }, { status: 400 });
    }
    const fileContents = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(fileContents);
    const userIdx = users.findIndex(u => u.email === email && u.active && u.role === "customer");
    if (userIdx === -1) {
      return NextResponse.json({ error: "Utilizador não encontrado ou sem permissões." }, { status: 404 });
    }
    const user = users[userIdx];
    // 1. Validar se mudou algo
    if (
      user.name === name &&
      user.email === newEmail &&
      (user.nif || "") === (nif || "")
    ) {
      return NextResponse.json({ error: "Nenhuma alteração detectada." }, { status: 400 });
    }
    // 2. Validar nome
    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json({ error: "O nome deve ter pelo menos 3 caracteres." }, { status: 400 });
    }
    // 3. Validar NIF
    if (nif && !/^\d{9}$/.test(nif)) {
      return NextResponse.json({ error: "NIF inválido. Deve ter 9 dígitos ou ficar vazio." }, { status: 400 });
    }
    // 4. Validar email (apenas se mudou)
    let purl = null;
    let emailChanged = false;
    if (newEmail !== user.email) {
      const emailExists = users.some(u => u.email === newEmail && u.email !== user.email);
      if (emailExists) {
        return NextResponse.json({ error: "Já existe um utilizador com esse email." }, { status: 400 });
      }
      if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
        return NextResponse.json({ error: "Email inválido." }, { status: 400 });
      }
      // Gerar novo purl único e marcar como inativo + desc
      purl = await generateUniquePurl(newEmail);
      users[userIdx] = { ...user, name, email: newEmail, nif, purl, active: 0, desc: "user changed email" };
      emailChanged = true;
    } else {
      users[userIdx] = { ...user, name, email: newEmail, nif };
    }
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));
    if (emailChanged) {
      // Enviar email de confirmação
      const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/confirmEmail?a=${purl}`;
      await sendEmail({
        to: newEmail,
        subject: "Confirmação de alteração de email - Cinema Management",
        text: `Olá ${name},\n\nFoi feito um pedido de alteração de email para a sua conta. Para confirmar, clique no link: ${confirmUrl}`,
        html: `<p>Olá ${name},</p><p>Foi feito um pedido de alteração de email para a sua conta.</p><p>Para confirmar, clique no link abaixo:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`
      });
    }
    const { password, ...userNoPass } = users[userIdx];
    return NextResponse.json(userNoPass);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
  }
}


