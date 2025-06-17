import { NextResponse } from "next/server";
import { getTickets, addTicket, filterTickets } from "@/src/services/tickets";
import { sendEmail } from "@/src/utils/email"; // Certifique-se que existe este utilitário

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      // Busca apenas o bilhete com o id fornecido
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
    const { email, movie_title, ...dataWithoutEmail } = data;
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

      // Usa a função utilitária para enviar email
      await sendEmail({
        to: email,
        subject: "O seu bilhete de cinema",
        html
      });
    }

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar bilhete" },
      { status: 500 }
    );
  }
}
