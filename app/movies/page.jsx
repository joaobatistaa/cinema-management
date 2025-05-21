"use client";

import Image from "next/image";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { hasPermission } from "@/src/utils/permissions";
import { useAuth } from "@/src/contexts/AuthContext";

export default function Movies() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role || "guest";
  console.log(userRole);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("/api/movies");
        if (!response.ok) {
          throw new Error("Erro ao carregar os filmes.");
        }
        const data = await response.json();

        setMovies(data);
      } catch (error) {
        toast.error(error.message);
      }
    }
    fetchMovies();
  }, []);

  const paginatedMovies = movies.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="relative w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 pt-6 pb-2">
          <button
            className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
            onClick={() => router.back()}
          >
            VOLTAR
          </button>
          <h1 className="text-5xl font-semibold text-white text-center flex-1 tracking-wider">
            FILMES
          </h1>
          {hasPermission(userRole, "createMovies") && (
            <button
              className="bg-quaternary text-lg text-white px-6 py-3 rounded font-medium ml-auto cursor-pointer"
              onClick={() => router.push("/movies/new")}
            >
              NOVO FILME
            </button>
          )}
        </div>

        <div className="flex flex-row justify-center items-start px-8 h-full relative mt-4">
          <div
            className="grid grid-cols-5 grid-rows-2 gap-4 overflow-y-auto"
            style={{ maxHeight: 590, minWidth: 0 }}
          >
            {paginatedMovies &&
              paginatedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="relative flex flex-col items-start shadow w-full"
                  style={{ minWidth: 0 }}
                >
                  {hasPermission(userRole, "createMovies") && (
                    <button
                      className="absolute top-3 right-3 bg-quaternary rounded-full p-1 flex items-center justify-center shadow cursor-pointer"
                      onClick={() => router.push(`/movies/edit/${movie.id}`)}
                      aria-label="Editar"
                      style={{ width: 32, height: 32 }}
                    >
                      <ModeEditIcon
                        className="text-white"
                        style={{ fontSize: 20 }}
                      />
                    </button>
                  )}
                  <Image
                    src={movie.image || "/placeholder_movie.png"}
                    alt={movie.title}
                    width={190}
                    height={200}
                    className="rounded-lg object-cover mb-2 mt-0"
                  />
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
          {movies.length > pageSize &&
            page < Math.ceil(movies.length / pageSize) && (
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
          {movies.length > pageSize && page > 1 && (
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
          ;
        </div>
      </div>
    </div>
  );
}
