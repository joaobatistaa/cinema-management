// imports
import { NextResponse } from "next/server";
import { getProducts, updateProduct, deleteProduct, addProduct } from "@/src/services/bar";
import { addAuditLog } from "@/src/services/auditLog";

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
    const { id, name, stock, price, actorId = 0, actorName = 'guest' } = body;
    if (!id || !name || stock === undefined || price === undefined) {
      return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
    }
    const updated = await updateProduct({ id, name, stock, price });
    if (!updated) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    
    // Add audit log for product update
    try {
      await addAuditLog({
        userID: actorId,
        userName: actorName,
        description: `Produto atualizado: ${name} (ID: ${id}) - Stock: ${stock}, Preço: ${price}€`,
        date: new Date().toISOString()
      });
    } catch (auditError) {
      console.error('Erro ao registrar no log de auditoria:', auditError);
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
    
    // Get actor info from query parameters
    const actorId = searchParams.get("actorId") || 0;
    const actorName = searchParams.get("actorName") || 'guest';
    
    // Get product info before deleting for the audit log
    const products = await getProducts();
    const product = products.find(p => p.id === Number(id));
    
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    
    // Add audit log for product deletion
    if (product) {
      try {
        await addAuditLog({
          userID: Number(actorId),
          userName: decodeURIComponent(actorName),
          description: `Produto eliminado: ${product.name} (ID: ${id})`,
          date: new Date().toISOString()
        });
      } catch (auditError) {
        console.error('Erro ao registrar no log de auditoria:', auditError);
      }
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
    const { name, stock, price, actorId = 0, actorName = 'guest' } = body;
    if (!name || stock === undefined || price === undefined) {
      return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
    }
    if (name.length > 25) {
      return NextResponse.json({ error: "O nome do produto não pode ter mais de 25 caracteres." }, { status: 400 });
    }
    const newProduct = await addProduct({ name, stock, price });
    
    // Add audit log for new product creation
    try {
      await addAuditLog({
        userID: actorId,
        userName: actorName,
        description: `Novo produto criado: ${name} (ID: ${newProduct.id}) - Stock: ${stock}, Preço: ${price}€`,
        date: new Date().toISOString()
      });
    } catch (auditError) {
      console.error('Erro ao registrar no log de auditoria:', auditError);
    }
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
