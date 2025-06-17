import fs from "fs";
import path from "path";

const ticketsFilePath = path.join(process.cwd(), "src", "data", "tickets.json");

function readTickets() {
  if (!fs.existsSync(ticketsFilePath)) {
    fs.writeFileSync(ticketsFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(ticketsFilePath, "utf-8");
  return JSON.parse(data);
}

export function writeTickets(tickets) {
  fs.writeFileSync(ticketsFilePath, JSON.stringify(tickets, null, 2));
}

export function getTickets() {
  return readTickets();
}

export function addTicket(ticket) {
  const tickets = readTickets();
  const newId =
    tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1;
  const newTicket = { id: newId, ...ticket };
  tickets.push(newTicket);
  writeTickets(tickets);
  return newTicket;
}

export function filterTickets({
  movie_id,
  datetime,
  client_id,
  id,
  room_id,
  session_id,
  seat
}) {
  let tickets = readTickets();
  if (movie_id) tickets = tickets.filter((t) => t.movie_id === movie_id);
  if (datetime)
    tickets = tickets.filter((t) => t.datetime?.startsWith(datetime));
  if (client_id) tickets = tickets.filter((t) => t.client_id === client_id);
  if (id) tickets = tickets.filter((t) => String(t.id).includes(String(id)));
  if (room_id) tickets = tickets.filter((t) => t.room_id === room_id);
  if (session_id) tickets = tickets.filter((t) => t.session_id === session_id);
  if (seat)
    tickets = tickets.filter(
      (t) => t.seat?.row === seat.row && t.seat?.col === seat.col
    );
  return tickets;
}
