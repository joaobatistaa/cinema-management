import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "rooms.json");

// Função auxiliar para ler as salas do ficheiro
async function getRooms() {
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Erro ao ler as salas:", error);
    return [];
  }
}

// Função auxiliar para escrever as salas no ficheiro
async function saveRooms(rooms) {
  try {
    await fs.writeFile(filePath, JSON.stringify(rooms, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Erro ao guardar as salas:", error);
    return false;
  }
}

// GET: devolve todas as salas
export async function GET() {
  try {
    const rooms = await getRooms();
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao carregar as salas." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const newRoom = await request.json();
    const rooms = await getRooms();

    if (newRoom.name && newRoom.name.length > 25) {
      return NextResponse.json({ message: "O nome da sala não pode ter mais de 25 caracteres." }, { status: 400 });
    }
    // Validar se o nome da sala já existe
    if (rooms.some((room) => room.name === newRoom.name)) {
      return NextResponse.json(
        { message: "Já existe uma sala com este nome." },
        { status: 400 }
      );
    }

    // Gerar um novo ID
    const newId =
      rooms.length > 0 ? Math.max(...rooms.map((room) => room.id)) + 1 : 1;

    //adicionar o id ao inicio
    newRoom.id = newId;
    const newRoomWithId = { id: newId, ...newRoom };

    rooms.push(newRoomWithId);

    // Salvar as salas atualizadas no ficheiro
    const saved = await saveRooms(rooms);
    if (!saved) {
      return NextResponse.json(
        { message: "Erro ao guardar a nova sala." },
        { status: 500 }
      );
    }

    return NextResponse.json(newRoomWithId, { status: 201 });
  } catch (error) {
    console.error("Erro ao processar o pedido POST:", error);
    return NextResponse.json(
      { message: "Erro ao processar o pedido." },
      { status: 500 }
    );
  }
}
