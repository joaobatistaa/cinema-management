import { NextResponse } from "next/server";
import { getMovies, addMovie } from "@/src/services/movies";

export async function GET() {
  try {
    const sessions = await getMovies();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Erro ao ler o ficheiro de filmes:", error);
    return NextResponse.json(
      { error: "Erro ao carregar filmes" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const movieData = await request.json();

    if (!movieData.title || !movieData.image) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const newSession = await addMovie(sessionData);

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao adicionar filme" },
      { status: 500 }
    );
  }
}
