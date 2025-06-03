import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "tickets.json");

/**
 * @typedef {Object} Movie
 * @property {number} id
 * @property {number} title
 * @property {string} image
 */

export async function getMovies() {
  const fileContents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContents);
}

// Adiciona um novo filme
export async function addMovie(session) {
  const movies = await getMovies();
  const newId =
    movies.length > 0 ? Math.max(...movies.map((s) => s.id)) + 1 : 1;
  const newMovie = { id: newId, ...session };
  movies.push(newMovie);
  await fs.writeFile(filePath, JSON.stringify(movies, null, 2), "utf-8");
  return newMovie;
}

// Remove um filme pelo id
export async function removeMovie(id) {
  const movies = await getMovies();
  const filtered = movies.filter((s) => s.id !== id);
  await fs.writeFile(filePath, JSON.stringify(filtered, null, 2), "utf-8");
  return filtered;
}

// Atualiza um filme pelo id
export async function updateMovie(id, updatedFields) {
  const movies = await getMovies();
  const updatedMovies = movies.map((s) =>
    s.id === id ? { ...s, ...updatedFields, id } : s
  );
  await fs.writeFile(filePath, JSON.stringify(updatedMovies, null, 2), "utf-8");
  return updatedMovies.find((s) => s.id === id);
}
