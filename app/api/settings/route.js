import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

const filePath = path.join(process.cwd(), "src", "data", "settings.json");

export async function GET() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const settings = JSON.parse(data);
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao carregar settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { max_cancel_days } = body;
    if (
      typeof max_cancel_days !== "number" ||
      isNaN(max_cancel_days) ||
      max_cancel_days < 1
    ) {
      return NextResponse.json(
        { error: "Valor inválido para max_cancel_days" },
        { status: 400 }
      );
    }
    const settings = { max_cancel_days };
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2));
    return NextResponse.json(settings);
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao atualizar settings" },
      { status: 500 }
    );
  }
}
