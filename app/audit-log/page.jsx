"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { exportAuditLogsToPDF } from "../../src/services/pdfExport";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    let user;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch {
      user = null;
    }
    if (!user || user.role !== "admin") {
      toast.error("Acesso restrito a administradores.");
      router.replace("/");
      return;
    }

    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await fetch("/api/audit");
        if (!res.ok) throw new Error("Erro ao obter registo de auditoria.");
        setLogs(await res.json());
      } catch (error) {
        toast.error(error.message || "Erro ao carregar registo de auditoria.");
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [router]);

  return (
    <div className="relative w-full">
      <div className="h-full w-full flex flex-col">
        <div className="relative w-full flex-1 flex flex-col">
          <div className="px-8 pt-6 pb-2 relative">
            <div className="w-full flex items-center justify-between gap-4 relative mb-4">
              <button
                className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
                onClick={() => router.back()}
              >
                VOLTAR
              </button>
              <h1 className="absolute left-1/2 -translate-x-1/2 text-3xl font-semibold text-white text-center tracking-wider pointer-events-none select-none">
                Registo de auditoria
              </h1>
              {logs.length > 0 && (
                <button
                  className="bg-quaternary hover:bg-quinary text-white px-6 py-2 rounded font-medium text-base shadow transition ml-auto cursor-pointer"
                  onClick={() => exportAuditLogsToPDF(logs)}
                  disabled={loading}
                >
                  Exportar PDF
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 text-xl">A carregar...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-lg">Sem registos de auditoria.</div>
            ) : (
              <div className="overflow-x-auto px-8 pb-8 mt-10">
                <table className="min-w-full bg-[#232336] rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-[#1f1f2e] text-white">
                      <th className="py-2 px-2 text-left text-sm">ID</th>
                      <th className="py-2 px-2 text-left text-sm">Utilizador</th>
                      <th className="py-2 px-2 text-left text-sm">ID Utilizador</th>
                      <th className="py-2 px-2 text-left text-sm">Descrição</th>
                      <th className="py-2 px-2 text-left text-sm">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-[#282846] text-white hover:bg-[#282846] transition text-sm"
                      >
                        <td className="py-1 px-2 text-sm">{log.id}</td>
                        <td className="py-1 px-2 text-sm">{log.userName}</td>
                        <td className="py-1 px-2 text-sm">{log.userID}</td>
                        <td className="py-1 px-2 text-sm">{log.description}</td>
                        <td className="py-1 px-2 text-sm">{new Date(log.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          
          </div>
        </div>
      </div>
    </div>
  );
}
