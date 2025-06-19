"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function ChangeSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movie");
  const ticketId = searchParams.get("ticket_id");
  const currentSessionId = searchParams.get("current_session_id");
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

        // Selecionar a sessão atual se fornecida
        if (sessionsData.length > 0) {
          let initialSession = null;
          if (currentSessionId) {
            initialSession = sessionsData.find(
              (s) => String(s.id) === String(currentSessionId)
            );
          }
          if (!initialSession) {
            // fallback para primeira válida
            const now = new Date();
            initialSession =
              sessionsData.find((s) => new Date(s.date) > now) ||
              sessionsData[0];
          }
          setSelectedSession(initialSession);
          setSelectedDate(initialSession?.date?.split("T")[0] || "");
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

  // Função utilitária para obter a data de hoje no formato yyyy-mm-dd
  function getTodayStr() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function handleConfirmChange() {
    if (!selectedSession || !ticketId) {
      toast.error("Selecione uma sessão para alterar.");
      return;
    }
    // Redireciona para a edição do bilhete com a nova sessão
    router.push(
      `/tickets/${ticketId}/edit?session_id=${selectedSession.id}&movie_id=${movieId}`
    );
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
            <h1 className="text-4xl font-semibold text-white text-center tracking-wider whitespace-nowrap max-w-6xl">
              ALTERAR SESSÃO
            </h1>
          </div>
          <div />
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
          <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-quinary mb-4"></div>
              <span className="text-white text-lg font-semibold">
                A carregar...
              </span>
            </div>
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
                          minute: "2-digit"
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
                                minute: "2-digit"
                              }
                            )
                          : ""
                      }`
                    : "--"}
                </span>
              </div>
              <button
                className="bg-quaternary text-white font-bold px-16 py-4 rounded-lg text-lg mt-2 cursor-pointer"
                onClick={handleConfirmChange}
              >
                CONFIRMAR ALTERAÇÃO
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
    </div>
  );
}
