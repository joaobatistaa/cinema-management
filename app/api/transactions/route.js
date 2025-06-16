import { NextResponse } from "next/server";
import { getTransactions, addTransaction } from "@/src/services/transactions";
import { updateProductStock } from "@/src/services/bar";
import { getUserByEmail } from "@/src/services/users";
import { sendEmail } from "@/src/utils/email"; 

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

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, cart, desc, nif } = body;
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
    // Atualiza stock, mas não bloqueia a transação se falhar
    try {
      await updateProductStock(cart);
    } catch (error) {
      // Apenas loga o erro, mas continua
      console.error("Erro ao atualizar stock:", error);
    }
    // Regista a transação mesmo que o updateProductStock falhe
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
        items: cart,
        total: cart.reduce(
          (sum, item) => Number(sum) + Number(item.price) * Number(item.quantity),
          0
        ),
        userId,
        desc,
        date: new Date().toISOString(),
        nif: nifToSave, // agora só vai null se não for válido
      };
      await addTransaction(transaction);

      
      // Enviar email ao cliente com os detalhes da transação (exceto id)
      if (email !== "guest@guest.com") {
        let details = `
          <h2>Detalhes da sua transação</h2>
          <p><strong>Data:</strong> ${new Date(transaction.date).toLocaleString("pt-PT")}</p>
          <p><strong>Descrição:</strong> ${transaction.desc || ""}</p>
          <p><strong>NIF:</strong> ${transaction.nif ? transaction.nif : "Consumidor final"}</p>
          <h3>Produtos:</h3>
          <ul>
            ${transaction.items
              .map(
                (item) =>
                  `<li>${item.name} - ${item.quantity} x ${Number(item.price).toFixed(2)}€ = <strong>${(Number(item.price) * Number(item.quantity)).toFixed(2)}€</strong></li>`
              )
              .join("")}
          </ul>
          <p><strong>Total:</strong> ${Number(transaction.total).toFixed(2)}€</p>
        `;
        try {
          await sendEmail({
            to: email,
            subject: "Confirmação da sua compra - Cinema",
            text: `Detalhes da sua transação:\nData: ${new Date(transaction.date).toLocaleString("pt-PT")}\nDescrição: ${transaction.desc || ""}\nNIF: ${transaction.nif ? transaction.nif : "Consumidor final"}\nProdutos:\n${transaction.items
              .map(
                (item) =>
                  `${item.name} - ${item.quantity} x ${Number(item.price).toFixed(2)}€ = ${(Number(item.price) * Number(item.quantity)).toFixed(2)}€`
              )
              .join("\n")}\nTotal: ${Number(transaction.total).toFixed(2)}€`,
            html: details,
          });
        } catch (err) {
          // Apenas loga o erro, mas não impede a resposta ao cliente
          console.error("Erro ao enviar email de confirmação de transação:", err);
        }
      }

      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      return NextResponse.json(
        { error: "Erro ao criar transação!" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar transação:", error);
    return NextResponse.json(
      { error: "Erro ao guardar transação" },
      { status: 500 }
    );
  }
}

