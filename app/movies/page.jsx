"use client";

import Image from "next/image";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { hasPermission } from "@/src/utils/permissions";
import { useAuth } from "@/src/contexts/AuthContext";

export default function Movies() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role || "guest";
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 10;

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const response = await fetch("/api/movies");
        if (!response.ok) {
          const errorData = response.headers
            .get("Content-Type")
            ?.includes("application/json")
            ? await response.json()
            : { message: "Erro ao carregar os filmes." };
          throw new Error(errorData.message);
        }
        const data = await response.json();
        console.log(data);
        setMovies(data);
      } catch (error) {
        toast.error(error.message || "Erro ao carregar os filmes.");
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  const paginatedMovies = movies.slice((page - 1) * pageSize, page * pageSize);

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
              FILMES
            </h1>
          </div>
          <div className="flex justify-end">
            {hasPermission(userRole, "createMovies") && (
              <button
                className="bg-quaternary text-lg text-white px-6 py-3 rounded font-medium ml-auto cursor-pointer"
                onClick={() => router.push("/movies/new")}
              >
                NOVO FILME
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row justify-center items-start px-8 h-full relative mt-4">
          {loading ? (
            <div className="flex w-full h-[590px] items-center justify-center">
              <CircularProgress color="error" />
            </div>
          ) : movies.length === 0 ? (
            <div className="flex w-full h-[590px] items-center justify-center">
              <span className="text-white text-2xl font-semibold">
                Não há filmes de momento.
              </span>
            </div>
          ) : (
            <div
              className="grid grid-cols-5 grid-rows-2 gap-4 overflow-y-auto"
              style={{ maxHeight: 590, minWidth: 0 }}
            >
              {paginatedMovies &&
                paginatedMovies.map((movie) => (
                   console.log(movie) ||
                  <div
                    key={movie.id}
                    className="relative flex flex-col items-start shadow w-full cursor-pointer"
                    style={{ minWidth: 0 }}
                    onClick={() => router.push(`/movies/${movie.id}`)}
                  >
                    {hasPermission(userRole, "createMovies") && (
                      <button
                        className="absolute top-3 right-3 bg-quaternary rounded-full p-1 flex items-center justify-center shadow cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/movies/edit/${movie.id}`);
                        }}
                        aria-label="Editar"
                        style={{ width: 32, height: 32 }}
                      >
                        <ModeEditIcon
                          className="text-white"
                          style={{ fontSize: 20 }}
                        />
                      </button>
                    )}
                    {(movie.poster || movie.image) ? (
                      <Image
                        src={
                          (movie.poster && movie.poster !== "")
                            ? movie.poster
                            : (movie.image && movie.image !== "")
                              ? movie.image
                              : "/placeholder_movie.png"
                        }
                        alt={movie.title || "Poster do filme"}
                        width={190}
                        height={200}
                        className="rounded-lg object-cover mb-2 mt-0"
                      />
                    ) : (
                      <Image
                        src="/placeholder_movie.png"
                        alt="Poster do filme"
                        width={190}
                        height={200}
                        className="rounded-lg object-cover mb-2 mt-0"
                      />
                    )}
                    <div className="w-full">
                      <span
                        className="block text-center font-normal text-white break-words truncate"
                        style={{ display: "block", width: "100%" }}
                      >
                        {movie.title}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
          {movies.length > pageSize &&
            page < Math.ceil(movies.length / pageSize) &&
            !loading && (
              <div
                className="absolute right-5 flex items-center"
                style={{ top: "47%", transform: "translateY(-47%)" }}
              >
                <button
                  className="bg-quinary rounded-full p-2 cursor-pointer opacity-80"
                  onClick={() => setPage((prev) => prev + 1)}
                  aria-label="Próxima página"
                >
                  <KeyboardArrowRightIcon
                    className="text-white"
                    fontSize="large"
                  />
                </button>
              </div>
            )}
          {movies.length > pageSize && page > 1 && !loading && (
            <div
              className="absolute left-5 flex items-center"
              style={{ top: "47%", transform: "translateY(-47%)" }}
            >
              <button
                className="bg-quinary rounded-full p-2 cursor-pointer opacity-80"
                onClick={() => setPage((prev) => prev - 1)}
                aria-label="Página Anterior"
              >
                <KeyboardArrowLeftIcon
                  className="text-white"
                  fontSize="large"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
