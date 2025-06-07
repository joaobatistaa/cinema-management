"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function EditTicketPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    movie_id: "",
    session_id: "",
    room_id: "",
    client_id: "",
    seat_row: "",
    seat_col: "",
    datetime: ""
  });

  useEffect(() => {
    async function fetchTicket() {
      setLoading(true);
      const res = await fetch(`/api/tickets`);
      if (res.ok) {
        const tickets = await res.json();
        const t = tickets.find((t) => String(t.id) === String(id));
        setTicket(t);
        if (t) {
          setForm({
            movie_id: t.movie_id,
            session_id: t.session_id,
            room_id: t.room_id,
            client_id: t.client_id,
            seat_row: t.seat?.row,
            seat_col: t.seat?.col,
            datetime: t.datetime
          });
        }
      }
      setLoading(false);
    }
    fetchTicket();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    // Aqui deveria chamar uma rota PUT/PATCH para atualizar o bilhete
    toast.success("Bilhete atualizado (mock)");
    router.replace(`/tickets/${id}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-quinary mb-4"></div>
        <span className="text-white text-lg font-semibold">
          A carregar bilhete...
        </span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-white text-lg font-semibold">
          Bilhete não encontrado.
        </span>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative w-full flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          ✏️ Editar Bilhete #{ticket.id}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-white mb-1">Filme</label>
            <input
              className="w-full px-3 py-2 rounded border border-white bg-transparent text-white"
              value={form.movie_id}
              onChange={(e) => setForm({ ...form, movie_id: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Sessão</label>
            <input
              className="w-full px-3 py-2 rounded border border-white bg-transparent text-white"
              value={form.session_id}
              onChange={(e) => setForm({ ...form, session_id: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Sala</label>
            <input
              className="w-full px-3 py-2 rounded border border-white bg-transparent text-white"
              value={form.room_id}
              onChange={(e) => setForm({ ...form, room_id: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Cliente</label>
            <input
              className="w-full px-3 py-2 rounded border border-white bg-transparent text-white"
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-white mb-1">Fila</label>
              <input
                className="w-full px-3 py-2 rounded border border-white bg-transparent text-white"
                value={form.seat_row}
                onChange={(e) => setForm({ ...form, seat_row: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-white mb-1">Lugar</label>
              <input
                className="w-full px-3 py-2 rounded border border-white bg-transparent text-white"
                value={form.seat_col}
                onChange={(e) => setForm({ ...form, seat_col: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-white mb-1">Data e Hora</label>
            <input
              className="w-full px-3 py-2 rounded border border-white bg-transparent text-white"
              value={form.datetime}
              onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              type="datetime-local"
              required
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="bg-quinary text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
            <button
              type="button"
              className="bg-quaternary text-white px-4 py-2 rounded"
              onClick={() => router.replace(`/tickets/${id}`)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
