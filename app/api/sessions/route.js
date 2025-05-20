import { getSessions, addSession } from "@/backend/sessions";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getSessions();
  console.log("teste: " + data);

  return NextResponse.json(data);
}
