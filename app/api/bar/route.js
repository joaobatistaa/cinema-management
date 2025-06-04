// imports
import { NextResponse } from "next/server";

import { getProducts, updateProduct, deleteProduct, addProduct } from "@/src/services/bar";

// handles the request
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Erro ao ler o ficheiro de produtos:", error);
    return NextResponse.json(
      { error: "Erro ao carregar produtos" },
      { status: 500 }
    );
  }
}

// Novo handler para PUT (atualizar produto)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, stock, price } = body;
    if (!id || !name || stock === undefined || price === undefined) {
      return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
    }
    const updated = await updateProduct({ id, name, stock, price });
    if (!updated) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

// Novo handler para DELETE (eliminar produto)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID em falta" }, { status: 400 });
    }
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao eliminar produto" }, { status: 500 });
  }
}

// Novo handler para POST (criar produto)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, stock, price } = body;
    if (!name || stock === undefined || price === undefined) {
      return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
    }
    const newProduct = await addProduct({ name, stock, price });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
