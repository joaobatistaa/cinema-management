"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Constants } from "@/src/constants/main_page";
import { hasPermission } from "@/src/utils/permissions";
import { useAuth } from "@/src/contexts/AuthContext";

const stats = [
  { label: "Dia", value: 12 },
  { label: "Semana", value: 80 },
  { label: "Mês", value: 320 },
  { label: "Ano", value: 4000 }
];

const revenue = [
  { label: "Dia", value: "€120" },
  { label: "Semana", value: "€800" },
  { label: "Mês", value: "€3200" },
  { label: "Ano", value: "€40000" }
];

const nextSessions = [
  {
    movie: "Pecadores",
    image: "/images/movies/movie1.jpg",
    datetime: "2024-06-10 21:00"
  },
  {
    movie: "Marcello Mio",
    image: "/images/movies/movie2.jpg",
    datetime: "2024-06-11 18:30"
  },
  {
    movie: "Amador",
    image: "/images/movies/movie3.jpg",
    datetime: "2024-06-12 16:00"
  },
  {
    movie: "Pecadores",
    image: "/images/movies/movie1.jpg",
    datetime: "2024-06-13 20:00"
  },
  {
    movie: "Marcello Mio",
    image: "/images/movies/movie2.jpg",
    datetime: "2024-06-14 22:00"
  }
];

const mostViewedMovies = [
  {
    movie: "Pecadores",
    image: "/images/movies/movie1.jpg",
    views: 1200
  },
  {
    movie: "Marcello Mio",
    image: "/images/movies/movie2.jpg",
    views: 950
  },
  {
    movie: "Amador",
    image: "/images/movies/movie3.jpg",
    views: 800
  }
];

export default function HomeDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const userRole = user?.role || "guest";

  if (user === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center h-full w-full">
        <CircularProgress color="error" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex flex-col gap-4 p-8">
        {userRole === "customer" ? (
          <>
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Olá, {user?.name || "Utilizador"}
              </h2>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                PRÓXIMAS SESSÕES
              </h2>
              <div className="grid grid-cols-5 gap-4">
                {nextSessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="bg-primary rounded p-3 flex flex-col items-center shadow"
                  >
                    <Image
                      src={session.image}
                      alt={session.movie}
                      width={130}
                      height={120}
                      className="rounded mb-2 object-cover"
                    />
                    <span className="text-white text-center font-semibold text-sm">
                      {session.movie}
                    </span>
                    <span className="text-gray text-xs mt-1">
                      {session.datetime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                FILMES MAIS VISUALIZADOS
              </h2>
              <div className="grid grid-cols-5 gap-4">
                {mostViewedMovies.map((movie, idx) => (
                  <div
                    key={idx}
                    className="bg-primary rounded p-3 flex flex-col items-center shadow"
                  >
                    <Image
                      src={movie.image}
                      alt={movie.movie}
                      width={130}
                      height={120}
                      className="rounded mb-2 object-cover"
                    />
                    <span className="text-white text-center font-semibold text-sm">
                      {movie.movie}
                    </span>
                    <span className="text-gray text-xs mt-1">
                      {movie.views} visualizações
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">
                BILHETES VENDIDOS
              </h2>
              <div className="grid grid-cols-5 gap-4 mb-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="bg-secondary rounded-xl p-6 flex flex-col items-center shadow text-white"
                  >
                    <span className="text-md text-secondary">{item.label}</span>
                    <span className="text-xl font-medium mt-2">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">
                RECEITA DE VENDAS
              </h2>
              <div className="grid grid-cols-5 gap-4 mb-3">
                {revenue.map((item) => (
                  <div
                    key={item.label}
                    className="bg-secondary rounded-xl p-6 flex flex-col items-center shadow text-white"
                  >
                    <span className="text-md text-secondary">{item.label}</span>
                    <span className="text-xl font-medium mt-2">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">
                PRÓXIMAS SESSÕES
              </h2>
              <div className="grid grid-cols-5 gap-4">
                {nextSessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="bg-primary rounded p-3 flex flex-col items-center shadow"
                  >
                    <Image
                      src={session.image}
                      alt={session.movie}
                      width={130}
                      height={120}
                      className="rounded mb-2 object-cover"
                    />
                    <span className="text-white text-center font-semibold text-sm">
                      {session.movie}
                    </span>
                    <span className="text-gray text-xs mt-1">
                      {session.datetime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col justify-between h-full py-8 px-4 min-w-[200px]">
        <div className="flex flex-col gap-4">
          {Constants.HOME_BUTTONS.filter((btn) =>
            hasPermission(userRole, btn.permission)
          ).map((btn) => (
            <button
              key={btn.label}
              className="bg-quaternary text-white py-5 px-4 rounded-lg text-xl cursor-pointer"
              onClick={() => router.push(btn.path)}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <button
          className="bg-quinary text-white py-5 px-4 rounded-lg text-xl mt-8 cursor-pointer"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          SAIR
        </button>
      </div>
    </div>
  );
}
