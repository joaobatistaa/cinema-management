import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "users.json");

export async function readUsersFile() {
  const fileContents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContents);
}

export async function writeUsersFile(users) {
  await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf-8");
}

export async function getNewUserId(users) {
  return users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
}

export async function isValidEmail(email) {
  return /.+@.+\..+/.test(email);
}

export async function isValidNif(nif) {
  return !nif || /^\d{9}$/.test(nif);
}
