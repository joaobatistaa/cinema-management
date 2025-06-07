export function getMovieName(id, movies = []) {
  return movies.find((m) => String(m.id) === String(id))?.title || "N/A";
}

export function getClientName(id, users = []) {
  return users.find((u) => String(u.id) === String(id))?.name || "N/A";
}

export function getRoomName(id, rooms = []) {
  return rooms.find((r) => String(r.id) === String(id))?.name || "N/A";
}

export function seatLabel(seat) {
  if (!seat) return "";
  const rowLetter = String.fromCharCode(65 + ((seat.row || 1) - 1));
  return `${rowLetter}-${seat.col}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

export function formatHour(dateStr) {
  if (!dateStr) return "";
  const time = dateStr.split("T")[1];
  return time ? time.slice(0, 5) : "";
}

export function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 3) + "..." : str;
}
