"use client";

import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "@/src/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
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

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
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
        <h2 className="text-[50px] font-bold text-center text-white tracking-wider mb-8">
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
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="email@email.com"
                className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
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
