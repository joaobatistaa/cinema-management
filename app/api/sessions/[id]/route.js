import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "sessions.json");

export async function GET(request, { params }) {
  const { id } = await params;
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
