"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
    // ...
    async function updateProfile(e) {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await fetch("/api/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-email": user.email
                },
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                    nif: profile.nif
                })
            });
            if (!res.ok) throw new Error("Erro ao atualizar perfil.");
            // Se o email mudou, o backend devolve o novo email e active=0
            const updated = await res.json();
            if (updated.active === 0 && updated.desc === "user changed email") {
                toast.success("Foi enviado um email de confirmação. A sua sessão irá terminar.");
                setTimeout(() => {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem("user");
                    }
                    if (typeof window !== 'undefined') {
                        window.location.href = "/login";
                    }
                }, 3500);
                return;
            }
            toast.success("Perfil atualizado com sucesso!");
        } catch (err) {
            toast.error(err.message || "Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    }
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Só clientes podem aceder
        if (!user || user.role !== "customer") {
            router.replace("/");
            return;
        }
        async function fetchProfile() {
            try {
                setLoading(true);
                const res = await fetch("/api/users/profile", {
                    headers: {
                        "x-user-email": user.email
                    }
                });
                if (!res.ok) throw new Error("Erro ao carregar perfil.");
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                toast.error(err.message || "Erro ao carregar perfil.");
                router.replace("/");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [user, router]);

    if (loading) return <div className="flex justify-center items-center h-full text-2xl">A carregar...</div>;
    if (!profile) return null;

    return (
        <div className="h-full w-full flex flex-col">
            <div className="relative w-full flex-1 flex flex-col">
                {/* Botão de transações no canto superior direito */}
                {user && (
                    <button
                        className="absolute top-8 right-8 bg-quaternary hover:bg-quinary text-white px-6 py-3 rounded-lg shadow text-lg font-semibold z-20 transition cursor-pointer"
                        onClick={() => router.push("/transactions")}
                    >
                        Transações
                    </button>
                )}
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
                            Perfil
                        </h1>
                    </div>
                </div>
                {/* Conteúdo principal */}
                <div className="flex-1 flex flex-col items-center justify-start mt-25">
                    <div className="w-full max-w-xl bg-[#232336] rounded-lg p-8 text-white shadow flex flex-col items-center">
                        <form
                            className="space-y-6 w-full text-lg"
                            onSubmit={updateProfile}
                        >
                            <div className="flex justify-between w-full items-center gap-2">
                                <label className="font-semibold text-white min-w-[80px]" htmlFor="name">Nome:</label>
                                <input
                                    id="name"
                                    className="bg-[#232336] border border-gray-500 rounded px-3 py-2 text-white flex-1 focus:outline-none focus:ring-2 focus:ring-quinary"
                                    type="text"
                                    value={profile.name}
                                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex justify-between w-full items-center gap-2">
                                <label className="font-semibold text-white min-w-[80px]" htmlFor="email">Email:</label>
                                <input
                                    id="email"
                                    className="bg-[#232336] border border-gray-500 rounded px-3 py-2 text-white flex-1 focus:outline-none focus:ring-2 focus:ring-quinary"
                                    type="email"
                                    value={profile.email}
                                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex justify-between w-full items-center gap-2">
                                <label className="font-semibold text-white min-w-[80px]" htmlFor="nif">NIF:</label>
                                <input
                                    id="nif"
                                    className="bg-[#232336] border border-gray-500 rounded px-3 py-2 text-white flex-1 focus:outline-none focus:ring-2 focus:ring-quinary"
                                    type="text"
                                    value={profile.nif || ""}
                                    onChange={e => setProfile(p => ({ ...p, nif: e.target.value }))}
                                    pattern="\d{9}"
                                    maxLength={9}
                                    placeholder="Opcional"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-quaternary hover:bg-quinary text-white font-bold px-8 py-2 rounded-lg cursor-pointer mt-6 w-full transition"
                                disabled={loading}
                            >
                                Guardar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
