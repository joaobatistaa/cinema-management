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
    const prod = products.find((p) => p.id == item.id);
    if (prod) {
      prod.stock = String(Math.max(0, Number(prod.stock) - (Number(item.quantity) || 0)));
    }
  });

  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
}
