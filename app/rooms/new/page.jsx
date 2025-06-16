"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SaveIcon from "@mui/icons-material/Save";
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

export default function NewRoomPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [soundType, setSoundType] = useState(SOUND_TYPES[0]);
  const [videoType, setVideoType] = useState(VIDEO_TYPES[0]);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [seats, setSeats] = useState(
    Array.from({ length: 3 }, () =>
      Array.from({ length: 4 }, () => ({ type: "normal", status: 0 }))
    )
  );
  const [saving, setSaving] = useState(false);

  function handleRowsChange(e) {
    const value = Math.max(1, Number(e.target.value));
    setRows(value);
    setSeats((prev) => {
      const newSeats = [...prev];
      if (value > prev.length) {
        for (let i = prev.length; i < value; i++) {
          newSeats.push(
            Array.from({ length: cols }, () => ({ type: "normal", status: 0 }))
          );
        }
      } else {
        newSeats.length = value;
      }
      return newSeats;
    });
  }

  function handleColsChange(e) {
    const value = Math.max(1, Number(e.target.value));
    setCols(value);
    setSeats((prev) =>
      prev.map((row) => {
        const newRow = [...row];
        if (value > row.length) {
          for (let i = row.length; i < value; i++) {
            newRow.push({ type: "normal", status: 0 });
          }
        } else {
          newRow.length = value;
        }
        return newRow;
      })
    );
  }

  function handleSeatTypeChange(rowIdx, colIdx) {
    setSeats((prev) => {
      const newSeats = prev.map((row, r) =>
        row.map((seat, c) => {
          if (r === rowIdx && c === colIdx) {
            if (!seat) return { type: "normal", status: 0 };
            if (seat.type === "normal" && seat.status === 0)
              return { type: "accessibility", status: 0 };
            if (seat.type === "accessibility" && seat.status === 0) return null;
            if (seat === null) return { type: "normal", status: 0 };
            return { type: "normal", status: 0 };
          }
          return seat;
        })
      );
      return newSeats;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          soundType,
          videoType,
          seats
        })
      });

      const data = res.headers.get("Content-Type")?.includes("application/json")
        ? await res.json()
        : { message: "Erro ao criar sala" };

      if (!res.ok) throw new Error(data.message);

      router.replace("/rooms");
      toast.success("Sala criada com sucesso!");
    } catch (err) {
      toast.error(err.message || "Erro ao criar sala");
    } finally {
      setSaving(false);
    }
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
              NOVA SALA
            </h1>
          </div>
          <div className="w-40 flex-shrink-0" />
        </div>
        {saving ? (
          <div className="flex flex-1 items-center justify-center h-full w-full">
            <CircularProgress color="error" size={100} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-10">
            {/* Nome da sala */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-white mb-1">Nome da sala</label>
                <input
                  className="w-full px-3 py-1.5 rounded-lg bg-primary text-gray border-1 border-secondary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            {/* Layout principal: opções à esquerda, preview à direita */}
            <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
              {/* Opções à esquerda */}
              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <div>
                  <label className="block text-white mb-1">Tipo de Som</label>
                  <Select value={soundType} onValueChange={setSoundType}>
                    <SelectTrigger className="w-[180px] bg-primary text-gray border-1 border-secondary cursor-pointer">
                      <SelectValue placeholder="Seleciona o tipo de som" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tipo de Som</SelectLabel>
                        {SOUND_TYPES.map((t) => (
                          <SelectItem
                            className={"cursor-pointer"}
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
                  <Select value={videoType} onValueChange={setVideoType}>
                    <SelectTrigger className="w-[180px] bg-primary text-gray border-1 border-secondary cursor-pointer">
                      <SelectValue placeholder="Seleciona o tipo de vídeo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tipo de Vídeo</SelectLabel>
                        {VIDEO_TYPES.map((t) => (
                          <SelectItem
                            className={"cursor-pointer"}
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
                    min={1}
                    className="w-20 px-3 py-2 rounded-lg bg-primary text-gray border-1 border-secondary"
                    value={rows}
                    onChange={handleRowsChange}
                  />
                </div>
                <div>
                  <label className="block text-white mb-1">
                    Cadeiras por fila
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-20 px-3 py-2 rounded-lg bg-primary text-gray  border-1 border-secondary"
                    value={cols}
                    onChange={handleColsChange}
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
                              <div className="text-xs text-white font-bold flex items-center justify-center">
                                {String.fromCharCode(65 + rowIdx)}
                              </div>
                              {row.map((seat, colIdx) => (
                                <div
                                  key={colIdx}
                                  className="flex items-center justify-center"
                                >
                                  <button
                                    type="button"
                                    className={`cursor-pointer w-full max-w-[42px] h-8 rounded ${
                                      !seat
                                        ? "bg-white"
                                        : seat.type === "accessibility"
                                        ? "bg-senary"
                                        : "bg-quaternary"
                                    }`}
                                    title={`Linha ${String.fromCharCode(
                                      65 + rowIdx
                                    )}, Coluna ${colIdx + 1}`}
                                    onClick={() =>
                                      handleSeatTypeChange(rowIdx, colIdx)
                                    }
                                  />
                                </div>
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
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={saving}
                className="mt-2 bg-quaternary text-white px-40 py-2 rounded-lg font-bold flex items-center justify-center tracking-wider cursor-pointer"
              >
                <SaveIcon className="mr-2" />
                {saving ? "A GUARDAR..." : "CRIAR A SALA"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
