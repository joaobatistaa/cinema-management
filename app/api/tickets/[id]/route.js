import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import { addAuditLog } from "@/src/services/auditLog";

const filePath = path.join(process.cwd(), "src", "data", "tickets.json");
const sessionsPath = path.join(process.cwd(), "src", "data", "sessions.json");

export async function GET(request, context) {
  const { id } = context.params;
  const tickets = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const ticket = tickets.find((t) => String(t.id) === String(id));
  if (!ticket) {
    return NextResponse.json(
      { error: "Bilhete não encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(ticket);
}

function diffBarItems(oldItems, newItems) {
  const oldMap = new Map(oldItems.map((item) => [item.id, item]));
  const newMap = new Map(newItems.map((item) => [item.id, item]));

  const added = [];
  const removed = [];
  const quantityChanged = [];

  for (const newItem of newItems) {
    const oldItem = oldMap.get(newItem.id);
    if (!oldItem) {
      added.push(newItem);
    } else {
      const newQty = Number(newItem.quantity) || 0;
      const oldQty = Number(oldItem.quantity) || 0;

      if (newQty > oldQty) {
        quantityChanged.push({
          item: newItem,
          change: newQty - oldQty,
          type: "increase"
        });
      } else if (newQty < oldQty) {
        quantityChanged.push({
          item: newItem,
          change: oldQty - newQty,
          type: "decrease"
        });
      }
    }
  }

  for (const oldItem of oldItems) {
    if (!newMap.has(oldItem.id)) {
      removed.push(oldItem);
    }
  }

  return { added, removed, quantityChanged };
}

export async function PUT(request, { params }) {
  const { id } = params;
  const tickets = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const idx = tickets.findIndex((t) => String(t.id) === String(id));

  if (idx === -1) {
    return NextResponse.json(
      { error: "Bilhete não encontrado" },
      { status: 404 }
    );
  }

  const oldItems = tickets[idx].bar_items;
  const oldSessionId = tickets[idx].session_id;

  const data = await request.json();

  // 🔁 Extrair actorId e actorName do corpo do POST
  const actorId = data.actorId || "unknown";
  const actorName = data.actorName || "unknown";

  // ❌ Remover actorId e actorName do objeto que será salvo como bilhete
  const { actorId: _, actorName: __, ...ticketData } = data;

  tickets[idx] = { ...tickets[idx], ...ticketData, id: tickets[idx].id };
  fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2));

  const newItems = ticketData.bar_items;

  const { added, removed, quantityChanged } = diffBarItems(oldItems, newItems);

  let mensagemBar = "";

  if (added.length > 0) {
    mensagemBar +=
      "Itens adicionados: " +
      added.map((i) => `${i.name} (x${i.quantity})`).join(", ") +
      ". ";
  }

  if (removed.length > 0) {
    mensagemBar +=
      "Itens removidos: " +
      removed.map((i) => `${i.name} (x${i.quantity})`).join(", ") +
      ". ";
  }

  if (quantityChanged.length > 0) {
    mensagemBar +=
      "Itens com quantidade alterada: " +
      quantityChanged
        .map((change) => {
          const sinal = change.type === "increase" ? "+" : "-";
          return `${change.item.name} (${sinal}${change.change})`;
        })
        .join(", ") +
      ".";
  }

  if (!mensagemBar) {
    mensagemBar = "Nenhuma alteração nos itens de bar.";
  }

  let mensagemSessao = "";

  if (oldSessionId == ticketData.session_id) {
    mensagemSessao = "Nenhuma alteração na sessão.";
  } else {
    const sessions = JSON.parse(fs.readFileSync(sessionsPath, "utf-8"));
    const sessionOld = sessions.find((t) => String(t.id) == String(oldSessionId));
    const sessionNew = sessions.find((t) => String(t.id) == String(ticketData.session_id));

    const sessionDateOld = new Date(sessionOld.date);
    const sessionDateNew = new Date(sessionNew.date);

    const formattedDateOld = sessionDateOld.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });

    const formattedTimeOld = sessionDateOld.toLocaleTimeString("pt-BR", {
      hour: "2-digit", minute: "2-digit"
    });

    const formattedDateNew = sessionDateNew.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });

    const formattedTimeNew = sessionDateNew.toLocaleTimeString("pt-BR", {
      hour: "2-digit", minute: "2-digit"
    });

    mensagemSessao =
      `Sessão alterada do dia ${formattedDateOld} às ${formattedTimeOld} ` +
      `para o dia ${formattedDateNew} às ${formattedTimeNew}.`;
  }

  try {
    await addAuditLog({
      userID: actorId,
      userName: actorName,
      description: `Bilhete com o ID ${id} foi alterado. Bar: ${mensagemBar} Sessão: ${mensagemSessao}`,
      date: new Date().toISOString()
    });
  } catch (auditErr) {
    console.error("Erro ao registar no audit log:", auditErr);
  }

  return NextResponse.json(tickets[idx]);
}


export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const tickets = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const idx = tickets.findIndex((t) => String(t.id) === String(id));
    if (idx === -1) {
      return NextResponse.json(
        { error: "Bilhete não encontrado" },
        { status: 404 }
      );
    }

    // Remover o bilhete
    const removedTicket = tickets.splice(idx, 1)[0];

    // Obter os dados do body (DELETE também pode ter body no Next.js)
    const body = await request.json();
    const { actorId = "unknown", actorName = "unknown", refundMethod } = body;

    // Registar ação no audit log
    const descricao = `Bilhete com o ID ${id} cancelado${
      refundMethod ? ` com reembolso via ${refundMethod}` : ""
    }`;

    try {
      await addAuditLog({
        userID: actorId,
        userName: actorName,
        description: descricao,
        date: new Date().toISOString()
      });
    } catch (auditErr) {
      console.error("Erro ao registar no audit log:", auditErr);
    }

    // Gravar alterações
    fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao cancelar bilhete:", err);
    return NextResponse.json(
      { error: "Erro ao cancelar bilhete" },
      { status: 500 }
    );
  }
}
