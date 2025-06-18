import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;
  const filePath = path.join(process.cwd(), "src", "data", "tickets.json");
  const tickets = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const sessionTickets = tickets.filter(
    (t) => String(t.session_id) === String(id)
  );
  return NextResponse.json(sessionTickets);
}
