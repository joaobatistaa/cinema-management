import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  updateSession,
  removeSession,
  addSession
} from "@/src/services/sessions";
import { getTickets } from "@/src/services/tickets";
import { addAuditLog } from "@/src/services/auditLog";

const sessionsFilePath = path.join(
  process.cwd(),
  "src",
  "data",
  "sessions.json"
);

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
    return NextResponse.json(
      { error: "Erro ao carregar sessões" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const sessionData = await request.json();

    // Aceita tanto movieId/room/date/language (frontend) quanto movie_id/room_id/datetime (antigo)
    const movieId = sessionData.movieId || sessionData.movie_id;
    const movieName = sessionData.movieName;
    const room = sessionData.room || sessionData.room_id;
    const date = sessionData.date || sessionData.datetime;
    const language = sessionData.language;

    const actorId = sessionData.actorId || "unknown";
    const actorName = sessionData.actorName || "unknown";

    if (!movieId || !room || !movieName || !date || !language) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const newSession = await addSession({
      movieId,
      room,
      date,
      language
    });

    const sessionDate = new Date(date);

    const formattedDate = sessionDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const formattedTime = sessionDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const descricao = `Nova sessão criada para o filme ${movieName} no dia ${formattedDate} às ${formattedTime} na sala ${room} com o idioma ${language}`;

    try {
      await addAuditLog({
        userID: actorId,
        userName: actorName,
        description: descricao,
        date: new Date().toISOString()
      });
    } catch (auditErr) {
      console.error("Erro ao registar no audit log:", auditErr);
    }

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao adicionar sessão" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, movieName, actorId, actorName, ...updatedFields } = body;
    if (!id) {
      return NextResponse.json({ error: "ID em falta" }, { status: 400 });
    }

    // Verificação: não permitir editar se existirem bilhetes associados
    const tickets = await getTickets();
    const hasTickets = tickets.some((t) => String(t.session_id) === String(id));
    if (hasTickets) {
      return NextResponse.json(
        { error: "Não é possível editar sessões com bilhetes associados." },
        { status: 400 }
      );
    }

    const updated = await updateSession(
      typeof id === "string" ? Number(id) : id,
      updatedFields
    );
    if (!updated) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    const sessionDate = new Date(updatedFields.date);

    const formattedDate = sessionDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const formattedTime = sessionDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const descricao = `Sessão do filme ${movieName} foi alterada para o dia ${formattedDate} às ${formattedTime} na sala ${updatedFields.room} com o idioma ${updatedFields.language}`;

    try {
      await addAuditLog({
        userID: actorId,
        userName: actorName,
        description: descricao,
        date: new Date().toISOString()
      });
    } catch (auditErr) {
      console.error("Erro ao registar no audit log:", auditErr);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar sessão" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const body = await request.json();
  const { movieName, actorId, actorName } = body;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID em falta" }, { status: 400 });
    }

    // Verificação: não permitir eliminar se existirem bilhetes associados
    const tickets = await getTickets();
    const hasTickets = tickets.some((t) => String(t.session_id) === String(id));
    if (hasTickets) {
      return NextResponse.json(
        { error: "Não é possível eliminar sessões com bilhetes associados." },
        { status: 400 }
      );
    }

    const sessions = await import("@/src/services/sessions").then((m) =>
      m.getSessions()
    );

    const idx = sessions.findIndex((s) => String(s.id) === String(id));
    if (idx === -1) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    const sessionData = sessions.find((s) => String(s.id) === String(id));

    await removeSession(typeof id === "string" ? Number(id) : id);

    const sessionDate = new Date(sessionData.date);

    const formattedDate = sessionDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const formattedTime = sessionDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const descricao = `Sessão do filme ${movieName} do dia ${formattedDate} às ${formattedTime} na sala ${sessionData.room} com o idioma ${sessionData.language} foi eliminada!`;

    try {
      await addAuditLog({
        userID: actorId,
        userName: actorName,
        description: descricao,
        date: new Date().toISOString()
      });
    } catch (auditErr) {
      console.error("Erro ao registar no audit log:", auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao eliminar sessão" },
      { status: 500 }
    );
  }
}
