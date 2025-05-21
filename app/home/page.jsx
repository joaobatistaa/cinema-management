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

export default function HomeDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const userRole = user?.role || "guest";

  return (
    <div className="flex h-full w-full">
      {/* Esquerda: Cards */}
      <div className="flex-1 flex flex-col gap-8 p-8">
        {/* Bilhetes vendidos */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            Bilhetes Vendidos
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="bg-secondary rounded-xl p-6 flex flex-col items-center shadow text-white"
              >
                <span className="text-md text-secondary">{item.label}</span>
                <span className="text-xl font-medium mt-2">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Receita de vendas */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            Receita de Vendas
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {revenue.map((item) => (
              <div
                key={item.label}
                className="bg-secondary rounded-xl p-6 flex flex-col items-center shadow text-white"
              >
                <span className="text-md text-secondary">{item.label}</span>
                <span className="text-xl font-medium mt-2">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Próximas sessões */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            Próximas Sessões
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
      </div>
      {/* Direita: Barra de navegação */}
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
