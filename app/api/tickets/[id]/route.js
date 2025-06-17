import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

const filePath = path.join(process.cwd(), "src", "data", "tickets.json");

export async function GET(request, context) {
  const { id } = context.params;
  const tickets = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const ticket = tickets.find((t) => String(t.id) === String(id));
  if (!ticket) {
    return NextResponse.json(
      { error: "Bilhete não encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(ticket);
}

export async function PUT(request, context) {
  const { id } = context.params;
  const tickets = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const idx = tickets.findIndex((t) => String(t.id) === String(id));
  if (idx === -1) {
    return NextResponse.json(
      { error: "Bilhete não encontrado" },
      { status: 404 }
    );
  }
  const data = await request.json();
  tickets[idx] = { ...tickets[idx], ...data, id: tickets[idx].id };
  fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2));
  return NextResponse.json(tickets[idx]);
}

export async function DELETE(request, context) {
  const { id } = context.params;
  const tickets = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const idx = tickets.findIndex((t) => String(t.id) === String(id));
  if (idx === -1) {
    return NextResponse.json(
      { error: "Bilhete não encontrado" },
      { status: 404 }
    );
  }
  tickets.splice(idx, 1);
  fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2));
  return NextResponse.json({ success: true });
}
