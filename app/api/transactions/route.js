import { NextResponse } from "next/server";
import { getTransactions, addTransaction } from "@/src/services/transactions";
import { updateProductStock } from "@/src/services/bar"; 
import { getUserByEmail } from "@/src/services/users";

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

    const { email, cart, desc } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email do cliente é obrigatório" },
        { status: 400 }
      );
    }

    let user = null;
    let userId = null;
    if (email === "guest@guest.com") {
      userId = 0;
    } else {
      user = await getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: "Utilizador não encontrado" },
          { status: 404 }
        );
      }
      userId = user.id;
    }

    try {
      await updateProductStock(cart);
    } catch (error) {
      return NextResponse.json(
        { error: "Erro ao atualizar stock!" },
        { status: 500 }
      );
    }

    const transaction = {
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      userId,
      desc,
      date: new Date().toISOString(),
    };

    try {
      await addTransaction(transaction);
    } catch (error) {
      return NextResponse.json(
        { error: "Erro ao criar transação!" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.log("Erro ao processar transação:", error);
    console.error("Erro ao guardar transação:", error);
    return NextResponse.json(
      { error: "Erro ao guardar transação" },
      { status: 500 }
    );
  }
}
