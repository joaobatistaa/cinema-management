"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CircularProgress } from "@mui/material";
import toast from "react-hot-toast";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SOUND_TYPES, VIDEO_TYPES } from "@/src/constants/rooms";

const ViewRoomPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [soundType, setSoundType] = useState(SOUND_TYPES[0]);
  const [videoType, setVideoType] = useState(VIDEO_TYPES[0]);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`/api/rooms/${id}`);
        if (!res.ok) {
          const errorData = res.headers
            .get("Content-Type")
            ?.includes("application/json")
            ? await res.json()
            : { message: "Erro ao carregar sala" };
          throw new Error(errorData.message);
        }

        const data = await res.json();
        setName(data.name);
        setSoundType(data.soundType);
        setVideoType(data.videoType);
        setRows(data.seats.length);
        setCols(data.seats[0]?.length || 0);
        setSeats(data.seats);
        setLoading(false);
      } catch (err) {
        toast.error(err.message || "Erro ao carregar sala");
        router.replace("/rooms");
      }
    }

    fetchRoom();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full w-full">
        <CircularProgress color="error" size={100} />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative w-full flex-1 flex flex-col">
        <div className="flex items-center px-8 pt-6 w-full">
          <div className="w-40 flex-shrink-0">
            <button
              className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
              onClick={() => router.back()}
            >
              VOLTAR
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-4xl font-semibold text-white text-center tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
              DETALHES DA SALA
            </h1>
          </div>
          <div className="w-40 flex-shrink-0" />
        </div>
        <div className="flex flex-col gap-6 p-10">
          {/* Nome da sala */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-white mb-1">Nome da sala</label>
              <input
                className="w-full px-3 py-1.5 rounded-lg bg-primary text-gray border-1 border-secondary"
                value={name}
                readOnly
              />
            </div>
          </div>
          {/* Layout principal: opções à esquerda, preview à direita */}
          <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            {/* Opções à esquerda */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">
              <div>
                <label className="block text-white mb-1">Tipo de Som</label>
                <Select value={soundType} disabled>
                  <SelectTrigger className="w-[180px] bg-primary text-gray border-1 border-secondary cursor-not-allowed">
                    <SelectValue placeholder="Seleciona o tipo de som" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipo de Som</SelectLabel>
                      {SOUND_TYPES.map((t) => (
                        <SelectItem
                          className={"cursor-not-allowed"}
                          key={t}
                          value={t}
                        >
                          {t}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-white mb-1">Tipo de Vídeo</label>
                <Select value={videoType} disabled>
                  <SelectTrigger className="w-[180px] bg-primary text-gray border-1 border-secondary cursor-not-allowed">
                    <SelectValue placeholder="Seleciona o tipo de vídeo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipo de Vídeo</SelectLabel>
                      {VIDEO_TYPES.map((t) => (
                        <SelectItem
                          className={"cursor-not-allowed"}
                          key={t}
                          value={t}
                        >
                          {t}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-white mb-1">Filas</label>
                <input
                  type="number"
                  className="w-20 px-3 py-2 rounded-lg bg-primary text-gray border-1 border-secondary"
                  value={rows}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-white mb-1">
                  Cadeiras por fila
                </label>
                <input
                  type="number"
                  className="w-20 px-3 py-2 rounded-lg bg-primary text-gray border-1 border-secondary"
                  value={cols}
                  readOnly
                />
              </div>
            </div>
            {/* Previsualização da sala à direita */}
            <div className="flex-1 flex justify-center items-start">
              <div
                className="bg-secondary rounded-xl shadow flex flex-col items-center justify-start"
                style={{
                  width: 500,
                  height: 400,
                  minWidth: 250,
                  minHeight: 250,
                  maxWidth: "100%",
                  maxHeight: 500,
                  margin: "0 auto",
                  padding: 16,
                  overflow: "hidden"
                }}
              >
                {/* Legenda */}
                <div className="flex gap-4 mb-5">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-5 h-5 rounded bg-quaternary" />
                    <span className="text-white text-xs">Normal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-5 h-5 rounded bg-senary" />
                    <span className="text-white text-xs">Acessível</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-5 h-5 rounded bg-white" />
                    <span className="text-white text-xs">Sem cadeira</span>
                  </div>
                </div>

                {/* Ecrã */}
                <div className="w-full flex justify-center mb-3 px-2">
                  <div className="bg-gray-300 rounded-t-lg h-5 w-full flex items-center justify-center">
                    <span className="text-xs text-gray-700 font-bold">
                      ECRÃ
                    </span>
                  </div>
                </div>

                {/* Grade de cadeiras com scroll */}
                <div
                  className="overflow-auto w-full h-full"
                  style={{ flex: 1, position: "relative" }}
                >
                  <div
                    className="inline-block"
                    style={{
                      minWidth: cols * 40 + 40, // espaço para colunas + letras
                      minHeight: rows * 40 + 30
                    }}
                  >
                    {/* Mapa de cadeiras */}
                    <div className="overflow-auto w-full h-full flex justify-center">
                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: `40px repeat(${cols}, 1fr)`, // 1fr para cadeiras esticarem
                          minWidth: cols * 42 + 40, // largura mínima baseada na quantidade de colunas + espaço do label da linha
                          maxWidth: "100%"
                        }}
                      >
                        {/* Cabeçalho de colunas */}
                        <div /> {/* canto vazio */}
                        {Array.from({ length: cols }).map((_, colIdx) => (
                          <div
                            key={`header-${colIdx}`}
                            className="text-center text-xs text-white font-bold"
                          >
                            {colIdx + 1}
                          </div>
                        ))}
                        {/* Mapa de cadeiras */}
                        {seats.map((row, rowIdx) => (
                          <React.Fragment key={rowIdx}>
                            {/* Letra da linha */}
                            <div className="text-xs text-white font-bold flex items-center justify-center">
                              {String.fromCharCode(65 + rowIdx)}
                            </div>
                            {row.map((seat, colIdx) => (
                              <div
                                key={colIdx}
                                className={`flex items-center justify-center w-full max-w-[42px] h-8 rounded ${
                                  seat === 1
                                    ? "bg-senary"
                                    : seat === 0
                                    ? "bg-quaternary"
                                    : "bg-white"
                                }`}
                              />
                            ))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRoomPage;
