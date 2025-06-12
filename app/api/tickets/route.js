import { NextResponse } from "next/server";
import { getTickets } from "@/src/services/tickets";

export async function GET() {
  try {
    const tickets = getTickets();
    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar bilhetes" },
      { status: 500 }
    );
  }
}
