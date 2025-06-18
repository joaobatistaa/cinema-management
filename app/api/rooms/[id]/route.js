import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const roomsFilePath = path.join(process.cwd(), "src", "data", "rooms.json");
const sessionsFilePath = path.join(
  process.cwd(),
  "src",
  "data",
  "sessions.json"
);
const ticketsFilePath = path.join(process.cwd(), "src", "data", "tickets.json");

export async function DELETE(request, { params }) {
  try {
    const roomId = params.id;
    if (!roomId) {
      return NextResponse.json({ error: "ID em falta" }, { status: 400 });
    }

    // Carregar sessões e bilhetes diretamente dos ficheiros
    const sessionsRaw = await fs.readFile(sessionsFilePath, "utf-8");
    const sessions = JSON.parse(sessionsRaw);
    const ticketsRaw = await fs.readFile(ticketsFilePath, "utf-8");
    const tickets = JSON.parse(ticketsRaw);

    // Encontrar sessões futuras para esta sala
    const now = new Date();
    const futureSessionIds = sessions
      .filter(
        (s) =>
          String(s.room) === String(roomId) && s.date && new Date(s.date) > now
      )
      .map((s) => String(s.id));

    // Verificar se existe algum bilhete para sessões futuras desta sala
    const hasFutureTickets = tickets.some(
      (t) =>
        String(t.room_id) === String(roomId) &&
        t.session_id &&
        futureSessionIds.includes(String(t.session_id))
    );
    if (hasFutureTickets) {
      return NextResponse.json(
        {
          error:
            "Não é possível eliminar salas com bilhetes futuros associados."
        },
        { status: 400 }
      );
    }

    // Se for só verificação (não eliminar), retorna sucesso
    if (request.headers.get("X-Check-Only") === "1") {
      return NextResponse.json({ success: true });
    }

    // Eliminar a sala
    const roomsRaw = await fs.readFile(roomsFilePath, "utf-8");
    const rooms = JSON.parse(roomsRaw);
    const idx = rooms.findIndex((r) => String(r.id) === String(roomId));
    if (idx === -1) {
      return NextResponse.json(
        { error: "Sala não encontrada" },
        { status: 404 }
      );
    }
    rooms.splice(idx, 1);
    await fs.writeFile(roomsFilePath, JSON.stringify(rooms, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao eliminar sala" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const fileContents = await fs.readFile(roomsFilePath, "utf-8");
    const rooms = JSON.parse(fileContents);
    const room = rooms.find((room) => room.id === parseInt(id, 10));
    if (!room) {
      return new Response(JSON.stringify({ message: "Sala não encontrada." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(room), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Erro ao carregar a sala:", error);
    return new Response(
      JSON.stringify({ message: "Erro ao carregar a sala." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;

  try {
    const updatedRoom = await request.json();
    const fileContents = await fs.readFile(roomsFilePath, "utf-8");
    const rooms = JSON.parse(fileContents);
    const roomIndex = rooms.findIndex((room) => room.id === parseInt(id, 10));
    if (roomIndex === -1) {
      return new Response(JSON.stringify({ message: "Sala não encontrada." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (updatedRoom.name && updatedRoom.name.length > 25) {
      return NextResponse.json({ error: "O nome da sala não pode ter mais de 25 caracteres." }, { status: 400 });
    }
    rooms[roomIndex] = { ...rooms[roomIndex], ...updatedRoom };
    await fs.writeFile(roomsFilePath, JSON.stringify(rooms, null, 2), "utf-8");
    return new Response(
      JSON.stringify({ message: "Sala atualizada com sucesso." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro ao atualizar a sala:", error);
    return new Response(
      JSON.stringify({ message: "Erro ao atualizar a sala." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
