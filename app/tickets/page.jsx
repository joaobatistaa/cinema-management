"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import toast from "react-hot-toast";
import {
  formatDate,
  formatHour,
  getMovieName,
  getRoomName,
  seatLabel,
  truncate
} from "@/src/utils/helpers";
import SettingsIcon from "@mui/icons-material/Settings";

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
async function fetchSessions() {
  const res = await fetch("/api/sessions");
  if (!res.ok) return [];
  return await res.json();
}
async function fetchSettings() {
  const res = await fetch("/api/settings");
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
  const [sessions, setSessions] = useState([]);

  const [movie, setMovie] = useState("");
  const [datetime, setDatetime] = useState("");
  const [client, setClient] = useState("");
  const [ticketNum, setTicketNum] = useState("");

  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [qrTicketId, setQrTicketId] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cancelDays, setCancelDays] = useState(2);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [newCancelDays, setNewCancelDays] = useState(cancelDays);

  const { user } = useAuth();

  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          ticketsRes,
          moviesRes,
          usersRes,
          roomsRes,
          settingsRes,
          sessionsRes
        ] = await Promise.all([
          fetch("/api/tickets"),
          fetchMovies(),
          fetchUsers(),
          fetchRooms(),
          fetchSettings(),
          fetchSessions()
        ]);
        if (!ticketsRes.ok) throw new Error("Erro ao carregar bilhetes");
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData);
        setFiltered(ticketsData);
        setMovies(moviesRes);
        setUsers(usersRes);
        setRooms(roomsRes);
        setSessions(sessionsRes);
        setCancelDays(settingsRes?.max_cancel_days || 2);
      } catch (err) {
        toast.error(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    setNewCancelDays(cancelDays);
  }, [cancelDays]);
  async function handleSaveSettings() {
    setSettingsLoading(true);
    setSettingsError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          max_cancel_days: Number(newCancelDays),
          actorId: user.id,
          actorName: user.name
        })
      });
  
      if (!res.ok) {
        throw new Error("Erro ao atualizar definições.");
      }
  
      setCancelDays(Number(newCancelDays));
      setSettingsOpen(false);
      toast.success("Definições atualizadas com sucesso.");
    } catch (err) {
      setSettingsError("Erro ao atualizar definições.");
    } finally {
      setSettingsLoading(false);
    }
  }
  

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
      const matchingUserIds = users
        .filter((u) => u.name?.toLowerCase().includes(client.toLowerCase()))
        .map((u) => String(u.id));
      if (matchingUserIds.length > 0)
        result = result.filter((t) =>
          matchingUserIds.includes(String(t.client_id))
        );
      else result = [];
    }
    if (ticketNum)
      result = result.filter((t) => String(t.id).includes(ticketNum));
    setFiltered(result);
    setPage(1);
  }, [movie, datetime, client, ticketNum, tickets, movies, users]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-quinary mb-4"></div>
          <span className="text-white text-lg font-semibold">
            A carregar bilhetes...
          </span>
        </div>
      </div>
    );
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
                {user?.role === "admin" ? "GESTÃO DOS BILHETES" : "BILHETES"}
              </h1>
            </div>
            <div className="w-40 flex-shrink-0 flex justify-end items-center">
              {/* Icone de definições só para admin/employee */}
              {(user?.role === "admin" || user?.role === "employee") && (
                <button
                  title="Definições"
                  className="text-white hover:text-quinary"
                  onClick={() => setSettingsOpen(true)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer"
                  }}
                >
                  <SettingsIcon fontSize="large" />
                </button>
              )}
            </div>
          </div>
          {(user?.role === "admin" || user?.role === "employee") && (
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 text-sm text-white font-medium">
                  FILTRAR POR FILME
                </label>
                <input
                  className="px-3 py-2 rounded-lg border-2 border-white bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  placeholder="Filme"
                  value={movie}
                  onChange={(e) => setMovie(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm text-white font-medium">
                  FILTRAR POR DATA E HORA
                </label>
                <input
                  className="px-3 py-2 rounded-lg border-2 border-white bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  placeholder="Data e Hora"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  type="datetime-local"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm text-white font-medium">
                  FILTRAR POR CLIENTE
                </label>
                <input
                  className="px-3 py-2 rounded-lg border-2 border-white bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  placeholder="Cliente"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm text-white font-medium">
                  FILTRAR POR Nº BILHETE
                </label>
                <input
                  className="px-3 py-2 rounded-lg border-2 border-white bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  placeholder="Nº Bilhete"
                  value={ticketNum}
                  onChange={(e) => setTicketNum(e.target.value)}
                  type="number"
                />
              </div>
            </div>
          )}
        </div>
        {/* Cards */}
        <div className="grid grid-cols-4 grid-rows-2 gap-4 px-8 mt-2">
          {paged.length === 0 ? (
            <div className="col-span-4 flex flex-col items-center justify-center py-16">
              {tickets.length === 0 ? (
                <span className="text-white text-lg font-semibold">
                  Não existem bilhetes para mostrar.
                </span>
              ) : (
                <span className="text-white text-lg font-semibold">
                  Não existem bilhetes para esse filtro.
                </span>
              )}
            </div>
          ) : (
            paged.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-tertiary rounded-xl flex flex-col justify-between h-50 w-full max-w-xs mx-auto text-primary text-base font-semibold p-3"
              >
                {/* Data no topo, centrada */}
                <div className="flex justify-center mb-1">
                  <span className="text-base text-white">
                    📅{" "}
                    {formatDate(
                      sessions.find((s) => s.id === ticket.session_id)?.date
                    )}
                  </span>
                </div>
                {/* Hora e sala lado a lado */}
                <div className="flex flex-row justify-between items-center mb-1">
                  <span className="text-sm text-white flex items-center gap-1">
                    🕒{" "}
                    {formatHour(
                      sessions.find((s) => s.id === ticket.session_id)?.date
                    )}
                  </span>
                  <span className="text-sm text-white flex items-center gap-1">
                    📍 {truncate(getRoomName(ticket.room_id, rooms), 9)}
                  </span>
                </div>
                {/* Nome do filme e cadeira lado a lado */}
                <div className="flex flex-row justify-between items-center mb-1">
                  <span className="text-sm text-white flex items-center gap-1">
                    🎬 {truncate(getMovieName(ticket.movie_id, movies), 18)}
                  </span>
                  <span className="text-sm text-white flex items-center gap-1">
                    💺 {seatLabel(ticket.seat)}
                  </span>
                </div>
                {/* Botões lado a lado */}
                {user?.role === "admin" || user?.role === "employee" ? (
                  <>
                    <div className="flex flex-row gap-2 mt-2">
                      <button
                        className="bg-quaternary text-white py-1 px-3 rounded-md cursor-pointer flex-1 text-sm"
                        onClick={() =>
                          router.push(`/tickets/${ticket.id}/edit`)
                        }
                      >
                        EDITAR
                      </button>
                      <button
                        className="bg-quaternary text-white py-1 px-3 rounded-md cursor-pointer flex-1 text-sm"
                        onClick={() => router.push(`/tickets/${ticket.id}`)}
                      >
                        DETALHES
                      </button>
                    </div>
                  </>
                ) : user?.role === "customer" ? (
                  <>
                    <div className="flex flex-row gap-2 mt-2">
                      <button
                        className="bg-quaternary text-white py-1 px-3 rounded-md cursor-pointer flex-1 text-sm"
                        onClick={() => {
                          setQrTicketId(ticket.id);
                          setShowQr(true);
                        }}
                      >
                        QR CODE
                      </button>
                      <button
                        className="bg-quaternary text-white py-1 px-3 rounded-md cursor-pointer flex-1 text-sm"
                        onClick={() => router.push(`/tickets/${ticket.id}`)}
                      >
                        DETALHES
                      </button>
                    </div>
                  </>
                ) : null}
                {/* Nº Bilhete alinhado à esquerda */}
                <div className="flex justify-start items-center mt-2">
                  <span className="text-sm text-white flex items-center gap-1">
                    🎟️ Nº Bilhete: {ticket.id}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {/* QR Code Modal */}
        {showQr && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backdropFilter: "blur(8px)",
              background: "rgba(0,0,0,0.1)"
            }}
            onClick={() => setShowQr(false)}
          >
            <div
              className="bg-white rounded shadow-lg flex flex-col items-center justify-center p-8"
              style={{ minWidth: 320, minHeight: 320, position: "relative" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botão de fechar (cruz) no canto superior direito */}
              <button
                onClick={() => setShowQr(false)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0
                }}
                aria-label="Fechar"
              >
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="14" fill="#232323" />
                  <line
                    x1="9"
                    y1="9"
                    x2="19"
                    y2="19"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="19"
                    y1="9"
                    x2="9"
                    y2="19"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  `ticket-${qrTicketId}`
                )}`}
                alt="QR Code"
                className="w-60 h-60"
              />
            </div>
          </div>
        )}
        {/* Paginação */}
        <div className="flex justify-center mt-6 items-center space-x-2">
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
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Definições</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-3 mt-2">
            <label className="font-semibold mb-1">
              Máximo de dias para cancelar bilhete antes da sessão:
            </label>
            <TextField
              type="number"
              value={newCancelDays}
              onChange={(e) => setNewCancelDays(e.target.value)}
              inputProps={{ min: 1, max: 30 }}
              fullWidth
              variant="standard"
            />
            {settingsError && (
              <span className="text-red-500 text-sm">{settingsError}</span>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveSettings}
            color="success"
            variant="contained"
            disabled={
              settingsLoading || !newCancelDays || Number(newCancelDays) < 1
            }
          >
            {settingsLoading ? "A guardar..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
