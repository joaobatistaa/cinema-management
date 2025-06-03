"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

  useEffect(() => {
    async function fetchSessionsAndMovie() {
      setLoading(true);
      try {
        const resSessions = await fetch(`/api/sessions?movie=${movieId}`);
        const sessionsData = await resSessions.json();
        setSessions(sessionsData);

        const resMovie = await fetch(`/api/movies/${movieId}`);
        const movieData = await resMovie.json();
        setMovie(movieData);

        // Selecionar a primeira data disponível que seja hoje ou futura
        if (sessionsData.length > 0) {
          const now = new Date();
          now.setSeconds(0, 0);
          const firstValidSession = sessionsData.find(
            (s) => new Date(s.date) >= now
          );
          const firstDate = firstValidSession
            ? firstValidSession.date.split("T")[0]
            : sessionsData[0].date.split("T")[0];
          setSelectedDate(firstDate);
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

  function handleSelectSession(session) {
    // Bloquear seleção de sessões de dias/horas anteriores
    if (!isNowOrFuture(session.date)) {
      setError("Não é possível selecionar sessões anteriores à hora atual.");
      return;
    }
    setSelectedSession(session);
    setError("");
  }

  function handleBuyTicket() {
    if (!selectedSession) {
      setError("Selecione uma sessão para comprar o bilhete.");
      return;
    }
    setError("Funcionalidade não implementada.");
  }

  // Função utilitária para obter a data de hoje no formato yyyy-mm-dd
  function getTodayStr() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
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
        </div>
        {/* Data alinhada à esquerda */}
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
              {/* Seta esquerda (dentro do container) */}
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
                    } rounded-xl bg-[#212132] shadow-lg transition-all duration-150 w-40`}
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
              {/* Seta direita (dentro do container) */}
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
              {error && (
                <div className="mt-4 bg-[#f8d7da] text-[#a94442] px-6 py-2 rounded">
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
