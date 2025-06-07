import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "users.json");

// Função auxiliar para ler os utilizadores do ficheiro
async function getUsers() {
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Erro ao ler os utilizadores:", error);
    return [];
  }
}

// Função auxiliar para escrever os utilizadores no ficheiro
async function saveUsers(users) {
  try {
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Erro ao guardar os utilizadores:", error);
    return false;
  }
}

// GET: devolve todos os utilizadores
export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao carregar os utilizadores." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const newUser = await request.json();
    const users = await getUsers();

    // Validar se o nome de utilizador já existe
    if (users.some((user) => user.username === newUser.username)) {
      return NextResponse.json(
        { message: "Já existe um utilizador com este nome." },
        { status: 400 }
      );
    }

    // Gerar um novo ID
    const newId =
      users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;

    //adicionar o id ao inicio
    newUser.id = newId;
    const newUserWithId = { id: newId, ...newUser };

    users.push(newUserWithId);

    // Salvar os utilizadores atualizados no ficheiro
    const saved = await saveUsers(users);
    if (!saved) {
      return NextResponse.json(
        { message: "Erro ao guardar o novo utilizador." },
        { status: 500 }
      );
    }

    return NextResponse.json(newUserWithId, { status: 201 });
  } catch (error) {
    console.error("Erro ao processar o pedido POST:", error);
    return NextResponse.json(
      { message: "Erro ao processar o pedido." },
      { status: 500 }
    );
  }
}
