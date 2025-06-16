"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import HomeIcon from "@mui/icons-material/Home";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [purlValid, setPurlValid] = useState(false);
  const [purlChecked, setPurlChecked] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const purl = searchParams.get("a");

  useEffect(() => {
    if (purl) {
      fetch(`/api/users/resetPassword?purl=${encodeURIComponent(purl)}`)
        .then(async (res) => {
          setPurlValid(res.ok);
          setPurlChecked(true);
        })
        .catch(() => {
          setPurlValid(false);
          setPurlChecked(true);
        });
    }
  }, [purl]);

  // Redirecionamento limpo quando o link não é válido
  useEffect(() => {
    if (purlChecked && !purlValid) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [purlChecked, purlValid, router]);

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As passwords não coincidem.");
      return;
    }
    if (!/^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).*$/.test(newPassword)) {
      toast.error("A password deve ter pelo menos 8 caracteres, uma letra e um caracter especial.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purl, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao alterar password.");
        setLoading(false);
        return;
      }
      toast.success("Password alterada com sucesso! Pode agora iniciar sessão.");
      router.push("/login");
    } catch {
      toast.error("Erro ao alterar password.");
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
              NOVA PASSWORD
            </h2>
            {!purlChecked ? (
              <div className="text-white">A validar link...</div>
            ) : !purlValid ? (
              <div className="text-red-400 text-center mb-6">
                Link inválido ou expirado.<br />
                Solicite novo pedido de recuperação.
              </div>
            ) : (
              <form className="space-y-5 w-full px-4" onSubmit={handleResetPassword}>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-white"
                  >
                    Nova password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="********"
                    className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-white"
                  >
                    Confirmar password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="********"
                    className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-quaternary hover:bg-red-900 text-sm font-bold tracking-wider text-white rounded-lg mt-5 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "A alterar..." : "Alterar password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
