import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "rooms.json");

export async function DELETE(request, { params }) {
  const { id } = params;

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
