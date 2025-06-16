// imports
import path from "path";
import { promises as fs } from "fs";

// gets the file
const filePath = path.join(process.cwd(), "src", "data", "products.json");

/**   class fields
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {string} image
 */

// gets the products from the file
export async function getProducts() {
  const fileContents = await fs.readFile(filePath, "utf-8");
  console.log(fileContents);
  return JSON.parse(fileContents);
}

// Função para atualizar o stock dos produtos
export async function updateProductStock(items) {
  const fileContents = await fs.readFile(filePath, "utf-8");
  const products = JSON.parse(fileContents);

  items.forEach((item) => {
    const prod = products.find((p) => String(p.id) === String(item.id));
    if (prod) {
      prod.stock = Math.max(0, Number(prod.stock) - (Number(item.quantity) || 0));
    }
  });

  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
}

// Atualiza um produto existente
export async function updateProduct({ id, name, stock, price }) {
  const fileContents = await fs.readFile(filePath, "utf-8");
  const products = JSON.parse(fileContents);

  const idx = products.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return false;

  products[idx] = {
    ...products[idx],
    name,
    stock,
    price,
  };

  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  return true;
}

// Elimina um produto existente
export async function deleteProduct(id) {
  const fileContents = await fs.readFile(filePath, "utf-8");
  const products = JSON.parse(fileContents);

  const idx = products.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return false;

  products.splice(idx, 1);

  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  return true;
}

// Adiciona um novo produto
export async function addProduct({ name, stock, price }) {
  const fileContents = await fs.readFile(filePath, "utf-8");
  const products = JSON.parse(fileContents);

  // Gera novo id incremental
  const newId = products.length > 0 ? Math.max(...products.map((p) => Number(p.id))) + 1 : 1;
  const newProduct = {
    id: newId,
    name,
    stock,
    price,
    image: "" 
  };

  products.push(newProduct);

  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  return newProduct;
}
