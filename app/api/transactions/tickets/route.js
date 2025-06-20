import { NextResponse } from "next/server";
import { addTransaction } from "@/src/services/transactions";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      ticketData,
      email,
      desc,
      userId,
      nif,
      actorId = null,
      actorName = null
    } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email do cliente é obrigatório" },
        { status: 400 }
      );
    }

    if (!ticketData) {
      return NextResponse.json(
        { error: "Nenhum bilhete fornecido." },
        { status: 400 }
      );
    }

    try {
      let nifToSave = null;
      if (typeof nif === "string" && /^\d{9}$/.test(nif.trim())) {
        nifToSave = nif.trim();
      } else if (typeof nif === "number" && /^\d{9}$/.test(String(nif))) {
        nifToSave = String(nif);
      } else {
        nifToSave = null;
      }

      const transaction = {
        ticketData: ticketData,
        userId,
        desc,
        total: ticketData.buy_total,
        date: new Date().toISOString(),
        nif: nifToSave,
        ...(actorId &&
          actorId !== 0 && {
            workerId: actorId,
            workerName: actorName
          })
      };

      await addTransaction(transaction);

      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      return NextResponse.json(
        { error: "Erro ao criar transação!" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar compra de bilhetes:", error);
    return NextResponse.json(
      { error: "Erro interno na compra de bilhetes." },
      { status: 500 }
    );
  }
}
