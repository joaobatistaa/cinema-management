"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function MovieDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      setLoading(true);
      try {
        const res = await fetch(`/api/movies/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar filme.");
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        setMovie(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchMovie();
  }, [id]);

  function formatDuration(minutes) {
    if (!minutes || isNaN(minutes)) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h` : ""}${m > 0 ? ` ${m}m` : h === 0 ? "0m" : ""}`.trim();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        A carregar...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p>Filme não encontrado.</p>
        <button
          className="mt-4 bg-quinary text-white px-6 py-2 rounded"
          onClick={() => router.back()}
        >
          VOLTAR
        </button>
      </div>
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
            <h1 className="text-5xl font-semibold text-white text-center tracking-wider">
              {movie.title}
            </h1>
          </div>
        </div>
        {/* Sinopse + Detalhes + Poster */}
        <div className="flex flex-col md:flex-row gap-12 px-12 pt-2 pb-0 mt-15 items-start">
          {/* Esquerda: Sinopse + Detalhes */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Sinopse alinhada à esquerda */}
            <div className="mb-6">
              <p className="text-white text-base">{movie.synopsis}</p>
            </div>
            {/* Detalhes */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-white text-base">
              {/* Coluna esquerda */}
              <div>
                <span className="font-semibold text-[#b0b0b0]">Duração:</span>
                <div className="ml-2 font-bold text-white">{formatDuration(movie.duration)}</div>
                <span className="font-semibold text-[#b0b0b0] mt-3 block">Ano de Lançamento:</span>
                <div className="ml-2 font-bold text-white">{movie.year}</div>
                <span className="font-semibold text-[#b0b0b0] mt-3 block">Género:</span>
                <div className="ml-2 font-bold text-white">{movie.genre}</div>
                <span className="font-semibold text-[#b0b0b0] mt-3 block">Classificação:</span>
                <div className="ml-2 font-bold text-white">{movie.rating}</div>
              </div>
              {/* Coluna direita */}
              <div>
                <span className="font-semibold text-[#b0b0b0]">Realização:</span>
                <div className="ml-2 font-bold text-white">{movie.director}</div>
                <span className="font-semibold text-[#b0b0b0] mt-3 block">Elenco:</span>
                <div className="ml-2 font-bold text-white">
                  <ul className="mt-1 list-none">
                    {Array.isArray(movie.cast)
                      ? movie.cast.map((actor, idx) => (
                          <li key={idx}>{actor}</li>
                        ))
                      : movie.cast}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* Direita: Poster */}
          <div className="flex flex-col items-center min-w-[220px]">
            {(movie.poster || movie.image) && (
              <img
                src={movie.poster || movie.image}
                alt={movie.title}
                className="w-[220px] h-[310px] object-cover rounded-lg shadow mb-6"
              />
            )}
          </div>
        </div>
        <div className="flex justify-center mt-10 mb-8">
          <button
            className="bg-[#F45B69] hover:bg-[#e14a58] text-white font-bold px-16 py-4 rounded-lg text-lg"
            onClick={() => router.push(`/sessions?movie=${movie.id}`)}
          >
            VER SESSÕES
          </button>
        </div>
      </div>
    </div>
  );
}
