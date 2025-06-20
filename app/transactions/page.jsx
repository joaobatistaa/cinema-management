"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";

const ICONS = {
  calendar: "calendar.svg",
  clock: "clock.svg"
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT");
}
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

function getTypeAndColor(t) {
  if (t.desc === "Compra no Bar") {
    return { color: "text-red-400", sign: "-" };
  } else if (t.desc === "Compra de Bilhete") {
    return { color: "text-red-400", sign: "-" };
  } else {
    return { color: "text-green-400", sign: "+" };
  }
}

export default function Transactions() {
  const { user } = useAuth();
  const userId = user?.id;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const router = useRouter();

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        const filtered = userId ? data.filter((t) => t.userId === userId) : [];
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(filtered);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [userId]);

  const paginated = transactions.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="relative w-full flex-none">
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
              Transações
            </h1>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full flex flex-col items-center mt-20">
        {loading ? (
          <div className="text-white mt-8">A carregar...</div>
        ) : paginated.length === 0 ? (
          <div className="text-white mt-8">Sem transações.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-6">
            {paginated.map((t) => {
              const { color, sign } = getTypeAndColor(t);
              return (
                <div
                  key={t.id}
                  className="bg-[#292933] rounded-lg shadow-lg p-4 flex flex-col items-center min-h-[120px] w-full"
                  style={{ maxWidth: 220 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Image
                      src={ICONS.calendar}
                      alt="calendar"
                      width={15}
                      height={15}
                      style={{
                        filter:
                          "invert(62%) sepia(82%) saturate(749%) hue-rotate(359deg) brightness(101%) contrast(101%)"
                      }}
                    />
                    <span className="text-white font-bold text-base">
                      {formatDate(t.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Image
                      src={ICONS.clock}
                      alt="clock"
                      width={15}
                      height={15}
                      style={{
                        filter:
                          "invert(62%) sepia(82%) saturate(749%) hue-rotate(359deg) brightness(101%) contrast(101%)"
                      }}
                    />
                    <span className="text-white font-bold text-base">
                      {formatTime(t.date)}
                    </span>
                  </div>
                  <div className={`font-bold text-lg mb-1 ${color}`}>
                    {sign}
                    {Math.abs(Number(t.total)).toFixed(2)}€
                  </div>
                  <div className="text-white text-base text-center">
                    {t.desc || "Compra"}
                  </div>
                  <div className="text-white text-sm mt-2">
                    <span className="font-semibold">NIF: </span>
                    {t.nif ? t.nif : "Consumidor final"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex gap-2 mt-8 mb-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="bg-[#44444f] text-white px-3 py-1 rounded disabled:opacity-50"
            >
              &lt;
            </button>
            {[...Array(totalPages).keys()].map((n) => (
              <button
                key={n}
                onClick={() => setPage(n + 1)}
                className={`px-3 py-1 rounded font-bold ${
                  page === n + 1
                    ? "bg-white text-black"
                    : "bg-[#292933] text-white"
                }`}
              >
                {n + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="bg-[#44444f] text-white px-3 py-1 rounded disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
