"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import HomeIcon from "@mui/icons-material/Home";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      toast.error("Insira o seu email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Email não encontrado.");
        setLoading(false);
        return;
      }
      toast.success("Se o email existir e estiver ativo, receberá instruções em breve.");
    } catch {
      toast.error("Erro ao processar pedido.");
    }
    setLoading(false);
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
      <div className="flex flex-col items-center justify-start mt-30">
        <div className="w-full max-w-md bg-primary rounded-2xl shadow-xl items-center relative">
          <div className="pt-4 w-full flex flex-col items-center">
            <h2 className="text-[30px] font-bold text-center text-white tracking-wider mb-10">
              RECUPERAR PASSWORD
            </h2>
            <form className="space-y-5 w-full px-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white"
                >
                  Email da conta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="email@email.com"
                  className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
                  value={email}
                  maxLength={25}
                  onChange={e => setEmail(e.target.value.slice(0, 25))}
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-quaternary hover:bg-red-900 text-sm font-bold tracking-wider text-white rounded-lg mt-5 cursor-pointer"
                disabled={loading}
              >
                {loading ? "A verificar..." : "Enviar instruções"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
