"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  getMovieName,
  getRoomName,
  seatLabel,
  formatDate,
  formatHour,
  getClientName
} from "@/src/utils/helpers";
import toast from "react-hot-toast";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";

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
async function fetchSettings() {
  const res = await fetch("/api/settings");
  if (!res.ok) return [];
  return await res.json();
}
async function fetchSession(sessionId) {
  if (!sessionId) return null;
  // Corrigir para aceitar id string ou number
  const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    // Tentar novamente com id numérico se falhar
    const numId = Number(sessionId);
    if (!isNaN(numId)) {
      const res2 = await fetch(`/api/sessions/${numId}`);
      if (res2.ok) return await res2.json();
    }
    return null;
  }
  return await res.json();
}

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { id } = params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [session, setSession] = useState(null);
  const [barPage, setBarPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [refundMethod, setRefundMethod] = useState("mbway");
  const [refundInfo, setRefundInfo] = useState({
    mbway: "",
    card: "",
    paypal: ""
  });
  const [cancelDays, setCancelDays] = useState(2);
  const BAR_PAGE_SIZE = 2;

  // Calcular valores
  const ticketPrice = ticket?.ticket_price;
  const barTotal =
    ticket?.bar_items?.reduce(
      (sum, item) => sum + Number(item.price) * (item.quantity || 1),
      0
    ) || 0;
  const total = ticketPrice + barTotal;

  useEffect(() => {
    async function fetchAll() {
      try {
        const ticketRes = await fetch(`/api/tickets?id=${id}`);
        if (!ticketRes.ok) throw new Error("Erro ao carregar bilhete");
        const ticketData = await ticketRes.json();

        const ticketObj = Array.isArray(ticketData)
          ? ticketData[0]
          : ticketData;
        setTicket(ticketObj);

        let sessionObj = null;
        if (ticketObj?.session_id) {
          sessionObj = await fetchSession(ticketObj.session_id);
        }
        setSession(sessionObj);

        const [moviesRes, usersRes, roomsRes, settingsRes] = await Promise.all([
          fetchMovies(),
          fetchUsers(),
          fetchRooms(),
          fetchSettings()
        ]);
        setMovies(moviesRes);
        setUsers(usersRes);
        setRooms(roomsRes);
        setCancelDays(settingsRes.max_cancel_days);
      } catch (err) {
        toast.error(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [id]);

  // Obter imagem do filme
  const movieObj = movies.find((m) => String(m.id) === String(ticket.movie_id));
  const movieImage = movieObj?.image || "/placeholder_movie.png"; // fallback

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `ticket-${ticket?.id}`
  )}`;

  async function handleCancelTicket() {
    if (
      (refundMethod === "mbway" && !refundInfo.mbway) ||
      (refundMethod === "card" && !refundInfo.card) ||
      (refundMethod === "paypal" && !refundInfo.paypal)
    ) {
      toast.error("Preencha os dados do método de reembolso.");
      return;
    }

    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-name": user.name
        }
      });
      if (!res.ok) throw new Error("Erro ao cancelar bilhete");
      router.replace("/tickets");
      toast.success(
        `O valor foi reembolsado para o método de pagamento (${refundMethodLabel(
          refundMethod
        )})`
      );
    } catch (err) {
      toast.error("Erro ao cancelar bilhete.");
    }
  }

  function refundMethodLabel(method) {
    if (method === "mbway") return "MB WAY";
    if (method === "card") return "Cartão Crédito/Débito";
    if (method === "paypal") return "PayPal";
    if (method === "cash") return "Dinheiro";
    return "";
  }

  // Verifica se pode cancelar (usando settings)
  function canCancel() {
    if (!session?.date) return false;
    const sessionDate = new Date(session.date);
    const now = new Date();
    const diffMs = sessionDate - now;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= cancelDays;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-quinary mb-4"></div>
          <span className="text-white text-lg font-semibold">
            A carregar bilhete...
          </span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-white text-lg font-semibold">
          Bilhete não encontrado.
        </span>
      </div>
    );
  }

  const sessionDate = session?.date;

  return (
    <div className="h-full w-full flex flex-col">
      {/* Topo: voltar + título, ocupa a largura toda */}
      <div className="w-full flex flex-row items-center px-8 pt-6 mb-4">
        <div className="w-40 flex-shrink-0">
          <button
            className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
            onClick={() => router.replace("/tickets")}
          >
            VOLTAR
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <h1 className="text-3xl font-semibold text-white text-center tracking-wider">
            DETALHES DO BILHETE
          </h1>
        </div>
        <div className="w-40 flex-shrink-0" />
      </div>
      {/* 3 colunas abaixo do header */}
      <div className="relative w-full flex-1 flex flex-row justify-center items-stretch">
        {/* Esquerda: detalhes */}
        <div className="flex flex-col flex-[2] max-w-[370px] min-w-[320px] px-8">
          <div className="text-white space-y-2 mt-10">
            <div>
              <span className="text-lg font-semibold">
                📅 {formatDate(sessionDate)}
              </span>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="text-lg font-semibold">
                  🕒 {formatHour(sessionDate)}
                </span>
              </div>
              <div>
                <span className="text-lg font-semibold">
                  📍 {getRoomName(ticket.room_id, rooms)}
                </span>
              </div>
            </div>
            <div>
              <span className="text-lg font-semibold">
                💺 Lugar:{" "}
                <span className="text-lg font-semibold text-primary">
                  {seatLabel(ticket.seat)}
                </span>
              </span>
            </div>
            <div>
              <span className="text-lg font-semibold">
                🎬 Filme:{" "}
                <span className="text-lg font-semibold text-primary">
                  {getMovieName(ticket.movie_id, movies)}
                </span>
              </span>
            </div>
            {user && (user.role === "admin" || user.role === "employee") && (
              <div>
                <span className="text-lg font-semibold">
                  🧍 Cliente:{" "}
                  <span className="text-lg font-semibold text-primary">
                    {ticket.user_id === -1
                      ? "Vendido na bilheteira"
                      : getClientName(ticket.user_id, users)}
                    {ticket.user_id !== -1 && (
                      <>
                        {" ("}
                        {ticket.user_id}
                        {")"}
                      </>
                    )}
                  </span>
                </span>
              </div>
            )}
            {/* Bar section with pagination */}
            <div className="mt-5">
              <span className="text-lg font-semibold">🍿 Bar: </span>
            </div>
            {ticket.bar_items && ticket.bar_items.length > 0 ? (
              <div className="flex flex-col items-start">
                <ul className="list-disc pl-10 flex flex-col gap-2">
                  {ticket.bar_items
                    .slice(
                      barPage * BAR_PAGE_SIZE,
                      barPage * BAR_PAGE_SIZE + BAR_PAGE_SIZE
                    )
                    .map((item) => (
                      <li className="text-md" key={item.id}>
                        <span>
                          {item.quantity}x {item.name} -{" "}
                          <span className="text-green-400">{item.price}€</span>
                        </span>
                      </li>
                    ))}
                </ul>
                <div className="flex items-center mt-2">
                  {ticket.bar_items.length > BAR_PAGE_SIZE && (
                    <button
                      className="bg-tertiary bg-opacity-80 rounded-full p-1 cursor-pointer"
                      onClick={() => setBarPage((p) => Math.max(0, p - 1))}
                      disabled={barPage === 0}
                    >
                      <ArrowBackIosNewIcon fontSize="small" />
                    </button>
                  )}
                  {ticket.bar_items.length > BAR_PAGE_SIZE && (
                    <div className="flex gap-1 mt-2 ml-2 mr-2">
                      {Array.from({
                        length: Math.ceil(
                          ticket.bar_items.length / BAR_PAGE_SIZE
                        )
                      }).map((_, idx) => (
                        <span
                          key={idx}
                          className={`inline-block w-2 h-2 rounded-full ${
                            idx === barPage ? "bg-quinary" : "bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {ticket.bar_items.length > BAR_PAGE_SIZE && (
                    <button
                      className="ml-2 bg-tertiary bg-opacity-80 rounded-full p-1 cursor-pointer"
                      onClick={() =>
                        setBarPage((p) =>
                          Math.min(
                            p + 1,
                            Math.floor(
                              (ticket.bar_items.length - 1) / BAR_PAGE_SIZE
                            )
                          )
                        )
                      }
                      disabled={
                        barPage >=
                        Math.floor(
                          (ticket.bar_items.length - 1) / BAR_PAGE_SIZE
                        )
                      }
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="pl-10 text-gray-400">Sem produtos do bar.</div>
            )}
            {/* Resumo dos valores */}
            <div className="mt-8">
              <span className="text-xl font-semibold">RESUMO:</span>
              <div className="flex flex-col mt-1">
                <span className="text-md font-medium">
                  BILHETE:{" "}
                  <span className="text-secondary">
                    {ticketPrice?.toFixed(2)}€
                  </span>
                </span>
                <span className="text-md font-medium">
                  BAR:{" "}
                  <span className="text-secondary">{barTotal.toFixed(2)}€</span>
                </span>
                <span className="text-md font-medium">
                  TOTAL:{" "}
                  <span className="text-secondary">{total.toFixed(2)}€</span>
                </span>
              </div>
            </div>
          </div>
          {/* Nº Bilhete no fim */}
          <div className="mt-5 text-white">
            <span className="text-md font-semibold">
              🎟️ Nº BILHETE: <span className="font-normal">{ticket.id}</span>
            </span>
          </div>
        </div>
        {/* Centro: botões */}
        <div className="flex flex-col items-center justify-end flex-[1]">
          <div className="flex flex-col items-center gap-6 w-full mb-8">
            <button
              className="bg-quaternary text-white px-8 py-3 rounded text-lg font-semibold w-60 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setOpenDialog(true)}
              disabled={!canCancel()}
              title={
                canCancel()
                  ? ""
                  : `Só é possível cancelar até ${cancelDays} dia${
                      cancelDays > 1 ? "s" : ""
                    } antes da sessão`
              }
            >
              Cancelar Bilhete
            </button>
            <button
              className="bg-quaternary text-white px-8 py-3 rounded text-lg font-semibold w-60 cursor-pointer"
              onClick={() => router.push(`/tickets/${ticket.id}/edit`)}
            >
              Alterar Bilhete
            </button>
          </div>
        </div>

        {/* Dialog de confirmação de cancelamento */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirmar Cancelamento</DialogTitle>
          <DialogContent>
            <div className="mb-2">
              Tem a certeza que pretende cancelar este bilhete? O valor será
              reembolsado para o método de pagamento selecionado.
            </div>
            <RadioGroup
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
            >
              <FormControlLabel
                value="mbway"
                control={<Radio />}
                label="MB WAY"
              />
              <FormControlLabel
                value="card"
                control={<Radio />}
                label="Cartão Crédito/Débito"
              />
              <FormControlLabel
                value="paypal"
                control={<Radio />}
                label="PayPal"
              />
              {(user?.role === "admin" || user?.role === "employee") && (
                <FormControlLabel
                  value="cash"
                  control={<Radio />}
                  label="Dinheiro"
                />
              )}
            </RadioGroup>
            {refundMethod === "mbway" && (
              <TextField
                autoFocus
                margin="dense"
                label="Número de telemóvel MB WAY"
                type="tel"
                fullWidth
                variant="standard"
                value={refundInfo.mbway}
                onChange={(e) =>
                  setRefundInfo((info) => ({ ...info, mbway: e.target.value }))
                }
              />
            )}
            {refundMethod === "card" && (
              <TextField
                autoFocus
                margin="dense"
                label="Dados do Cartão (últimos 4 dígitos)"
                type="text"
                fullWidth
                variant="standard"
                value={refundInfo.card}
                onChange={(e) =>
                  setRefundInfo((info) => ({ ...info, card: e.target.value }))
                }
              />
            )}
            {refundMethod === "paypal" && (
              <TextField
                autoFocus
                margin="dense"
                label="Email PayPal"
                type="email"
                fullWidth
                variant="standard"
                value={refundInfo.paypal}
                onChange={(e) =>
                  setRefundInfo((info) => ({ ...info, paypal: e.target.value }))
                }
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Não
            </Button>
            <Button
              onClick={async () => {
                setOpenDialog(false);
                await handleCancelTicket();
              }}
              color="error"
              variant="contained"
            >
              Sim, cancelar
            </Button>
          </DialogActions>
        </Dialog>
        {/* Direita: imagem do filme e QR code */}
        <div className="flex flex-col items-center justify-start flex-[1] min-w-[260px] max-w-[340px] pt-8 pr-8">
          <div className="w-56 h-72 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center mb-6">
            <img
              src={movieImage}
              alt="Filme"
              className="object-cover w-full h-full"
              style={{ maxHeight: "320px", maxWidth: "100%" }}
            />
          </div>
          <div className="w-56 h-56 bg-white rounded-xl flex items-center justify-center shadow">
            <img src={qrCodeUrl} alt="QR Code" className="w-45 h-45" />
          </div>
        </div>
      </div>
    </div>
  );
}
