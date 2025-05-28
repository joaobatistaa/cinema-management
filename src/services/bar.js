// imports
import path from "path";

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