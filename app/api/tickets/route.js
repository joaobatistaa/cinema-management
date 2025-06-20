import { NextResponse } from "next/server";
import { getTickets, addTicket, filterTickets } from "@/src/services/tickets";
import { sendEmail } from "@/src/utils/email";
import { addAuditLog } from "@/src/services/auditLog";
import { getUserByEmail } from "@/src/services/users";

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

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email do cliente é obrigatório" },
        { status: 400 }
      );
    }

    // Validar se email existe ou é guest@guest.com
    if (email !== "guest@guest.com") {
      const user = await getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: "Email não registado no sistema" },
          { status: 400 }
        );
      }
    }

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

      try {
        await sendEmail({
          to: email,
          subject: "O seu bilhete de cinema",
          html
        });
      } catch (error) {
        console.error("Failed to send email:", error);
      }
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

    await addAuditLog({
      actorId,
      actorName,
      action: "CREATE_TICKET",
      description: `Bilhete criado para ${email} (${movie_title} - ${formattedDate} ${formattedTime})`,
      metadata: {
        ticketId: newTicket.id,
        movie: movie_title,
        session: session_datetime,
        room: room_name
      }
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar bilhete:", error);
    return NextResponse.json(
      { error: "Erro ao criar bilhete" },
      { status: 500 }
    );
  }
}
