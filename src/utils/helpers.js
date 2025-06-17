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
  try {
    const date = new Date(dateStr);
    // Obter a data em Europe/Lisbon
    const options = {
      timeZone: "Europe/Lisbon",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    };
    const parts = new Intl.DateTimeFormat("pt-PT", options).formatToParts(date);
    const day = parts.find((p) => p.type === "day")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const year = parts.find((p) => p.type === "year")?.value;
    return `${day}/${month}/${year}`;
  } catch {
    // fallback antigo
    const [y, m, d] = dateStr.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  }
}

export function formatHour(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    // Usa o Intl.DateTimeFormat para garantir timezone de Lisboa
    return new Intl.DateTimeFormat("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Lisbon"
    }).format(date);
  } catch {
    // fallback antigo
    const time = dateStr.split("T")[1];
    return time ? time.slice(0, 5) : "";
  }
}

export function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 3) + "..." : str;
}
