import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "users.json");

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} role
 */

export async function getUsers() {
  try {
    const fileContents = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

export async function addUser(user) {
  const users = await getUsers();
  if (users.some((u) => u.email === user.email)) {
    throw new Error("Email já registado");
  }
  const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  const newUser = { id: newId, role: "customer", ...user };
  users.push(newUser);
  await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
  return newUser;
}
