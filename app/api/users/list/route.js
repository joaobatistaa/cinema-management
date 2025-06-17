import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "users.json");

export async function GET() {
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(fileContents);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao carregar os utilizadores." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, updates } = await request.json();
    if (!id || !updates || typeof updates !== "object") {
      return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    }
    const fileContents = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(fileContents);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) {
      return NextResponse.json({ message: "Utilizador não encontrado." }, { status: 404 });
    }
    users[idx] = { ...users[idx], ...updates };
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
    return NextResponse.json(users[idx]);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao atualizar utilizador." },
      { status: 500 }
    );
  }
}
