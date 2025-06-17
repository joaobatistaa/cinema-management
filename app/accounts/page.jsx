"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import toast from "react-hot-toast";

export default function AccountsPage() {
  // ...
  async function handleConfirmEditUser(e) {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    setLoadingEdit(true);
    try {
      const res = await fetch("/api/users/list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editUser.id, updates: { name: editName.trim(), role: editRole } }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao atualizar utilizador.");
      }
      const updated = await res.json();
      setUsers((users) => users.map((u) => u.id === updated.id ? updated : u));
      toast.success("Utilizador atualizado com sucesso!");
      setShowEditModal(false);
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar utilizador.");
    } finally {
      setLoadingEdit(false);
    }
  }
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role || "guest";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [editName, setEditName] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const editNameRef = React.useRef(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch("/api/users/list");
        if (!response.ok) throw new Error("Erro ao carregar utilizadores.");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast.error(error.message || "Erro ao carregar utilizadores.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative w-full flex-1 flex flex-col">
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
              Contas
            </h1>
          </div>
          <div className="flex justify-end">
            <button
              className="bg-quaternary text-lg text-white px-6 py-3 rounded font-medium ml-auto cursor-pointer"
              onClick={() => {
                // abrir modal/criar utilizador
              }}
            >
              NOVO UTILIZADOR
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <span className="text-white">Carregando...</span>
          </div>
        ) : (
          <div className="overflow-x-auto px-8 pb-8 mt-10">
            <table className="min-w-full bg-[#232336] rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#1f1f2e] text-white">
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Nome</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Função</th>
                  <th className="py-3 px-4 text-left">Ativo</th>
                  <th className="py-3 px-4 text-left">Descrição</th>
                  <th className="py-3 px-4 text-left">Editar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((rowUser) => (
                  <tr
                    key={rowUser.id}
                    className="border-b border-[#282846] text-white hover:bg-[#282846] transition"
                  >
                    <td className="py-2 px-4">{rowUser.id}</td>
                    <td className="py-2 px-4">{rowUser.name}</td>
                    <td className="py-2 px-4">{rowUser.email}</td>
                    <td className="py-2 px-4">{rowUser.role}</td>
                    <td className="py-2 px-4">{rowUser.active ? "Sim" : "Não"}</td>
                    <td className="py-2 px-4">{rowUser.desc || ""}</td>
                     <td className="py-2 px-4">
                      {user && user.email !== rowUser.email && (
                        <button
                          title="Editar utilizador"
                          className="bg-blue-600 hover:bg-blue-700 rounded-full p-1 cursor-pointer"
                          onClick={() => {
                            if (userRole === "admin") {
                              setEditUser(user);
                              setEditRole(user.role);
                              setEditName(user.name);
                              setShowEditModal(true);
                              setTimeout(() => {
                                if (editNameRef.current) editNameRef.current.focus();
                              }, 100);
                            }
                          }}
                          tabIndex={-1}
                          type="button"
                        >
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M4 21h17"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M17.7 6.29a1 1 0 0 1 0 1.41l-9.3 9.3-3.4.7.7-3.4 9.3-9.3a1 1 0 0 1 1.41 0l1.29 1.29a1 1 0 0 1 0 1.41z"
                              stroke="#fff"
                              strokeWidth="2"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <form
            className="bg-[#232336] rounded-lg p-8 w-full max-w-md shadow-lg relative"
            onSubmit={handleConfirmEditUser}
          >
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Editar Utilizador
            </h2>
            <div className="mb-4">
              <label className="block text-white mb-2">Nome</label>
              <input
                ref={editNameRef}
                className="w-full px-4 py-2 rounded bg-[#181827] text-white border border-[#343454] focus:outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome"
                maxLength={50}
                required
                autoFocus
                disabled={loadingEdit}
              />
            </div>
            <div className="mb-6">
              <label className="block text-white mb-2">Role</label>
              <select
                className="w-full px-4 py-2 rounded bg-[#181827] text-white border border-[#343454] focus:outline-none"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                required
                disabled={loadingEdit}
              >
                <option value="admin">admin</option>
                <option value="employee">employee</option>
                <option value="customer">customer</option>
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button
              type="button"
              className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer hover:bg-quaternary transition"
              onClick={() => setShowEditModal(false)}
              disabled={loadingEdit}
            >
              Cancelar
            </button>
              <button
                type="submit"
                className="px-6 py-2 rounded bg-quaternary text-white font-medium hover:bg-quinary transition cursor-pointer"
                disabled={loadingEdit}
              >
                {loadingEdit ? "A guardar..." : "Guardar"}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
