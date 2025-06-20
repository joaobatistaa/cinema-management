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

    const {
      email,
      movie_title,
      room_name,
      session_datetime,
      actorId = "unknown",
      actorName = "unknown",
      ...dataWithoutEmailAndActor
    } = data;

    const newTicket = addTicket(dataWithoutEmailAndActor);

    // Enviar email com bilhete (se aplicável)
    if (email) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        `ticket-${newTicket.id}`
      )}`;
      const html = `
        <h2>O seu bilhete de cinema</h2>
        <p>Filme: <b>${movie_title || ""}</b></p>
        <p>Sessão: <b>${dataWithoutEmailAndActor.session_id || ""}</b></p>
        <p>Lugar: <b>${
          dataWithoutEmailAndActor.seat
            ? String.fromCharCode(64 + dataWithoutEmailAndActor.seat.row) +
              dataWithoutEmailAndActor.seat.col
            : ""
        }</b></p>
        <p>Preço total: <b>${dataWithoutEmailAndActor.buy_total}€</b></p>
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

    // Preparar dados para o log de auditoria
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

    const seat = dataWithoutEmailAndActor.seat
      ? String.fromCharCode(64 + dataWithoutEmailAndActor.seat.row) +
        dataWithoutEmailAndActor.seat.col
      : "";

    const itemNames = dataWithoutEmailAndActor.bar_items
      .map((item) => item.name + " x" + item.quantity)
      .join(", ");

    const logDescription = `Novo bilhete com o ID ${newTicket.id} comprado para o filme ${movie_title} na sessão do dia ${formattedDate} às ${formattedTime}, na sala ${room_name} e lugar ${seat}. Valor gasto no bar: ${dataWithoutEmailAndActor.bar_total}€ - Itens do bar (${itemNames}). Valor do bilhete: ${dataWithoutEmailAndActor.ticket_price}€. Valor total: ${dataWithoutEmailAndActor.buy_total}€`;

    // Adicionar no log de auditoria
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
