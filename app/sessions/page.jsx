"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/src/contexts/AuthContext"; 

export default function Sessions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movie");
  const [sessions, setSessions] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [page, setPage] = useState(0);
  const SESSIONS_PER_PAGE = 5;
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRoom, setEditRoom] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [userRole, setUserRole] = useState("guest"); 
  const [rooms, setRooms] = useState([]);
  const [maxRoomId, setMaxRoomId] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRoom, setCreateRoom] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createTime, setCreateTime] = useState("");
  const [createLanguage, setCreateLanguage] = useState("");
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(user.role || "guest");
    }
  }, []);

  useEffect(() => {
    async function fetchSessionsAndMovie() {
      setLoading(true);
      try {
        const resSessions = await fetch(`/api/sessions?movie=${movieId}`);
        let sessionsData = await resSessions.json();

        // Ordena as sessões por data/hora crescente (mais próxima primeiro)
        sessionsData.sort((a, b) => new Date(a.date) - new Date(b.date));
        setSessions(sessionsData);

        const resMovie = await fetch(`/api/movies/${movieId}`);
        const movieData = await resMovie.json();
        setMovie(movieData);

        // Selecionar a primeira sessão válida (data >= hoje e hora > agora se for hoje)
        if (sessionsData.length > 0) {
          const now = new Date();
          let firstValidSession = sessionsData.find((s) => {
            const sessionDate = new Date(s.date);
            const sessionDay = sessionDate.toISOString().split("T")[0];
            const todayStr = getTodayStr();
            if (sessionDay > todayStr) return true;
            if (sessionDay === todayStr && sessionDate > now) return true;
            return false;
          });

          let firstValidDate = "";
          if (firstValidSession) {
            firstValidDate = firstValidSession.date.split("T")[0];
          } else {
            // Se não houver sessão válida, mostra a data mais próxima (primeira do array)
            firstValidDate = sessionsData[0].date.split("T")[0];
          }
          setSelectedDate(firstValidDate);
        }
      } catch {
        setSessions([]);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    }
    if (movieId) fetchSessionsAndMovie();
  }, [movieId]);

  useEffect(() => {
    // Carregar bilhetes para validação
    async function fetchTickets() {
      try {
        const res = await fetch("/api/tickets");
        if (!res.ok) return;
        const data = await res.json();
        setTickets(data);
      } catch {}
    }
    fetchTickets();
  }, [movieId]);

  useEffect(() => {
    // Carregar rooms para validação do número da sala
    async function fetchRooms() {
      try {
        const res = await fetch("/api/rooms");
        if (!res.ok) return;
        const data = await res.json();
        setRooms(data);
        if (data && data.length > 0) {
          const maxId = Math.max(...data.map((r) => Number(r.id)));
          setMaxRoomId(maxId);
        }
      } catch {}
    }
    fetchRooms();
  }, [movieId]);

  useEffect(() => {
    async function fetchAllMovies() {
      try {
        const res = await fetch("/api/movies");
        if (!res.ok) return;
        const data = await res.json();
        setMovies(data);
      } catch {}
    }
    fetchAllMovies();
  }, []);

  const filteredSessions = sessions.filter(
    (s) => s.date && s.date.split("T")[0] === selectedDate
  );

  const paginatedSessions = filteredSessions.slice(
    page * SESSIONS_PER_PAGE,
    (page + 1) * SESSIONS_PER_PAGE
  );

  const availableDates = Array.from(
    new Set(sessions.map((s) => s.date && s.date.split("T")[0]))
  );

  // Função utilitária para verificar se a data/hora é agora ou futura
  function isNowOrFuture(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    return d >= now;
  }

  // Função utilitária para verificar se a sessão pode ser selecionada
  function canSelectSession(session) {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const sessionDay = sessionDate.toISOString().split("T")[0];
    const todayStr = getTodayStr();

    // Se for hoje, só pode selecionar se a hora for futura
    if (sessionDay === todayStr) {
      return sessionDate > now;
    }
    // Se for depois de hoje, pode selecionar
    return sessionDay > todayStr;
  }

  function handleSelectSession(session) {
    if (!canSelectSession(session)) {
      toast.error(
        "Só pode selecionar sessões futuras. Para o dia de hoje, apenas sessões com hora posterior à atual."
      );
      return;
    }
    setSelectedSession(session);
  }

  function handleBuyTicket() {
    if (!selectedSession) {
      toast.error("Selecione uma sessão para comprar o bilhete.");
      return;
    }
    toast.error("Funcionalidade não implementada.");
  }

  // Função utilitária para obter a data de hoje no formato yyyy-mm-dd
  function getTodayStr() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Handler para abrir modal de edição
  function handleEditSessionClick(session) {
    // Verifica se há bilhetes associados
    const hasTickets = tickets.some((t) => String(t.session_id) === String(session.id));
    if (hasTickets) {
      toast.error("Não é possível editar sessões com bilhetes associados.");
      return;
    }
    setEditSession(session);
    setEditRoom(session.room || "");
    setEditDate(session.date ? session.date.split("T")[0] : "");
    setEditTime(session.date ? session.date.split("T")[1]?.slice(0, 5) : "");
    setEditLanguage(session.language || "");
    setShowEditModal(true);
  }

  // Handler para guardar alterações
  async function handleEditSessionSubmit(e) {
    e.preventDefault();
    if (!editRoom || !editDate || !editTime || !editLanguage) {
      toast.error("Preencha todos os campos.");
      return;
    }
    const roomNum = Number(editRoom);
    if (isNaN(roomNum) || roomNum < 1 || roomNum > maxRoomId) {
      toast.error(`O número da sala deve estar entre 1 e ${maxRoomId}.`);
      return;
    }
    // Validação: não permitir editar sessões para o passado
    const now = new Date();
    const sessionStart = new Date(`${editDate}T${editTime}`);
    if (sessionStart < now) {
      toast.error("Data invalida.");
      return;
    }
    const movieDuration = movie?.duration || 0;
    const start = sessionStart;
    const end = new Date(start.getTime() + movieDuration * 60000);

    const overlapping = sessions.some((s) => {
      if (String(s.id) === String(editSession.id)) return false;
      if (String(s.room) !== String(editRoom)) return false;
      let sDuration = movieDuration;
      if (s.movieId && s.movieId !== movieId) {
        const movieForSession = movies?.find?.(m => String(m.id) === String(s.movieId));
        if (movieForSession && movieForSession.duration) {
          sDuration = movieForSession.duration;
        }
      }
      const sStart = new Date(s.date);
      const sEnd = new Date(sStart.getTime() + sDuration * 60000);
      return start < sEnd && end > sStart;
    });
    if (overlapping) {
      toast.error("Já existe uma sessão nesta sala nesse horário.");
      return;
    }

    try {
      const res = await fetch(`/api/sessions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editSession.id,
          room: editRoom,
          date: `${editDate}T${editTime}`,
          language: editLanguage,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao atualizar sessão.");
      }
      const updated = await res.json();
      toast.success("Sessão atualizada com sucesso.");
      setSessions((prev) =>
        prev.map((s) => (String(s.id) === String(editSession.id) ? { ...s, ...updated } : s))
      );
      setShowEditModal(false);
      setEditSession(null);
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar sessão.");
    }
  }

  // Handler para eliminar sessão
  async function handleDeleteSession(session) {
    // Verifica se há bilhetes associados
    const hasTickets = tickets.some((t) => String(t.session_id) === String(session.id));
    if (hasTickets) {
      toast.error("Não é possível eliminar sessões com bilhetes associados.");
      return;
    }
    if (!window.confirm("Tem a certeza que pretende eliminar esta sessão?")) return;
    try {
      const res = await fetch(`/api/sessions?id=${session.id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao eliminar sessão.");
      }
      toast.success("Sessão eliminada com sucesso.");
      setSessions((prev) => prev.filter((s) => String(s.id) !== String(session.id)));
    } catch (err) {
      toast.error(err.message || "Erro ao eliminar sessão.");
    }
  }

  async function handleCreateSessionSubmit(e) {
    e.preventDefault();
    if (!createRoom || !createDate || !createTime || !createLanguage) {
      toast.error("Preencha todos os campos.");
      return;
    }
    const roomNum = Number(createRoom);
    if (isNaN(roomNum) || roomNum < 1 || roomNum > maxRoomId) {
      toast.error(`O número da sala deve estar entre 1 e ${maxRoomId}.`);
      return;
    }
    // Validação: não permitir criar sessões para o passado
    const now = new Date();
    const sessionStart = new Date(`${createDate}T${createTime}`);
    if (sessionStart < now) {
      toast.error("Data invalida.");
      return;
    }

    const movieDuration = movie?.duration || 0;
    const start = sessionStart;
    const end = new Date(start.getTime() + movieDuration * 60000);

    const overlapping = sessions.some((s) => {
      if (String(s.room) !== String(createRoom)) return false;
      let sDuration = movieDuration;
      if (s.movieId && String(s.movieId) !== String(movieId)) {
        const movieForSession = movies?.find?.(m => String(m.id) === String(s.movieId));
        if (movieForSession && movieForSession.duration) {
          sDuration = movieForSession.duration;
        }
      }
      const sStart = new Date(s.date);
      const sEnd = new Date(sStart.getTime() + sDuration * 60000);
      return start < sEnd && end > sStart;
    });
    if (overlapping) {
      toast.error("Já existe uma sessão nesta sala nesse horário.");
      return;
    }

    try {
      const res = await fetch(`/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: movieId,
          room: createRoom,
          date: `${createDate}T${createTime}`,
          language: createLanguage,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao criar sessão.");
      }
      const newSession = await res.json();
      toast.success("Sessão criada com sucesso.");
      setSessions((prev) => {
        const updated = [...prev, newSession];
        updated.sort((a, b) => new Date(a.date) - new Date(b.date));
        return updated;
      });
      if (newSession.date && newSession.date.split("T")[0] !== selectedDate) {
        setSelectedDate(newSession.date.split("T")[0]);
        setPage(0);
      }
      setShowCreateModal(false);
      setCreateRoom("");
      setCreateDate("");
      setCreateTime("");
      setCreateLanguage("");
    } catch (err) {
      toast.error(err.message || "Erro ao criar sessão.");
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative w-full flex-1 flex flex-col">
        <div className="grid grid-cols-3 items-center px-8 pt-6 pb-2">
          <div>
            <button
              className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
              onClick={() => router.back()}
            >
              VOLTAR
            </button>
          </div>
          <div className="flex justify-center">
            <h1 className="text-5xl font-semibold text-white text-center tracking-wider whitespace-nowrap max-w-6xl">
              SESSÕES
              {movie && movie.title ? ` - ${movie.title.toUpperCase()}` : ""}
            </h1>
          </div>
          <div className="flex justify-end">
            {userRole === "admin" && (
              <button
                className="bg-quaternary text-lg text-white px-6 py-3 rounded font-medium ml-auto cursor-pointer"
                onClick={() => setShowCreateModal(true)}
              >
                NOVA SESSÃO
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center px-8 mt-14 mb-8">
          <label
            className="text-white text-lg font-semibold mr-4"
            htmlFor="date"
          >
            Data
          </label>
          <input
            id="date"
            type="date"
            className="bg-[#181825] text-white px-4 py-2 rounded border border-[#444] outline-none"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSession(null);
              setPage(0);
              setError("");
            }}
            min={getTodayStr()}
            max={availableDates[availableDates.length - 1]}
            style={{ width: 180 }}
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <span className="text-white">A carregar...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-row items-end justify-center gap-4 w-full max-w-5xl mb-4 relative px-8">
              {filteredSessions.length > SESSIONS_PER_PAGE && page > 0 && (
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F45B69] hover:bg-[#e14a58] text-white text-xl font-bold absolute left-4 top-1/2 -translate-y-1/2 z-10 hover:cursor-pointer"
                  onClick={() => setPage(page - 1)}
                  style={{ boxShadow: "0 0 6px #0008" }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle
                      cx="11"
                      cy="11"
                      r="10"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <path
                      d="M14 7l-4 4 4 4"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
              <div className="flex flex-row gap-6 w-full mt-5 justify-center">
                {paginatedSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex flex-col items-center cursor-pointer border-2 ${
                      selectedSession && selectedSession.id === session.id
                        ? "border-[#F45B69]"
                        : "border-transparent"
                    } rounded-xl bg-[#212132] shadow-lg transition-all duration-150 w-40 relative`}
                    onClick={() => handleSelectSession(session)}
                  >
                    {userRole === "admin" && (
                      <div className="absolute top-2 right-2 flex gap-2 z-10">
                        <button
                          title="Editar sessão"
                          className="bg-blue-600 hover:bg-blue-700 rounded-full p-1 cursor-pointer"
                          tabIndex={-1}
                          type="button"
                          aria-label="Editar"
                          style={{ width: 28, height: 28 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSessionClick(session);
                          }}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path
                              d="M4 21h17"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M17.7 6.29a1 1 0 0 1 0 1.41l-9.3 9.3-3.4.7.7-3.4 9.3-9.3a1 1 0 0 1 1.41 0l1.29 1.29a1 1 0 0 1 0 1.41z"
                              stroke="#fff"
                              strokeWidth="2"
                            />
                          </svg>
                        </button>
                        <button
                          title="Eliminar sessão"
                          className="bg-red-600 hover:bg-red-700 rounded-full p-1 cursor-pointer"
                          tabIndex={-1}
                          type="button"
                          aria-label="Eliminar"
                          style={{ width: 28, height: 28 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session);
                          }}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path
                              d="M3 6h18"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                              stroke="#fff"
                              strokeWidth="2"
                            />
                            <rect
                              x="5"
                              y="6"
                              width="14"
                              height="14"
                              rx="2"
                              stroke="#fff"
                              strokeWidth="2"
                            />
                            <path
                              d="M10 11v6M14 11v6"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    {(movie?.poster || movie?.image) && (
                      <img
                        src={movie.poster || movie.image}
                        alt={movie.title}
                        className="w-full h-40 object-cover rounded-t-xl"
                        draggable={false}
                      />
                    )}
                    <div className="text-white text-lg font-semibold py-2">
                      {session.date &&
                        new Date(session.date).toLocaleTimeString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </div>
                    <div className="text-white text-base pb-2">
                      Sala: {session.room} <br />
                      Idioma: {session.language}
                    </div>
                  </div>
                ))}
              </div>
              {filteredSessions.length > SESSIONS_PER_PAGE &&
                page <
                  Math.ceil(filteredSessions.length / SESSIONS_PER_PAGE) -
                    1 && (
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F45B69] hover:bg-[#e14a58] text-white text-xl font-bold absolute right-4 top-1/2 -translate-y-1/2 z-10 hover:cursor-pointer"
                    onClick={() => setPage(page + 1)}
                    style={{ boxShadow: "0 0 6px #0008" }}
                  >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <circle
                        cx="11"
                        cy="11"
                        r="10"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 7l4 4-4 4"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
            </div>
            <div className="flex flex-col items-center mt-2 mb-4">
              <div className="text-white text-lg mb-2">
                SESSÃO SELECIONADA:
                <span className="font-bold ml-2">
                  {selectedSession
                    ? `${movie?.title?.toUpperCase() || ""} - ${
                        selectedSession.date
                          ? new Date(selectedSession.date).toLocaleTimeString(
                              "pt-PT",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""
                      }`
                    : "--"}
                </span>
              </div>
              <button
                className="bg-quaternary text-white font-bold px-16 py-4 rounded-lg text-lg mt-2 cursor-pointer"
                onClick={handleBuyTicket}
              >
                COMPRAR BILHETE
              </button>
              {error && showError && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#f8d7da] text-[#a94442] px-6 py-2 rounded shadow-lg z-50 transition-opacity duration-300">
                  {error}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#232336] rounded-xl shadow-lg p-10 flex flex-col items-center min-w-[400px] max-w-[98vw]">
            <div className="flex w-full justify-between items-start">
              <button
                className="bg-quinary text-white px-4 py-2 rounded font-medium mb-4 cursor-pointer text-base"
                onClick={() => setShowEditModal(false)}
              >
                VOLTAR
              </button>
              <h2
                className="text-white font-bold mb-6 text-center flex-1"
                style={{
                  fontSize: "1.6rem",
                  marginLeft: "32px"   
                }}
              >
                EDITAR SESSÃO
              </h2>
              <div style={{ width: 80 }} />
            </div>
            <form
              className="flex flex-col gap-4 w-full"
              onSubmit={handleEditSessionSubmit}
            >
              <div>
                <label className="block text-white mb-1">Sala</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  required
                  min={1}
                  max={maxRoomId}
                />
              </div>
              <div>
                <label className="block text-white mb-1">Data</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-1">Hora</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-1">Idioma</label>
                <select
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-[#232336] text-white appearance-none"
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  required
                  style={{ color: editLanguage ? "#fff" : "#888" }}
                >
                  <option value="" style={{ color: "#888" }}>Selecione</option>
                  <option value="PT" style={{ color: "#fff" }}>PT</option>
                  <option value="EN" style={{ color: "#fff" }}>EN</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-quaternary text-white font-bold px-8 py-3 rounded-lg text-lg mt-4 cursor-pointer"
              >
                GUARDAR
              </button>
            </form>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#232336] rounded-xl shadow-lg p-10 flex flex-col items-center min-w-[400px] max-w-[98vw]">
            <div className="flex w-full justify-between items-start">
              <button
                className="bg-quinary text-white px-4 py-2 rounded font-medium mb-4 cursor-pointer text-base"
                onClick={() => setShowCreateModal(false)}
              >
                VOLTAR
              </button>
              <h2
                className="text-white font-bold mb-6 text-center flex-1"
                style={{
                  fontSize: "1.6rem",
                  marginLeft: "32px"
                }}
              >
                NOVA SESSÃO
              </h2>
              <div style={{ width: 80 }} />
            </div>
            <form
              className="flex flex-col gap-4 w-full"
              onSubmit={handleCreateSessionSubmit}
            >
              <div>
                <label className="block text-white mb-1">Sala</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                  value={createRoom}
                  onChange={(e) => setCreateRoom(e.target.value)}
                  required
                  min={1}
                  max={maxRoomId}
                />
              </div>
              <div>
                <label className="block text-white mb-1">Data</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                  value={createDate}
                  onChange={(e) => setCreateDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-1">Hora</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-transparent text-white"
                  value={createTime}
                  onChange={(e) => setCreateTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-1">Idioma</label>
                <select
                  className="w-full px-3 py-2 rounded border border-gray-400 bg-[#232336] text-white appearance-none"
                  value={createLanguage}
                  onChange={(e) => setCreateLanguage(e.target.value)}
                  required
                  style={{ color: createLanguage ? "#fff" : "#888" }}
                >
                  <option value="" style={{ color: "#888" }}>Selecione</option>
                  <option value="PT" style={{ color: "#fff" }}>PT</option>
                  <option value="EN" style={{ color: "#fff" }}>EN</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-quaternary text-white font-bold px-8 py-3 rounded-lg text-lg mt-4 cursor-pointer"
              >
                CRIAR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
