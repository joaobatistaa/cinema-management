import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "sessions.json");

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    const sessions = JSON.parse(fileContents);
    const sessionIndex = sessions.findIndex((s) => String(s.id) === String(id));
    if (sessionIndex === -1) {
      return new Response(
        JSON.stringify({ message: "Sessão não encontrada." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    sessions.splice(sessionIndex, 1);
    await fs.writeFile(filePath, JSON.stringify(sessions, null, 2), "utf-8");
    return new Response(
      JSON.stringify({ message: "Sessão eliminada com sucesso." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro ao eliminar a sessão:", error);
    return new Response(
      JSON.stringify({ message: "Erro ao eliminar a sessão." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    const sessions = JSON.parse(fileContents);
    const session = sessions.find((s) => String(s.id) === String(id));
    if (!session) {
      return new Response(
        JSON.stringify({ message: "Sessão não encontrada." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Erro ao carregar a sessão:", error);
    return new Response(
      JSON.stringify({ message: "Erro ao carregar a sessão." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const updatedSession = await request.json();
    const fileContents = await fs.readFile(filePath, "utf-8");
    const sessions = JSON.parse(fileContents);
    const sessionIndex = sessions.findIndex((s) => String(s.id) === String(id));
    if (sessionIndex === -1) {
      return new Response(
        JSON.stringify({ message: "Sessão não encontrada." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    sessions[sessionIndex] = { ...sessions[sessionIndex], ...updatedSession };
    await fs.writeFile(filePath, JSON.stringify(sessions, null, 2), "utf-8");
    return new Response(
      JSON.stringify({ message: "Sessão atualizada com sucesso." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro ao atualizar a sessão:", error);
    return new Response(
      JSON.stringify({ message: "Erro ao atualizar a sessão." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
