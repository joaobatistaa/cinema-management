"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import roomsData from "@/src/data/rooms.json";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import { useAuth } from "@/src/contexts/AuthContext";

const ITEMS_PER_PAGE = 11;

export default function RoomsManagement() {
  const router = useRouter();
  const { pageLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState([]);
  
  const getActorInfo = () => ({
    actorId: JSON.parse(localStorage.getItem('user'))?.id || 0,
    actorName: JSON.parse(localStorage.getItem('user'))?.name || 'guest'
  });

  const totalPages = Math.ceil(roomsData.length / ITEMS_PER_PAGE);

  const pagedRooms = roomsData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const cards = [...pagedRooms];
  cards.push("add");

  while (cards.length < ITEMS_PER_PAGE - 1) {
    cards.push(null);
  }

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) return;
        const data = await res.json();
        setSessions(data);
      } catch {}
    }
    fetchSessions();
  }, []);

  async function handleDeleteRoom(roomId) {
    try {
      setSaving(true);
      // Primeiro, verifica se há bilhetes futuros associados (sem eliminar ainda)
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: { "X-Check-Only": "1" } // header custom para indicar só verificação
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao eliminar a sala.");
        return;
      }
      // Se não houver erro, pede confirmação ao utilizador
      if (!window.confirm("Tem a certeza que pretende eliminar esta sala?")) {
        return;
      }
      // Agora sim, faz o pedido real de eliminação
      const { actorId, actorName } = getActorInfo();
      const resDelete = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId, actorName })
      });
      const dataDelete = await resDelete.json();
      if (!resDelete.ok) {
        toast.error(dataDelete.error || "Erro ao eliminar a sala.");
        return;
      }
      toast.success("Sala eliminada com sucesso.");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Erro ao eliminar a sala.");
    } finally {
      setSaving(false);
    }
  }

  if (saving) {
    return (
      <div className="flex flex-1 items-center justify-center h-full w-full">
        <CircularProgress color="error" size={100} />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative w-full flex-1 flex flex-col">
        <div className="flex flex-col px-8 pt-6 w-full mb-4">
          <div className="flex items-center w-full">
            <div className="w-40 flex-shrink-0">
              <button
                className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
                onClick={() => router.replace("/home")}
              >
                VOLTAR
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <h1 className="text-4xl font-semibold text-white text-center tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                GESTÃO DAS SALAS
              </h1>
            </div>
            <div className="w-40 flex-shrink-0" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 px-8 mt-6">
          {cards.map((room, idx) => {
            if (room === "add") {
              return (
                <button
                  key="add-button"
                  className="bg-primary border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center h-35 w-full max-w-xs mx-auto text-white text-4xl font-bold cursor-pointer"
                  onClick={() => {
                    router.push("/rooms/new");
                  }}
                >
                  <AddIcon fontSize="inherit" />
                </button>
              );
            } else if (room) {
              return (
                <div
                  key={room.id}
                  className="bg-secondary rounded-xl flex flex-col justify-between h-35 w-full max-w-xs mx-auto text-primary text-xl font-semibold p-4"
                >
                  <span className="text-white text-lg text-center">
                    {room.name}
                  </span>
                  <div className="flex justify-center gap-2 mt-auto">
                    <button
                      className="bg-info text-white py-1 px-3 rounded-md cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/rooms/view/${room.id}`);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                    <button
                      className="bg-quinary text-white py-1 px-3 rounded-md cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/rooms/edit/${room.id}`);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      className="bg-quaternary text-white py-1 px-3 rounded-md cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoom(room.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              );
            }
          })}
        </div>

        <div className="flex justify-center mt-10 items-center space-x-2">
          <button
            className="px-3 py-3 rounded bg-secondary text-white disabled:opacity-50 cursor-pointer flex items-center justify-center"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ArrowBackIosNewIcon fontSize="extrasmall" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                className={`px-5 py-2 rounded ${
                  pageNumber === page
                    ? "bg-quinary text-white"
                    : "bg-secondary text-white"
                } cursor-pointer`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            )
          )}
          <button
            className="px-3 py-3 rounded bg-secondary text-white disabled:opacity-50 cursor-pointer flex items-center justify-center"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ArrowForwardIosIcon fontSize="extrasmall" />
          </button>
        </div>
      </div>
    </div>
  );
}
