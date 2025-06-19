"use client";

import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "@/src/contexts/AuthContext";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nif, setNif] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As passwords não coincidem");
      return;
    }
    // Validação do NIF (opcional, mas se existir tem de ser válido)
    if (nif && !/^\d{9}$/.test(nif)) {
      toast.error("NIF inválido. Deve ter 9 dígitos.");
      return;
    }
    // Validação da password: mínimo 8 caracteres, pelo menos uma letra e um caracter especial
    if (
      !/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).*$/.test(password)
    ) {
      toast.error("A password deve ter pelo menos 8 caracteres, uma letra e um caracter especial.");
      return;
    }

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, nif: nif || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar conta");
        return;
      }
      toast.success("Conta criada com sucesso, inicia sessão!");
      router.push("/login");
    } catch {
      toast.error("Erro ao criar conta");
    }
  }

  return (
    <>
      <button
        onClick={() => router.push("/")}
        aria-label="Home"
        className="m-3 p-2 rounded-lg hover:bg-gray-200/20 transition cursor-pointer"
      >
        <HomeIcon style={{ color: "white", fontSize: 32 }} />
      </button>
      <div className="flex flex-col items-center justify-start">
        <h2 className="text-[40px] font-bold text-center text-white tracking-wider">
          CRIAR CONTA
        </h2>
        <div className="w-full max-w-md">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white"
              >
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="O seu nome"
                className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
                value={name}
                onChange={e => setName(e.target.value.slice(0, 25))}
                required
                maxLength={25}
              />
            </div>
            <div>
              <label className="block text-white mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
                value={email}
                onChange={e => setEmail(e.target.value.slice(0, 25))}
                required
                maxLength={25}
              />
            </div>
            <div>
              <label className="block text-white mb-1">NIF (opcional, 9 dígitos)</label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
                value={nif}
                onChange={e => setNif(e.target.value.replace(/\D/g, "").slice(0, 9))}
                maxLength={9}
                pattern="\d{9}"
                inputMode="numeric"
                placeholder="NIF"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="********"
                className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-white"
              >
                Confirmar Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="********"
                className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-quaternary hover:bg-red-900  text-sm font-bold tracking-wider text-white rounded-lg mt-5 cursor-pointer"
            >
              CRIAR CONTA
            </button>
          </form>
          <p className="text-center text-sm text-white mt-4">
            Já tens uma conta?{" "}
            <a href="/login" className="text-secondary hover:gray-200">
              Iniciar Sessão
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
