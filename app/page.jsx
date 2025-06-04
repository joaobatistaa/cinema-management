"use client";

import { useEffect } from "react";
import { Constants } from "@/src/constants/main_page";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="flex justify-between p-2">
        <div className="flex p-5 gap-5">
          {!user ? (
            <>
              <button
                className="bg-quinary text-white text-xl px-8 py-3 rounded cursor-pointer"
                onClick={() => router.push("/login")}
              >
                INICIAR SESSÃO
              </button>
            </>
          ) : (
            <button
              className="bg-quinary text-white text-xl px-8 py-3 rounded cursor-pointer"
              onClick={logout}
            >
              TERMINAR SESSÃO
            </button>
          )}
        </div>
        <div className="p-5 flex gap-5">
          {/* Botão para guest aceder ao bar */}
          <button
            className="bg-quaternary text-xl text-white px-8 py-3 rounded cursor-pointer"
            onClick={() => router.push("/bar")}
          >
            BAR
          </button>
          <button
            className="bg-quaternary text-xl text-white px-8 py-3 rounded cursor-pointer"
            onClick={() => router.push("/movies")}
          >
            FILMES
          </button>
        </div>
      </div>

      <div className="text-left mt-6 p-7">
        <h1 className="text-4xl font-bold text-white">{Constants.TITLE}</h1>
        <h3 className="text-xl font-semibold mt-4 text-white mt-8">
          {Constants.SUBTITLE}
        </h3>
        <p className="text-lg mt-2 text-white mt-8">{Constants.MAIN_TEXT}</p>
        <ul className="text-lg mt-2 text-white mt-4 list-disc list-inside pl-5">
          {Constants.FUNCTIONALITIES.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-lg mt-2 text-white mt-8">
          {Constants.LOGIN_IN_TEXT}
        </p>
        <p className="text-lg mt-2 text-white mt-8">{Constants.LAST_TEXT}</p>
      </div>
    </div>
  );
}
