"use client";

import { useEffect, useState } from "react";
import { Constants } from "../constants/constants";
import toast from "react-hot-toast";

export default function Home() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("/api/sessions");
        if (!response.ok) {
          throw new Error("Erro ao carregar as sessões.");
        }
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        toast.error(error.message);
      }
    }
    fetchSessions();
  }, []);

  return (
    <div>
      <div className="flex justify-between p-2">
        <div className="flex p-5 gap-5">
          <button className="mr-2 bg-quinary text-white text-xl px-12 py-6 rounded">
            INICIAR SESSÃO
          </button>
          <button className="bg-quinary text-white text-xl px-12 py-6 rounded">
            CRIAR CONTA
          </button>
        </div>
        <div className="p-5">
          <button className="mr-2 bg-quaternary text-xl text-white px-16 py-6 rounded">
            FILMES
          </button>
        </div>
      </div>

      <div className="text-left mt-12 p-7">
        <h1 className="text-4xl font-bold text-white">{Constants.TITLE}</h1>
        <h3 className="text-xl font-semibold mt-4 text-white mt-8">
          {Constants.SUBTITLE}
        </h3>
        <p className="text-lg mt-2 text-white mt-8">{Constants.MAIN_TEXT}</p>
      </div>

      <div className="mt-12 p-7">
        <h2 className="text-2xl font-bold text-white">Sessões Disponíveis</h2>
        <ul className="mt-4">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="bg-gray-800 text-white p-4 rounded mb-4"
            >
              <p>
                <strong>Filme:</strong> {session.movie}
              </p>
              <p>
                <strong>Horário:</strong> {session.time}
              </p>
              <p>
                <strong>Data:</strong> {session.date}
              </p>
              <p>
                <strong>Sala:</strong> {session.room}
              </p>
              <p>
                <strong>Lugares Disponíveis:</strong> {session.availableSeats}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
