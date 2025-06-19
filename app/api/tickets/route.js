import { NextResponse } from "next/server";
import { getTickets, addTicket, filterTickets } from "@/src/services/tickets";
import { sendEmail } from "@/src/utils/email";
import { addAuditLog } from "@/src/services/auditLog";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      const filtered = filterTickets({ id });
      return NextResponse.json(filtered);
    }
    const tickets = getTickets();
    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar bilhetes" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log(data);

    const {
      email,
      movie_title,
      room_name,
      session_datetime,
      ...dataWithoutEmail
    } = data;
    const newTicket = addTicket(dataWithoutEmail);

    if (email) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        `ticket-${newTicket.id}`
      )}`;
      const html = `
        <h2>O seu bilhete de cinema</h2>
        <p>Filme: <b>${movie_title || ""}</b></p>
        <p>Sessão: <b>${dataWithoutEmail.session_id || ""}</b></p>
        <p>Lugar: <b>${
          dataWithoutEmail.seat
            ? String.fromCharCode(64 + dataWithoutEmail.seat.row) +
              dataWithoutEmail.seat.col
            : ""
        }</b></p>
        <p>Preço total: <b>${dataWithoutEmail.buy_total}€</b></p>
        <p>Apresente este QR Code à entrada:</p>
        <img src="${qrUrl}" alt="QR Code" />
        <p>Número do bilhete: <b>${newTicket.id}</b></p>
      `;

      await sendEmail({
        to: email,
        subject: "O seu bilhete de cinema",
        html
      });
    }

    // Registar ação no audit log
    // Extrair userID e userName do header (quem faz o pedido)
    let actorId = request.headers.get("x-user-id") || "unknown";
    let actorName = request.headers.get("x-user-name") || "unknown";
    const sessionDate = new Date(session_datetime);

    const formattedDate = sessionDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const formattedTime = sessionDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const seat = dataWithoutEmail.seat
      ? String.fromCharCode(64 + dataWithoutEmail.seat.row) +
        dataWithoutEmail.seat.col
      : "";

    const itemNames = dataWithoutEmail.bar_items
      .map((item) => item.name + " x" + item.quantity)
      .join(", ");

    const logDescription = `Novo bilhete com o ID ${newTicket.id} comprado para o filme ${movie_title} na sessão do dia ${formattedDate} às ${formattedTime}, na sala ${room_name} e lugar ${seat}. Valor gasto no bar: ${dataWithoutEmail.bar_total}€ - Itens do bar (${itemNames}). Valor do bilhete: ${dataWithoutEmail.ticket_price}€. Valor total: ${dataWithoutEmail.buy_total}€`;

    try {
      await addAuditLog({
        userID: actorId,
        userName: actorName,
        description: logDescription,
        date: new Date().toISOString()
      });
    } catch (auditErr) {
      console.error("Erro ao registar no audit log:", auditErr);
    }

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar bilhete" },
      { status: 500 }
    );
  }
}
