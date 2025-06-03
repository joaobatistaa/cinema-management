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

// Regista um novo utilizador
export async function addUser(user) {
  try {
    const users = await getUsers();
    if (users.some((u) => u.email === user.email)) {
      throw new Error("Email já registado");
    }
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser = { id: newId, role: "customer", ...user };
    users.push(newUser);
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
    return newUser;
  } catch (error) {
    // Propaga o erro para ser tratado no frontend (toast.error)
    throw new Error(error.message || "Erro ao registar utilizador");
  }
}

// Procura utilizador por email
export async function getUserByEmail(email) {
  const users = await getUsers();

  return users.find((u) =>  u.email === email) || null;
}

// Autentica utilizador (login)
export async function authenticateUser(email, password) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error("Utilizador não encontrado");
    }
    if (user.password !== password) {
      throw new Error("Password incorreta");
    }
    // Nunca retornar a password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    // Propaga o erro para ser tratado no frontend (toast.error)
    throw new Error(error.message || "Erro ao autenticar utilizador");
  }
}
