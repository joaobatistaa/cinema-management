import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateUniquePurl, getUserByEmail } from "@/src/services/users";
import { sendEmail } from "@/src/utils/email";
import { addAuditLog } from "@/src/services/auditLog";
import { isValidEmail, isValidNif, readUsersFile, writeUsersFile, getNewUserId } from "@/src/services/userList";

export async function GET() {
  try {
    const users = await readUsersFile();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao carregar os utilizadores." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const userData = await request.json();

    // Validação básica
    if (!userData.name || !userData.email || !userData.password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    if (userData.name && userData.name.length > 25) {
      return NextResponse.json({ error: "O nome não pode ter mais de 25 caracteres." }, { status: 400 });
    }
    if (userData.email && userData.email.length > 25) {
      return NextResponse.json({ error: "O email não pode ter mais de 25 caracteres." }, { status: 400 });
    }
    if (!isValidEmail(userData.email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }
    if (!isValidNif(userData.nif)) {
      return NextResponse.json({ error: "NIF inválido. Deve ter 9 dígitos." }, { status: 400 });
    }
    if (userData.role === "employee" && (!userData.salario || parseFloat(userData.salario) < 870)) {
      return NextResponse.json(
        { message: "O salário mínimo é 870€" },
        { status: 400 }
      );
    }
    const users = await readUsersFile();
    // Verificação de email único usando getUserByEmail
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json({ error: "Email já registado." }, { status: 400 });
    }
    const newId = await getNewUserId(users);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const purl = await generateUniquePurl(userData.email);
    const newUser = {
      id: newId,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      nif: userData.nif ?? null,
      salario: userData.salario ?? null,
      role: userData.role,
      active: userData.active !== undefined ? userData.active : 1,
      desc: userData.desc || "staff",
      tickets: [],
      purl
    };
    users.push(newUser);
    await writeUsersFile(users);

    // Registar ação no audit log
    // Extrair userID e userName do header (quem faz o pedido)
    let actorId = userData.actor.id;
    let actorName = userData.actor.name;
    try {
      await addAuditLog({ userID: actorId, userName: actorName, description: `Conta criada: ${newUser.email}`, date: new Date().toISOString() });
    } catch (auditErr) {
      console.error("Erro ao registar no audit log:", auditErr);
    }

    // Enviar email informativo ao novo utilizador
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: newUser.email,
          subject: "Conta criada no Cinema",
          text: `A sua conta foi criada por um administrador. No próximo início de sessão, deve redefinir a password para uma da sua escolha.`,
        })
      });
    } catch (emailErr) {
      console.error("Erro ao enviar email de notificação ao novo utilizador:", emailErr);
    }

    // Não devolver password
    const { password, ...userNoPass } = newUser;
    return NextResponse.json(userNoPass, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, updates, userId, userName } = await request.json();
    
    if (!id || !updates || typeof updates !== "object") {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }

    const users = await readUsersFile();
    const idx = users.findIndex(u => u.id === id);

    if (idx === -1) {
      return NextResponse.json({ message: "Utilizador não encontrado." }, { status: 404 });
    }

    // Regras para edição conforme estado atual
    if (users[idx].active === 0 && users[idx].desc === "deleted") {
      if (!(updates.active === 1 && (updates.desc === "" || updates.desc === undefined))) {
        return NextResponse.json({ message: "Não é possível editar um utilizador eliminado." }, { status: 403 });
      }
    }

    // Impedir email duplicado em caso de reativação
    if (
      updates.active === 1 &&
      users[idx].active === 0 &&
      users[idx].desc !== "deleted"
    ) {
      const emailEmUso = users.some(
        (u) =>
          u.id !== id &&
          u.email === users[idx].email &&
          u.active === 1 &&
          u.desc !== "deleted"
      );
      if (emailEmUso) {
        return NextResponse.json({ message: "Já existe uma conta ativa com este email." }, { status: 409 });
      }
    }

    if (updates.role === "employee" && (!updates.salario || parseFloat(updates.salario) < 830)) {
      return NextResponse.json(
        { message: "O salário mínimo para employees é 830€" },
        { status: 400 }
      );
    }

    // Verifica se email foi alterado
    const emailChanged = updates.email && updates.email !== users[idx].email;
    
    if (emailChanged) {
      // Verifica se o novo email já existe
      const existingUser = await getUserByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { message: "Este email já está em uso por outro utilizador" },
          { status: 400 }
        );
      }
      
      // Gera purl e marca conta como pendente
      const purl = require('crypto').randomBytes(32).toString('hex');
      updates.active = 0;
      updates.purl = purl;
      updates.desc = "pending email confirmation";
      
      // Envia email de confirmação
      try {
        await sendEmail({
          to: updates.email,
          subject: "Confirmação de alteração de email",
          text: `Olá ${updates.name || users[idx].name},\n\nO administrador alterou o email da sua conta.\n\nPor favor confirme este email clicando no link:\nhttp://localhost:3000/confirmEmail?a=${purl}\n\nObrigado!`,
          html: `<p>Olá ${updates.name || users[idx].name},</p>
            <p>O administrador alterou o email da sua conta.</p>
            <p>Por favor confirme este email clicando no link:</p>
            <a href="http://localhost:3000/confirmEmail?a=${purl}">Confirmar email</a>
            <p>Obrigado!</p>`
        });
      } catch (emailErr) {
        console.error("Erro ao enviar email de confirmação:", emailErr);
      }
    }

    const before = { ...users[idx] };
    users[idx] = { ...users[idx], ...updates };
    await writeUsersFile(users);

    let emailSubject = null;
    let emailText = null;

    // Email: conta reativada
    if (before.active === 0 && before.desc === "deleted" && users[idx].active === 1 && users[idx].desc === "") {
      emailSubject = "Conta reativada";
      emailText = `Olá ${users[idx].name},\n\nA sua conta foi reativada pelo administrador. Pode voltar a aceder ao sistema.`;

      try {
        await addAuditLog({
          userID: userId,
          userName: userName ,
          description: `Conta reativada: ${users[idx].email}`,
          date: new Date().toISOString()
        });
      } catch (auditErr) {
        console.error("Erro ao registar no audit log:", auditErr);
      }
    }

    // Email: dados atualizados (sem ser reativação ou eliminação)
    else if (
      (users[idx].active === 1 && users[idx].desc !== "deleted") &&
      (updates.name || updates.role || updates.salario || updates.nif)
    ) {
      emailSubject = "Dados da conta atualizados";
      emailText = `Olá ${users[idx].name},\n\nOs dados da sua conta foram atualizados pelo administrador.`;

      try {
        await addAuditLog({
          userID: userId || "unknown",
          userName: userName || "unknown",
          description: `Conta editada: ${users[idx].email}`,
          date: new Date().toISOString()
        });
      } catch (auditErr) {
        console.error("Erro ao registar no audit log:", auditErr);
      }
    }

    if (emailSubject && emailText) {
      try {
        await sendEmail({
          to: users[idx].email,
          subject: emailSubject,
          text: emailText,
        });
      } catch (err) {
        console.error("Erro ao enviar email de alteração de conta:", err);
      }
    }

    return NextResponse.json(users[idx]);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao atualizar utilizador." },
      { status: 500 }
    );
  }
}



// DELETE: elimina (soft-delete) um utilizador, colocando active=0 e desc="deleted"
export async function DELETE(request) {
  try {
    const { id, userId, userName } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "ID do utilizador é obrigatório." }, { status: 400 });
    }

    const users = await readUsersFile();
    const idx = users.findIndex(u => u.id === id);

    if (idx === -1) {
      return NextResponse.json({ message: "Utilizador não encontrado." }, { status: 404 });
    }

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0] + ' ' + now.toTimeString().split(' ')[0];

    users[idx].active = 0;
    users[idx].desc = "deleted";

    await writeUsersFile(users);

    // Registar no audit log
    try {
      await addAuditLog({
        userID: userId || "unknown",
        userName: userName || "unknown",
        description: `Conta eliminada: ${users[idx].email}`,
        date: now.toISOString()
      });
    } catch (auditErr) {
      console.error("Erro ao registar no audit log:", auditErr);
    }

    // Enviar email de eliminação
    try {
      await sendEmail({
        to: users[idx].email,
        subject: "Conta eliminada",
        text: `Olá ${users[idx].name},\n\nA sua conta foi eliminada pelo administrador. Se achar que foi um erro, contacte o suporte.`,
      });
    } catch (err) {
      console.error("Erro ao enviar email de eliminação:", err);
    }

    return NextResponse.json(users[idx]);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao eliminar utilizador." },
      { status: 500 }
    );
  }
}
