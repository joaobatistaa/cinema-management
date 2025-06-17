import { NextResponse } from "next/server";
import { getTickets, addTicket, filterTickets } from "@/src/services/tickets";

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
    const newTicket = addTicket(data);
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar bilhete" },
      { status: 500 }
    );
  }
}
