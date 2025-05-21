"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import HomeIcon from "@mui/icons-material/Home";
import { useAuth } from "@/src/contexts/AuthContext";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Credenciais inválidas");
        setLoading(false);
        return;
      }
      login(data);
      router.push("/home");
    } catch {
      toast.error("Erro ao iniciar sessão");
    } finally {
      setLoading(false);
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
        <div className="w-full max-w-md bg-primary rounded-2xl shadow-xl items-center relative">
          <div className="pt-4 w-full flex flex-col items-center">
            <h2 className="text-[50px] font-bold text-center text-white tracking-wider mb-16">
              INICIAR SESSÃO
            </h2>
            <form className="space-y-5 w-full px-4" onSubmit={handleSubmit}>
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
                  disabled={loading}
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
                  disabled={loading}
                />
                <div className="mt-2 text-left">
                  <a
                    href="/forgot-password"
                    className="text-sm text-white hover:text-gray-200 transition"
                  >
                    Esqueceu-se da password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-quaternary hover:bg-red-900 text-sm font-bold tracking-wider text-white rounded-lg mt-5 cursor-pointer"
                disabled={loading}
              >
                {loading ? "A ENTRAR..." : "INICIAR SESSÃO"}
              </button>
            </form>
            <p className="text-center text-sm text-white mt-4">
              Ainda não tens uma conta?{" "}
              <a href="/register" className="text-secondary hover:gray-200">
                Criar Conta
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
