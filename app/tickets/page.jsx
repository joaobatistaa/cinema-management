"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

async function fetchMovies() {
  const res = await fetch("/api/movies");
  if (!res.ok) return [];
  return await res.json();
}
async function fetchUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) return [];
  return await res.json();
}
async function fetchRooms() {
  const res = await fetch("/api/rooms");
  if (!res.ok) return [];
  return await res.json();
}

const PAGE_SIZE = 8;

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);

  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [movie, setMovie] = useState("");
  const [datetime, setDatetime] = useState("");
  const [client, setClient] = useState("");
  const [ticketNum, setTicketNum] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [ticketsRes, moviesRes, usersRes, roomsRes] = await Promise.all([
          fetch("/api/tickets"),
          fetchMovies(),
          fetchUsers(),
          fetchRooms(),
        ]);
        if (!ticketsRes.ok) throw new Error("Erro ao carregar bilhetes");
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData);
        setFiltered(ticketsData);
        setMovies(moviesRes);
        setUsers(usersRes);
        setRooms(roomsRes);
      } catch (err) {
        toast.error(err.message || "Erro ao carregar dados");
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    let result = tickets;
    if (movie) {
      const movieId = movies.find((m) =>
        m.title?.toLowerCase().includes(movie.toLowerCase())
      )?.id;
      if (movieId)
        result = result.filter((t) => String(t.movie_id) === String(movieId));
      else result = [];
    }
    if (datetime)
      result = result.filter((t) => t.datetime?.startsWith(datetime));
    if (client) {
      const clientId = users.find((u) =>
        u.name?.toLowerCase().includes(client.toLowerCase())
      )?.id;
      if (clientId)
        result = result.filter((t) => String(t.client_id) === String(clientId));
      else result = [];
    }
    if (ticketNum)
      result = result.filter((t) => String(t.id).includes(ticketNum));
    setFiltered(result);
    setPage(1);
  }, [movie, datetime, client, ticketNum, tickets, movies, users]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Helpers para mostrar nomes
  function getMovieName(id) {
    return movies.find((m) => String(m.id) === String(id))?.title || id;
  }
  function getClientName(id) {
    return users.find((u) => String(u.id) === String(id))?.name || id;
  }
  function getRoomName(id) {
    return rooms.find((r) => String(r.id) === String(id))?.name || id;
  }
  function seatLabel(seat) {
    if (!seat) return "";
    const rowLetter = String.fromCharCode(65 + ((seat.row || 1) - 1));
    return `${rowLetter}${seat.col}`;
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative w-full flex-1 flex flex-col">
        <div className="flex flex-col px-8 pt-6 w-full mb-4">
          <div className="flex items-center w-full mb-4">
            <div className="w-40 flex-shrink-0">
              <button
                className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
                onClick={() => router.replace("/")}
              >
                VOLTAR
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <h1 className="text-4xl font-semibold text-white text-center tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                BILHETES
              </h1>
            </div>
            <div className="w-40 flex-shrink-0" />
          </div>
          {/* Filtros */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <input
              className="rounded px-3 py-2 bg-gray-100 text-gray-800 placeholder-gray-400"
              placeholder="Filme"
              value={movie}
              onChange={(e) => setMovie(e.target.value)}
            />
            <input
              className="rounded px-3 py-2 bg-gray-100 text-gray-800 placeholder-gray-400"
              placeholder="Data (YYYY-MM-DD)"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              type="date"
            />
            <input
              className="rounded px-3 py-2 bg-gray-100 text-gray-800 placeholder-gray-400"
              placeholder="Cliente"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
            <input
              className="rounded px-3 py-2 bg-gray-100 text-gray-800 placeholder-gray-400"
              placeholder="Nº Bilhete"
              value={ticketNum}
              onChange={(e) => setTicketNum(e.target.value)}
              type="number"
            />
          </div>
        </div>
        {/* Cards */}
        <div className="grid grid-cols-4 grid-rows-2 gap-6 px-8 mt-2">
          {paged.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-gray-200 rounded-xl flex flex-col justify-between h-48 w-full max-w-xs mx-auto text-primary text-base font-semibold p-4 shadow"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">
                  {ticket.datetime?.split("T")[0]}
                </span>
                <span className="text-xs text-gray-500">
                  {ticket.datetime?.split("T")[1]?.slice(0, 5)} | Sala{" "}
                  {getRoomName(ticket.room_id)}
                </span>
                <span className="text-lg text-gray-800 font-bold">
                  {getMovieName(ticket.movie_id)}
                </span>
                <span className="text-gray-700">
                  Lugar: {seatLabel(ticket.seat)}
                </span>
              </div>
              <div className="flex flex-row gap-2 mt-2">
                <button
                  className="bg-blue-200 text-blue-900 py-1 px-3 rounded-md cursor-pointer flex-1"
                  onClick={() => router.push(`/tickets/qrcode/${ticket.id}`)}
                >
                  QRCode
                </button>
                <button
                  className="bg-green-200 text-green-900 py-1 px-3 rounded-md cursor-pointer flex-1"
                  onClick={() => router.push(`/tickets/${ticket.id}`)}
                >
                  Detalhes
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">
                  Nº Bilhete: {ticket.id}
                </span>
                <span className="text-xs text-gray-400">
                  {getClientName(ticket.client_id)}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Paginação */}
        <div className="flex justify-center mt-8 items-center space-x-2">
          <button
            className="px-3 py-3 rounded bg-secondary text-white disabled:opacity-50 cursor-pointer flex items-center justify-center"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                className={`px-5 py-2 rounded ${
                  pageNumber === page
                    ? "bg-quinary text-white"
                    : "bg-secondary text-white"
                } cursor-pointer`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            )
          )}
          <button
            className="px-3 py-3 rounded bg-secondary text-white disabled:opacity-50 cursor-pointer flex items-center justify-center"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
