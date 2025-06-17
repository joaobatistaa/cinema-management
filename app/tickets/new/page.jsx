"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import { formatDate, formatHour } from "@/src/utils/helpers";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import { useAuth } from "@/src/contexts/AuthContext";

export default function BuyTicketPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const movieId = searchParams.get("movie_id");
  const [saving, setSaving] = useState(false);
  const [movie, setMovie] = useState(null);
  const [session, setSession] = useState(null);
  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [barItems, setBarItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const [quantities, setQuantities] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mbway");
  const [paymentInfo, setPaymentInfo] = useState({
    mbway: "",
    card: "",
    paypal: ""
  });

  const handleQuantityChange = (itemId, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta)
    }));
  };

  // Paginação de 6 itens por página
  const paginatedItems = barItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(barItems.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    async function fetchDetails() {
      if (!movieId || !sessionId) return;
      try {
        const [movieRes, sessionRes, barRes, ticketsRes] = await Promise.all([
          fetch(`/api/movies/${movieId}`),
          fetch(`/api/sessions/${sessionId}`),
          fetch("/api/bar"),
          fetch(`/api/tickets/session/${sessionId}`)
        ]);
        const movieData = await movieRes.json();
        const sessionData = await sessionRes.json();
        const barData = await barRes.json();
        setMovie(movieData);
        setSession(sessionData);
        setBarItems(Array.isArray(barData) ? barData : []);

        if (sessionData && sessionData.room) {
          const roomRes = await fetch(`/api/rooms/${sessionData.room}`);
          const roomData = await roomRes.json();
          setRoom(roomData);
          setSeats(roomData.seats || []);
          setRows(roomData.seats?.length || 0);
          setCols(roomData.seats?.[0]?.length || 0);
        }

        // Buscar lugares ocupados para esta sessão usando a nova API
        const tickets = await ticketsRes.json();
        const occupied = tickets.map((t) => `${t.seat?.row}-${t.seat?.col}`);
        setOccupiedSeats(occupied);
      } catch (err) {
        toast.error("Erro ao carregar os detalhes da sessão, sala ou bar.");
      }
    }
    fetchDetails();
  }, [movieId, sessionId]);

  // Remove status, only use type. Check occupation by tickets.
  function isSeatOccupied(rowIdx, colIdx) {
    const seatKey = `${rowIdx + 1}-${colIdx + 1}`;
    return occupiedSeats.includes(seatKey);
  }

  function isSeatSelected(rowIdx, colIdx) {
    return (
      selectedSeat &&
      selectedSeat.row === rowIdx + 1 &&
      selectedSeat.col === colIdx + 1
    );
  }

  function isAccessibilitySeat(rowIdx, colIdx) {
    const seat = seats?.[rowIdx]?.[colIdx];
    return seat && seat.type === "accessibility";
  }

  function handleSeatSelect(rowIdx, colIdx) {
    const seat = seats?.[rowIdx]?.[colIdx];
    if (!seat || isSeatOccupied(rowIdx, colIdx)) return;
    if (
      selectedSeat &&
      selectedSeat.row === rowIdx + 1 &&
      selectedSeat.col === colIdx + 1
    ) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat({ row: rowIdx + 1, col: colIdx + 1 });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setOpenDialog(true);
  }

  async function handleConfirmPurchase() {
    // Validação dos campos obrigatórios do método de pagamento
    if (
      (paymentMethod === "mbway" && !paymentInfo.mbway) ||
      (paymentMethod === "card" && !paymentInfo.card) ||
      (paymentMethod === "paypal" && !paymentInfo.paypal)
    ) {
      toast.error("Preencha os dados do método de pagamento.");
      return;
    }
    setSaving(true);
    try {
      const now = new Date();
      const datetime = now.toISOString();

      const data = {
        email: user.email,
        movie_title: movie?.title || "",
        movie_id: movieId,
        session_id: sessionId,
        room_id: room?.id,
        seat: selectedSeat,
        datetime,
        bar_items: Object.entries(quantities)
          .filter(([_, qty]) => qty > 0)
          .map(([itemId, qty]) => {
            const item = barItems.find((i) => String(i.id) === String(itemId));
            return {
              id: item?.id,
              name: item?.name,
              price: item?.price,
              quantity: qty
            };
          }),
        ticket_price: session?.price,
        bar_total: barTotal,
        buy_total: session?.price + barTotal,
        payment_method: paymentMethod,
        payment_info:
          paymentMethod === "mbway"
            ? paymentInfo.mbway
            : paymentMethod === "card"
            ? paymentInfo.card
            : paymentInfo.paypal
      };

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Erro ao criar bilhete");
      }

      toast.success("Bilhete comprado com sucesso!");
      setOpenDialog(false);
      router.replace("/tickets");
    } catch (err) {
      toast.error("Erro ao comprar bilhete.");
    } finally {
      setSaving(false);
    }
  }

  // Calcula o total do bar sempre que quantities ou barItems mudam
  const barTotal = React.useMemo(() => {
    let total = 0;
    barItems.forEach((item) => {
      const qty = quantities[item.id] || 0;
      const price = Number(
        String(item.price).replace(",", ".").replace("€", "")
      );
      total += qty * price;
    });
    return total;
  }, [barItems, quantities]);

  return (
    <div className="h-full w-full flex flex-col overflow-x-hidden overflow-y-auto">
      <div className="relative w-full flex-1 flex flex-col overflow-x-hidden">
        <div className="flex items-center px-8 pt-6 w-full">
          <div className="w-40 flex-shrink-0">
            <button
              className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
              onClick={() => router.back()}
            >
              VOLTAR
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-4xl font-semibold text-white text-center tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
              NOVO BILHETE
            </h1>
          </div>
          <div className="w-40 flex-shrink-0" />
        </div>
        {saving || !session || !movie || !room ? (
          <div className="flex flex-1 items-center justify-center h-full w-full">
            <CircularProgress color="error" size={100} />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 px-4 md:px-10 pt-6 w-full max-w-full"
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full max-w-full overflow-auto">
              {/* Opções à esquerda */}
              <div className="flex flex-col gap-4 w-full md:w-1/2 max-w-full">
                <div>
                  <span className="text-lg text-white font-semibold">
                    📅 {formatDate(session.date)}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-lg text-white font-semibold">
                      🕒 {formatHour(session.date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-lg text-white font-semibold">
                      📍 {room?.name || ""}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-lg text-white font-semibold">
                    🎬 Filme:{" "}
                    <span className="text-lg font-semibold text-primary pl-2">
                      {movie?.title || ""}
                    </span>
                  </span>
                </div>
                {/* Bar Section */}
                <div className="mt-3 w-full max-w-full">
                  <h2 className="text-lg text-white font-semibold">🍿 Bar:</h2>
                  <div className="grid grid-cols-2 gap-x-4 mt-2 w-full max-w-full">
                    {Array.from({ length: itemsPerPage }).map((_, idx) => {
                      const item = paginatedItems[idx];
                      if (!item) return null;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center w-full min-h-[40px] gap-2 text-[0.95rem] min-w-0"
                        >
                          <span className="text-white font-medium break-words text-center w-[100px] min-w-[90px] max-w-[100px] leading-tight">
                            {item.name}
                          </span>
                          <div className="flex items-center justify-center gap-1 w-[54px] min-w-[54px] max-w-[54px]">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="bg-quaternary text-white rounded flex items-center justify-center text-[0.8rem] w-[18px] h-[18px] p-0 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-white font-semibold text-center min-w-[16px] w-[16px] inline-block text-[0.95rem]">
                              {quantities[item.id] || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="bg-quaternary text-white rounded flex items-center justify-center text-[0.8rem] w-[18px] h-[18px] p-0 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-medium text-center text-green-400 w-[50px] min-w-[50px] max-w-[50px] text-[0.85rem]">
                            {item.price} €
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center items-center mt-6 gap-4 w-full max-w-full">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 0}
                      className={`bg-quaternary text-white px-1 py-1 rounded font-medium text-[0.8rem] cursor-pointer ${
                        currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {/* Chevron Left Open */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <span className="text-white font-semibold text-[0.8rem]">
                      {currentPage + 1}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                      className={`bg-quaternary text-white px-1 py-1 rounded font-medium text-[0.8rem] cursor-pointer ${
                        currentPage >= totalPages - 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {/* Chevron Right Open */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Ticket Summary Section */}
                <div className="mt-3 rounded-lg flex flex-col w-full max-w-full">
                  <h3 className="text-white text-2xl font-semibold mb-2">
                    Resumo:
                  </h3>
                  <div className="flex font-semibold justify-left gap-4 text-white">
                    <span>LUGAR:</span>
                    <span className="text-secondary">
                      {selectedSeat
                        ? `${String.fromCharCode(64 + selectedSeat.row)}${
                            selectedSeat.col
                          }`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex font-semibold justify-left gap-4 text-white">
                    <span>BILHETE:</span>
                    <span className="text-secondary">
                      {/* Substitua o valor abaixo pelo valor real do bilhete se disponível */}
                      {session?.price
                        ? Number(session.price).toFixed(2) + "€"
                        : "-"}
                    </span>
                  </div>
                  <div className="flex font-semibold justify-left gap-4 text-white">
                    <span>BAR:</span>
                    <span className="text-secondary">
                      {barTotal.toFixed(2) + "€"}
                    </span>
                  </div>
                  <div className="flex font-bold justify-left gap-4 text-white">
                    <span>TOTAL:</span>
                    <span className="text-secondary">
                      {(barTotal + session?.price).toFixed(2) + "€"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Previsualização da sala à direita */}
              <div className="flex-1 flex justify-center items-start w-full max-w-full">
                <div
                  className="bg-room-map rounded-lg shadow flex flex-col items-center justify-start"
                  style={{
                    width: "100%",
                    maxWidth: 450,
                    height: 400,
                    minWidth: 250,
                    minHeight: 250,
                    maxHeight: 500,
                    margin: "0 auto",
                    padding: 16,
                    overflow: "hidden"
                  }}
                >
                  {/* Legenda */}
                  <div className="flex gap-4 mb-5">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-5 h-5 rounded bg-green-500" />
                      <span className="text-white text-xs">Disponível</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-5 h-5 rounded bg-quaternary" />
                      <span className="text-white text-xs">Ocupado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-5 h-5 rounded bg-blue-500" />
                      <span className="text-white text-xs">Acessível</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-5 h-5 rounded bg-orange-400" />
                      <span className="text-white text-xs">Selecionado</span>
                    </div>
                  </div>
                  {/* Ecrã */}
                  <div className="w-full flex justify-center mb-3 px-2">
                    <div className="bg-gray-300 rounded-t-lg h-5 w-full flex items-center justify-center">
                      <span className="text-xs text-gray-700 font-bold">
                        ECRÃ
                      </span>
                    </div>
                  </div>
                  {/* Grade de cadeiras com scroll */}
                  <div
                    className="overflow-auto w-full h-full"
                    style={{ flex: 1, position: "relative", maxWidth: "100%" }}
                  >
                    <div
                      className="inline-block"
                      style={{
                        minWidth: cols * 40 + 40,
                        minHeight: rows * 40 + 30,
                        maxWidth: "100%"
                      }}
                    >
                      <div className="overflow-auto w-full h-full flex justify-center">
                        <div
                          className="grid gap-2"
                          style={{
                            gridTemplateColumns: `40px repeat(${cols}, 1fr)`,
                            minWidth: cols * 42 + 40,
                            maxWidth: "100%"
                          }}
                        >
                          <div />
                          {Array.from({ length: cols }).map((_, colIdx) => (
                            <div
                              key={`header-${colIdx}`}
                              className="text-center text-xs text-white font-bold"
                            >
                              {colIdx + 1}
                            </div>
                          ))}
                          {seats.map((row, rowIdx) => (
                            <React.Fragment key={rowIdx}>
                              <div className="text-xs text-white font-bold flex items-center justify-center">
                                {String.fromCharCode(65 + rowIdx)}
                              </div>
                              {row.map((seat, colIdx) => {
                                let seatColor = "bg-green-500"; // disponível
                                if (!seat) seatColor = ""; // sem cadeira
                                else if (isSeatOccupied(rowIdx, colIdx))
                                  seatColor = "bg-quaternary";
                                else if (isSeatSelected(rowIdx, colIdx))
                                  seatColor = "bg-orange-400";
                                else if (isAccessibilitySeat(rowIdx, colIdx))
                                  seatColor = "bg-blue-500";

                                return (
                                  <div
                                    key={colIdx}
                                    className="flex items-center justify-center"
                                  >
                                    <button
                                      type="button"
                                      className={`cursor-pointer w-full max-w-[42px] h-8 rounded ${seatColor}`}
                                      title={`Linha ${String.fromCharCode(
                                        65 + rowIdx
                                      )}, Coluna ${colIdx + 1}`}
                                      onClick={() =>
                                        handleSeatSelect(rowIdx, colIdx)
                                      }
                                      disabled={
                                        !seat || isSeatOccupied(rowIdx, colIdx)
                                      }
                                    />
                                  </div>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center w-full max-w-full">
              <button
                type="submit"
                disabled={saving || !selectedSeat}
                className={`bg-quaternary text-white px-4 py-3 rounded font-medium flex items-center justify-center tracking-wider ${
                  !selectedSeat
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {saving ? "A GUARDAR..." : "CONFIRMAR COMPRA"}
              </button>
            </div>
          </form>
        )}
        {/* Dialog de pagamento */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Escolha o método de pagamento</DialogTitle>
          <DialogContent>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="mbway"
                control={<Radio />}
                label="MB WAY"
              />
              <FormControlLabel
                value="card"
                control={<Radio />}
                label="Cartão Débito/VISA"
              />
              <FormControlLabel
                value="paypal"
                control={<Radio />}
                label="PayPal"
              />
            </RadioGroup>
            {paymentMethod === "mbway" && (
              <TextField
                autoFocus
                margin="dense"
                label="Número de telemóvel MB WAY"
                type="tel"
                fullWidth
                variant="standard"
                value={paymentInfo.mbway}
                onChange={(e) =>
                  setPaymentInfo((info) => ({ ...info, mbway: e.target.value }))
                }
              />
            )}
            {paymentMethod === "card" && (
              <TextField
                autoFocus
                margin="dense"
                label="Dados do Cartão (últimos 4 dígitos)"
                type="text"
                fullWidth
                variant="standard"
                value={paymentInfo.card}
                onChange={(e) =>
                  setPaymentInfo((info) => ({ ...info, card: e.target.value }))
                }
              />
            )}
            {paymentMethod === "paypal" && (
              <TextField
                autoFocus
                margin="dense"
                label="Email PayPal"
                type="email"
                fullWidth
                variant="standard"
                value={paymentInfo.paypal}
                onChange={(e) =>
                  setPaymentInfo((info) => ({
                    ...info,
                    paypal: e.target.value
                  }))
                }
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              color="success"
              variant="contained"
              disabled={
                (paymentMethod === "mbway" && !paymentInfo.mbway) ||
                (paymentMethod === "card" && !paymentInfo.card) ||
                (paymentMethod === "paypal" && !paymentInfo.paypal)
              }
            >
              Confirmar Compra
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
