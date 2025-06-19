import { NextResponse } from "next/server";
import { getMovies, addMovie, updateMovie } from "@/src/services/movies";
import { addAuditLog } from "@/src/services/auditLog";

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
    const { actorId, actorName, ...movieData } = await request.json();

    if (!movieData.title || !movieData.image) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }
    if (movieData.title && movieData.title.length > 25) {
      return NextResponse.json({ error: "O título do filme não pode ter mais de 25 caracteres." }, { status: 400 });
    }

    const newMovie = await addMovie(movieData);

    // Registrar criação de filme no log de auditoria
    try {
      await addAuditLog({
        userID: actorId || 0,
        userName: actorName || 'Sistema',
        description: `Filme criado: ${newMovie.title} (ID: ${newMovie.id})`,
        date: new Date().toISOString()
      });
    } catch (auditError) {
      console.error('Erro ao registrar no log de auditoria:', auditError);
    }

    return NextResponse.json(newMovie, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao adicionar filme" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, actorId, actorName, ...updatedFields } = body;
    if (!id) {
      return NextResponse.json({ error: "ID em falta" }, { status: 400 });
    }
    if (updatedFields.title && updatedFields.title.length > 25) {
      return NextResponse.json({ error: "O título do filme não pode ter mais de 25 caracteres." }, { status: 400 });
    }
    
    const movies = await getMovies();
    const movie = movies.find(m => m.id === Number(id));
    if (!movie) {
      return NextResponse.json({ error: "Filme não encontrado" }, { status: 404 });
    }
    
    const updated = await updateMovie(Number(id), updatedFields);
    if (!updated) {
      return NextResponse.json({ error: "Erro ao atualizar filme" }, { status: 500 });
    }
    
    // Registrar atualização de filme no log de auditoria
    try {
      await addAuditLog({
        userID: actorId || 0,
        userName: actorName || 'Sistema',
        description: `Filme atualizado: ${movie.title} (ID: ${id})`,
        date: new Date().toISOString()
      });
    } catch (auditError) {
      console.error('Erro ao registrar no log de auditoria:', auditError);
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar filme" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { actorId, actorName } = await request.json().catch(() => ({}));
    
    if (!id) {
      return NextResponse.json({ error: "ID em falta" }, { status: 400 });
    }
    
    const movies = await getMovies();
    const idx = movies.findIndex((m) => String(m.id) === String(id));
    if (idx === -1) {
      return NextResponse.json({ error: "Filme não encontrado" }, { status: 404 });
    }
    
    const movieToDelete = movies[idx];
    movies.splice(idx, 1);
    
    await import("fs/promises").then(fs =>
      fs.writeFile(
        require("path").join(process.cwd(), "src", "data", "movies.json"),
        JSON.stringify(movies, null, 2),
        "utf-8"
      )
    );
    
    // Registrar exclusão de filme no log de auditoria
    try {
      await addAuditLog({
        userID: actorId || 0,
        userName: actorName || 'Sistema',
        description: `Filme excluído: ${movieToDelete.title} (ID: ${id})`,
        date: new Date().toISOString()
      });
    } catch (auditError) {
      console.error('Erro ao registrar no log de auditoria:', auditError);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao eliminar filme" }, { status: 500 });
  }
}
