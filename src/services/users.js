import { promises as fs } from "fs";
import path from "path";

let bcrypt;
try {
  bcrypt = require("bcryptjs");
} catch (e) {
  throw new Error(
    "O módulo 'bcryptjs' não está instalado. Execute 'npm install bcryptjs' na raiz do projeto."
  );
}

const filePath = path.join(process.cwd(), "src", "data", "users.json");

// Função para gerar um purl único
async function generateUniquePurl(email) {
  const users = await getUsers();
  let purl;
  let exists = true;
  while (exists) {
    const seed =
      email +
      "-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2) +
      "-" +
      cryptoRandomString(12);
    purl = Buffer.from(seed)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 32);
    exists = users.some((u) => u.purl === purl);
  }
  return purl;
}

// Função auxiliar para gerar string random (sem dependências externas)
function cryptoRandomString(length) {
  let result = "";
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < length; ++i) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
    const newId =
      users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const purl = await generateUniquePurl(user.email);
    const newUser = {
      id: newId,
      role: "customer",
      ...user,
      password: hashedPassword,
      nif: user.nif ?? null,
      active: 0,
      purl,
      desc: "pending email confirmation",
      tickets: [], // <-- Adicionado campo tickets vazio
    };
    users.push(newUser);
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
    return newUser;
  } catch (error) {
    throw new Error(error.message || "Erro ao registar utilizador");
  }
}

// Procura utilizador por email
export async function getUserByEmail(email) {
  const users = await getUsers();
  return users.find((u) => u.email === email) || null;
}

// Autentica utilizador (login)
export async function authenticateUser(email, password) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error("Utilizador não encontrado");
    }
    if (!user.password) {
      throw new Error("Password não definida");
    }
    const valid =
      user.password.startsWith("$2a$") ||
      user.password.startsWith("$2b$") ||
      user.password.startsWith("$2y$")
        ? await bcrypt.compare(password, user.password)
        : false;
    if (!valid) {
      throw new Error("Password incorreta");
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw new Error(error.message || "Erro ao autenticar utilizador");
  }
}