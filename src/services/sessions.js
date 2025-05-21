import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "sessions.json");

/**
 * @typedef {Object} Session
 * @property {number} id
 * @property {number} movie_id
 * @property {number} room_id
 * @property {number} interval_duration
 * @property {number} price
 * @property {string} datetime
 */

export async function getSessions() {
  const fileContents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContents);
}

// Adiciona uma nova sessão
export async function addSession(session) {
  const sessions = await getSessions();
  // Gera novo id incremental (ou UUID se preferir)
  const newId =
    sessions.length > 0 ? Math.max(...sessions.map((s) => s.id)) + 1 : 1;
  const newSession = { id: newId, ...session };
  sessions.push(newSession);
  await fs.writeFile(filePath, JSON.stringify(sessions, null, 2), "utf-8");
  return newSession;
}

// Remove uma sessão pelo id
export async function removeSession(id) {
  const sessions = await getSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  await fs.writeFile(filePath, JSON.stringify(filtered, null, 2), "utf-8");
  return filtered;
}

// Atualiza uma sessão pelo id
export async function updateSession(id, updatedFields) {
  const sessions = await getSessions();
  const updatedSessions = sessions.map((s) =>
    s.id === id ? { ...s, ...updatedFields, id } : s
  );
  await fs.writeFile(
    filePath,
    JSON.stringify(updatedSessions, null, 2),
    "utf-8"
  );
  return updatedSessions.find((s) => s.id === id);
}
