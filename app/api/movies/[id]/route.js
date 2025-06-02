import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(request, { params }) {
  const { id } = params;
  const filePath = path.join(process.cwd(), "src", "data", "movies.json");
  const movies = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const movie = movies.find((m) => String(m.id) === String(id));
  if (!movie) {
    return NextResponse.json({ error: "Filme não encontrado" }, { status: 404 });
  }
  return NextResponse.json(movie);
}
