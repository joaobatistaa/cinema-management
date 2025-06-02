import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const sessionsFilePath = path.join(process.cwd(), "src", "data", "sessions.json");

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const movieId = url.searchParams.get("movie");
    const data = fs.readFileSync(sessionsFilePath, "utf-8");
    let sessions = JSON.parse(data);
    if (movieId) {
      sessions = sessions.filter((s) => String(s.movieId) === String(movieId));
    }
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar sessões" }, { status: 500 });
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
