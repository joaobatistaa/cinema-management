import { NextResponse } from "next/server";
import { getTransactions, addTransaction } from "@/src/services/transactions";
import { updateProductStock } from "@/src/services/bar"; 

// GET /api/transactions
export async function GET() {
  try {
    const transactions = getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Erro ao ler transações:", error);
    return NextResponse.json(
      { error: "Erro ao carregar transações" },
      { status: 500 }
    );
  }
}

// POST /api/transactions
export async function POST(request) {
  try {
    const body = await request.json();
    await updateProductStock(body.items); // abate stock antes de registar transação
    addTransaction(body);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Erro ao guardar transação:", error);
    return NextResponse.json(
      { error: "Erro ao guardar transação" },
      { status: 500 }
    );
  }
}
