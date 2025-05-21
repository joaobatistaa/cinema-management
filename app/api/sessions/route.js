import { NextResponse } from "next/server";
import { getSessions, addSession } from "@/src/services/sessions";

export async function GET() {
  try {
    const sessions = await getSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Erro ao ler o ficheiro de sessões:", error);
    return NextResponse.json(
      { error: "Erro ao carregar sessões" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const sessionData = await request.json();

    if (
      !sessionData.movie_id ||
      !sessionData.room_id ||
      !sessionData.interval_duration ||
      !sessionData.price ||
      !sessionData.datetime
    ) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const newSession = await addSession(sessionData);

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao adicionar sessão" },
      { status: 500 }
    );
  }
}
