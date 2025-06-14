import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "users.json");

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const purl = searchParams.get("a");

    if (!purl) {
      return NextResponse.json({ valid: false, error: "PURL em falta." }, { status: 400 });
    }

    const fileContents = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(fileContents);

    // Só é válido se o utilizador ainda não estiver confirmado (active !== 1)
    const user = users.find((u) => u.purl && String(u.purl) === String(purl) && u.active !== 1);
    if (!user) {
      return NextResponse.json({ valid: false, error: "Link inválido ou expirado." }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json({ valid: false, error: "Erro ao validar link." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const purl = searchParams.get("a");

    if (!purl) {
      return NextResponse.json({ error: "PURL em falta." }, { status: 400 });
    }

    const fileContents = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(fileContents);

    // Só ativa se o utilizador ainda não estiver confirmado
    const idx = users.findIndex((u) => u.purl && String(u.purl) === String(purl) && u.active !== 1);
    if (idx === -1) {
      return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 });
    }

    users[idx].active = 1;
    users[idx].desc = "email confirmed";
    users[idx].purl = null;

    await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao confirmar email." }, { status: 500 });
  }
}
