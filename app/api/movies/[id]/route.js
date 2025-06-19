import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";
import { addMovie, updateMovie } from "@/src/services/movies";

export async function POST(request) {
  try {
    const data = await request.json();
    const movie = await addMovie(data);
    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao adicionar filme" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    if (data.title && data.title.length > 25) {
      return NextResponse.json(
        { error: "O título do filme não pode ter mais de 25 caracteres." },
        { status: 400 }
      );
    }
    const movie = await updateMovie(id, data);
    return NextResponse.json(movie);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar filme" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  const { id } = await params;
  const filePath = path.join(process.cwd(), "src", "data", "movies.json");
  const movies = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const movie = movies.find((m) => String(m.id) === String(id));
  if (!movie) {
    return NextResponse.json(
      { error: "Filme não encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(movie);
}
