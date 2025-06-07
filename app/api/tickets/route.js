import { NextResponse } from "next/server";
import { getTickets, addTicket } from "@/src/services/tickets";

// GET: retorna todos os bilhetes
export async function GET() {
  try {
    const tickets = await getTickets();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Erro ao ler o ficheiro de bilhetes:", error);
    return NextResponse.json(
      { error: "Erro ao carregar bilhetes" },
      { status: 500 }
    );
  }
}

// POST: adiciona um novo bilhete
export async function POST(request) {
  try {
    const ticketData = await request.json();

    if (
      !ticketData.movie_id ||
      !ticketData.session_id ||
      !ticketData.room_id ||
      !ticketData.client_id ||
      !ticketData.seat ||
      !ticketData.datetime
    ) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const newTicket = await addTicket(ticketData);

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao adicionar bilhete" },
      { status: 500 }
    );
  }
}
