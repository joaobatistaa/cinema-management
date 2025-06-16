import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "rooms.json");

export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    const rooms = JSON.parse(fileContents);
    const roomIndex = rooms.findIndex((room) => room.id === parseInt(id, 10));
    if (roomIndex === -1) {
      return new Response(JSON.stringify({ message: "Sala não encontrada." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    rooms.splice(roomIndex, 1);
    await fs.writeFile(filePath, JSON.stringify(rooms, null, 2), "utf-8");
    return new Response(
      JSON.stringify({ message: "Sala eliminada com sucesso." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro ao eliminar a sala:", error);
    return new Response(
      JSON.stringify({ message: "Erro ao eliminar a sala." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
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
    const fileContents = await fs.readFile(filePath, "utf-8");
    const rooms = JSON.parse(fileContents);
    const roomIndex = rooms.findIndex((room) => room.id === parseInt(id, 10));
    if (roomIndex === -1) {
      return new Response(JSON.stringify({ message: "Sala não encontrada." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    rooms[roomIndex] = { ...rooms[roomIndex], ...updatedRoom };
    await fs.writeFile(filePath, JSON.stringify(rooms, null, 2), "utf-8");
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
