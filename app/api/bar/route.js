// imports
import { NextResponse } from "next/server";

import { getProducts } from "@/src/services/bar";

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
