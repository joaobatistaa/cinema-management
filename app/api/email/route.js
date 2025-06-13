import { NextResponse } from "next/server";
import { sendEmail } from "@/src/utils/email";

export async function POST(request) {
  try {
    const { to, subject, text, html } = await request.json();
    if (!to || !subject || (!text && !html)) {
      return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
    }
    await sendEmail({ to, subject, text, html });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
  }
}
