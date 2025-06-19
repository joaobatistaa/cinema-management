"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import toast from "react-hot-toast";

export default function AccountsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Handler para abrir modal de edição
  function handleEditUser(user) {
    setEditUser(user);
    setEditName(user.name || "");
    setEditRole(user.role || "");
    setEditSalario(user.salario || "");
    setShowEditModal(true);
  }

  // Handler para reativar utilizador
  async function handleReactivateUser(userToReactivate) {
    if (!window.confirm("Deseja reativar este utilizador?")) return;
    
    try {
      const res = await fetch("/api/users/list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userToReactivate.id,
          updates: { active: 1, desc: "" },
          userId: user.id,
          userName: user.name
        })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          toast.error("Já existe uma conta ativa com este email. Não é possível reativar.");
          return;
        }
        throw new Error(data.message || "Erro ao reativar utilizador.");
      }
      
      toast.success("Utilizador reativado com sucesso.");
      setUsers((users) => users.map((u) => u.id === userToReactivate.id ? { ...u, active: 1, desc: "" } : u));
    } catch (err) {
      toast.error(err.message || "Erro ao reativar utilizador.");
    }
  }

  // Handler para eliminar utilizador
  async function handleDeleteUser(victim) {
    if (!window.confirm("Tem a certeza que pretende eliminar este utilizador?")) return;
    if (victim === undefined) {
      toast.error("Aguarde, sessão a carregar.");
      return;
    }
    if (!victim || !victim.id || !victim.name) {
      toast.error("Sessão não autenticada. Por favor volte a entrar.");
      return;
    }
    try {
      const res = await fetch("/api/users/list", {
        method: "DELETE",
        body: JSON.stringify({ id: victim.id, updates: { active: 0, desc: "deleted" }, userId: user.id, userName: user.name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao eliminar utilizador.");
      }
      setUsers((users) => users.map((u) => u.id === victim.id ? { ...u, active: 0, desc: "deleted" } : u));
      toast.success("Utilizador eliminado com sucesso.");
    } catch (err) {
      toast.error(err.message || "Erro ao eliminar utilizador.");
    }
  }

  async function handleConfirmEditUser(e) {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    // Validação salário: até 4 algarismos
    if (editRole === "employee" && editSalario && (!/^\d{1,4}$/.test(editSalario) || Number(editSalario) > 9999)) {
      toast.error("O salário deve ter no máximo 4 algarismos.");
      return;
    }
    if (editRole === "customer" && editSalario && editSalario !== "") {
      toast.error("Um cliente não pode ter salário.");
      return;
    }
    setLoadingEdit(true);
    if (user === undefined) {
      toast.error("Aguarde, sessão a carregar.");
      return;
    }
    if (!user || !user.id || !user.name) {
      toast.error("Sessão não autenticada. Por favor volte a entrar.");
      return;
    }
    try {
      // Só permitir alteração de role para contas admin/employee, e apenas para 'admin' ou 'employee'
      let updates = { name: editName.trim() };
      if (editUser.role === "admin" || editUser.role === "employee") {
        if (["admin", "employee"].includes(editRole)) {
          updates.role = editRole;
        } else {
          // Se tentar mudar para outro valor, manter o role original
          updates.role = editUser.role;
        }
      } else {
        // Se for customer, nunca permitir alteração do role
        updates.role = editUser.role;
      }
      if (updates.role === "employee") {
        updates.salario = editSalario || null;
      } else {
        updates.salario = null;
      }
      const body = JSON.stringify({ id: editUser.id, updates, userId: user.id, userName: user.name });
      const res = await fetch("/api/users/list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
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

  const userRole = user?.role || "guest";
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [editName, setEditName] = useState("");
  const [editSalario, setEditSalario] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const editNameRef = React.useRef(null);

  // Estado para novo utilizador
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    nif: "",
    salario: "",
    role: "customer"
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingNewUser, setLoadingNewUser] = useState(false);

  async function handleConfirmAddUser(e) {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim() || !newUser.role) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    // Se for employee logado, força role para customer e salario null
    if (user.role === "employee") {
      newUser.role = "customer";
      newUser.salario = null;
    }
    // Definir roleToSend antes das validações
    const roleToSend = newUser.salario && newUser.salario !== "" ? "employee" : newUser.role;
    if (!confirmPassword.trim()) {
      toast.error("Confirme a password.");
      return;
    }
    if (newUser.password !== confirmPassword) {
      toast.error("As passwords não coincidem.");
      return;
    }
    // NIF obrigatório para employee
    if (roleToSend === "employee") {
      if (!newUser.nif || !/^\d{9}$/.test(newUser.nif)) {
        toast.error("O NIF é obrigatório e deve ter 9 dígitos para funcionários.");
        return;
      }
    } else if (newUser.nif && !/^\d{9}$/.test(newUser.nif)) {
      toast.error("NIF inválido. Deve ter 9 dígitos.");
      return;
    }
    // Validação salário: até 4 algarismos
    if (newUser.salario && (!/^\d{1,4}$/.test(newUser.salario) || Number(newUser.salario) > 9999)) {
      toast.error("O salário deve ter no máximo 4 algarismos.");
      return;
    }
    setLoadingNewUser(true);
    if (user === undefined) {
      toast.error("Aguarde, sessão a carregar.");
      return;
    }
    if (!user || !user.id || !user.name) {
      toast.error("Sessão não autenticada. Por favor volte a entrar.");
      return;
    }
    try {
      // Se salário está preenchido, força role para 'employee'
      const roleToSend = newUser.salario && newUser.salario !== "" ? "employee" : newUser.role;
      const res = await fetch("/api/users/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id.toString(),
          "x-user-name": user.name
        },
        body: JSON.stringify({
          name: newUser.name.trim(),
          email: newUser.email.trim(),
          password: newUser.password,
          nif: newUser.nif || null,
          salario: newUser.salario || null,
          role: roleToSend,
          active: 1,
          desc: "needs to set new password",
          actor: { id: user.id, name: user.name }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar utilizador.");
      toast.success("Utilizador criado com sucesso!");
      setShowNewUserModal(false);
      setNewUser({ name: "", email: "", password: "", nif: "", salario: "", role: "customer" });
      setConfirmPassword("");
      const response = await fetch("/api/users/list");
      if (response.ok) setUsers(await response.json());
    } catch (err) {
      toast.error(err.message || "Erro ao criar utilizador.");
    } finally {
      setLoadingNewUser(false);
    }
  }

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
    <>
      <div className="relative w-full">
        <div className="h-full w-full flex flex-col">
          <div className="relative w-full flex-1 flex flex-col">
            <div className="px-8 pt-6 pb-2 relative">
              <div className="w-full flex items-center justify-between gap-4 relative">
                <button
                  className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
                  onClick={() => router.back()}
                >
                  VOLTAR
                </button>
                <h1 className="absolute left-1/2 -translate-x-1/2 text-5xl font-semibold text-white text-center tracking-wider pointer-events-none select-none">
                  Contas
                </h1>
                <button
                  className="bg-quaternary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
                  onClick={() => {
                    setShowNewUserModal(true);
                  }}
                >
                  Novo Utilizador
                </button>
              </div>
            </div>
            {/* Input de pesquisa com ícone de lupa (bem afastado da barra, colado à tabela) */}
            <div className="w-full flex justify-start mt-12 px-8">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Nome, email, função, estado"
                  className="pl-10 pr-4 py-2 rounded border border-gray-400 bg-transparent text-white focus:outline-none w-72 text-base"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <span className="text-white">Carregando...</span>
              </div>
            ) : (
              <div className="overflow-x-auto px-8 pb-8 mt-6">
                <table className="min-w-full bg-[#232336] rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-[#1f1f2e] text-white">
                      <th className="py-2 px-2 text-left text-sm">ID</th>
                      <th className="py-2 px-2 text-left text-sm">Nome</th>
                      <th className="py-2 px-2 text-left text-sm">Email</th>
                      <th className="py-2 px-2 text-left text-sm">Função</th>
                      <th className="py-2 px-2 text-left text-sm">Salário</th>
                      <th className="py-2 px-2 text-left text-sm">Ativo</th>
                      <th className="py-2 px-2 text-left text-sm">Descrição</th>
                      <th className="py-2 px-2 text-left text-sm">Editar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((rowUser) => {
                        const term = searchTerm.trim().toLowerCase();
                        if (!term) return true;
                        const name = rowUser.name?.toLowerCase() || "";
                        const email = rowUser.email?.toLowerCase() || "";
                        const role = (rowUser.role || "").toLowerCase();
                        // Corrigir costumer/customer
                        const roleNorm = role === "costumer" ? "customer" : role;
                        // Estado
                        const estado = rowUser.active ? "sim" : "não";
                        // Pesquisa múltiplos termos
                        return term.split(" ").every(t =>
                          name.includes(t) ||
                          email.includes(t) ||
                          roleNorm.includes(t) ||
                          estado.includes(t)
                        );
                      })
                      .map((rowUser) => (
                        <tr
                          key={rowUser.id}
                          className="border-b border-[#282846] text-white hover:bg-[#282846] transition text-sm"
                        >
                          <td className="py-1 px-2 text-sm">{rowUser.id}</td>
                          <td className="py-1 px-2 text-sm">{rowUser.name}</td>
                          <td className="py-1 px-2 text-sm">{rowUser.email}</td>
                          <td className="py-1 px-2 text-sm">{rowUser.role}</td>
                          <td className="py-1 px-2 text-sm">{rowUser.salario ? rowUser.salario : "-"}</td>
                          <td className="py-1 px-2 text-sm">{rowUser.active ? "Sim" : "Não"}</td>
                          <td className="py-1 px-2 text-sm">{rowUser.desc || ""}</td>
                          <td className="py-1 px-2 text-sm">
                            {user && user.role !== "employee" && user.email !== rowUser.email ? (
                              <div className="flex gap-2">
                                {/* Botão de reativar */}
                                {rowUser.active === 0 && rowUser.desc === "deleted" && (
                                  <button
                                    title="Reativar utilizador"
                                    className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-1 cursor-pointer"
                                    onClick={() => handleReactivateUser(rowUser)}
                                    tabIndex={-1}
                                  >
                                    {/* Ícone de reativar */}
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                      <path d="M4 4v5h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                      <path d="M20 20v-5h-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                      <path d="M5 19a9 9 0 1 0-1-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
                                    </svg>
                                  </button>
                                )}
                                {/* Botão de editar */}
                                {rowUser.active !== 0 && (
                                  <button
                                    title="Editar utilizador"
                                    className="bg-blue-500 hover:bg-blue-600 rounded-full p-1 cursor-pointer"
                                    onClick={() => handleEditUser(rowUser)}
                                    tabIndex={-1}
                                  >
                                    {/* Ícone de editar */}
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                      <path d="M4 21h17" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                      <path d="M17.7 6.29a1 1 0 0 1 0 1.41l-9.3 9.3-3.4.7.7-3.4 9.3-9.3a1 1 0 0 1 1.41 0l1.29 1.29a1 1 0 0 1 0 1.41z" stroke="#fff" strokeWidth="2" />
                                    </svg>
                                  </button>
                                )}
                                {/* Botão de eliminar */}
                                {rowUser.active !== 0 && (
                                  <button
                                    title="Eliminar utilizador"
                                    className="bg-red-500 hover:bg-red-600 rounded-full p-1 cursor-pointer"
                                    onClick={() => handleDeleteUser(rowUser)}
                                    tabIndex={-1}
                                  >
                                    {/* Ícone de eliminar */}
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                      <path d="M3 6h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#fff" strokeWidth="2" />
                                      <rect x="5" y="6" width="14" height="14" rx="2" stroke="#fff" strokeWidth="2" />
                                      <path d="M10 11v6M14 11v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Botão de auditoria para admins, canto inferior direito do cartão principal */}
            {user && user.role === "admin" && (
              <div className="flex justify-end items-end w-full mt-8 pr-8">
                <button
                  className="bg-quaternary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer"
                  onClick={() => router.push("/audit-log")}
                >
                  Registo de Auditoria
                </button>
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
                    className="w-full px-4 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nome"
                    maxLength={50}
                    required
                    autoFocus
                    disabled={loadingEdit}
                  />
                </div>
                {(editUser.role === "admin" || editUser.role === "employee") && (
                  <div className="mb-6">
                    <label className="block text-white mb-2">Role</label>
                    <select
                      className="w-full px-4 py-2 rounded border border-gray-400 text-white bg-[#181827] focus:outline-none"
                      value={editRole}
                      onChange={e => setEditRole(e.target.value)}
                      required
                      disabled={loadingEdit}
                    >
                      <option value="admin">admin</option>
                      <option value="employee">employee</option>
                    </select>
                  </div>
                )}
                {editRole === "employee" && (
                  <div className="mb-6">
                    <label className="block text-white mb-2">Salário</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 rounded border border-gray-400 text-white bg-[#181827] focus:outline-none"
                      value={editSalario}
                      onChange={e => {
                        const v = e.target.value;
                        if (v.length <= 4) setEditSalario(v);
                      }}
                      placeholder="Salário"
                      min="0"
                      max="9999"
                      maxLength={4}
                      disabled={loadingEdit}
                    />
                  </div>
                )}
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
          {/* Novo Utilizador Modal */}
          {showNewUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <form
                className="bg-[#232336] rounded-lg p-8 w-full max-w-md shadow-lg relative"
                onSubmit={handleConfirmAddUser}
              >
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">Novo Utilizador</h2>
                <div className="mb-4">
                  <label className="block text-white mb-2">Nome</label>
                  <input
                    className="w-full px-4 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={newUser.name}
                    onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
                    placeholder="Nome"
                    maxLength={50}
                    required
                    disabled={loadingNewUser}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={newUser.email}
                    onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
                    placeholder="Email"
                    required
                    disabled={loadingNewUser}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={newUser.password}
                    onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                    placeholder="Password"
                    minLength={6}
                    required
                    disabled={loadingNewUser}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">Confirmar Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar Password"
                    minLength={6}
                    required
                    disabled={loadingNewUser}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">NIF</label>
                  <input
                    className="w-full px-4 py-2 rounded border border-gray-400 bg-transparent text-white"
                    value={newUser.nif}
                    onChange={(e) => setNewUser((u) => ({ ...u, nif: e.target.value }))}
                    placeholder="NIF (obrigatório para funcionários)"
                    i maxLength={9}
                    disabled={loadingNewUser}
                  />
                </div>
                {/* Campo salário só aparece se não for employee criando e se o tipo não for customer */}
                {user.role !== "employee" && newUser.role === "employee" && (
                  <div className="mb-4">
                    <label className="block text-white mb-2">Salário</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 rounded border border-gray-400 text-white bg-[#181827] focus:outline-none"
                      value={newUser.salario}
                      onChange={(e) => setNewUser((u) => ({ ...u, salario: e.target.value }))}
                      placeholder="Salário"
                      max={9999}
                      disabled={loadingNewUser}
                    />
                  </div>
                )}
                <div className="mb-6">
                  <label className="block text-white mb-2">Role</label>
                  {/* Se o user logado for employee, só pode criar customer */}
                  {user.role === "employee" ? (
                    <select
                      className="w-full px-4 py-2 rounded border border-gray-400 text-white bg-[#181827] focus:outline-none"
                      value="customer"
                      disabled
                    >
                      <option value="customer">customer</option>
                    </select>
                  ) : newUser.salario && newUser.salario !== "" ? (
                    <select
                      className="w-full px-4 py-2 rounded border border-gray-400 text-white bg-[#181827] focus:outline-none"
                      value="employee"
                      disabled
                    >
                      <option value="employee">employee</option>
                    </select>
                  ) : (
                    <select
                      className="w-full px-4 py-2 rounded border border-gray-400 text-white bg-[#181827] focus:outline-none"
                      value={newUser.role}
                      onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
                      required
                      disabled={loadingNewUser}
                    >
                      <option value="admin">admin</option>
                      <option value="employee">employee</option>
                      <option value="customer">customer</option>
                    </select>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="bg-quinary text-lg text-white px-6 py-3 rounded font-medium cursor-pointer hover:bg-quaternary transition"
                    onClick={() => setShowNewUserModal(false)}
                    disabled={loadingNewUser}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded bg-quaternary text-white font-medium hover:bg-quinary transition cursor-pointer"
                    disabled={loadingNewUser}
                  >
                    {loadingNewUser ? "A criar..." : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

