"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import toast from "react-hot-toast";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (!searchParams) return;

    const purl = searchParams.get("a");
    if (!purl) {
      setStatus("invalid");
      setLoading(false);
      toast.error("Link inválido ou expirado.");
      setTimeout(() => router.replace("/"), 2000);
      return;
    }

    async function validateAndConfirm() {
      try {
        const check = await fetch(`/api/users/confirmEmail?a=${encodeURIComponent(purl)}`);
        const checkData = await check.json();

        if (!check.ok || !checkData.valid) {
          setStatus("invalid");
          setLoading(false);
          toast.error(checkData.error || "Link inválido ou expirado.");
          setTimeout(() => router.replace("/"), 2000);
          return;
        }

        if (!confirmedRef.current) {
          confirmedRef.current = true;
          const res = await fetch(`/api/users/confirmEmail?a=${encodeURIComponent(purl)}`, {
            method: "POST",
          });
          const data = await res.json();

          if (!res.ok) {
            setStatus("invalid");
            setLoading(false);
            toast.error(data.error || "Erro ao confirmar email.");
            setTimeout(() => router.replace("/"), 2000);
            return;
          }

          setStatus("success");
          setLoading(false);
          toast.success("Email confirmado com sucesso!");
          setTimeout(() => router.replace("/login"), 2000);
        }
      } catch (err) {
        setStatus("invalid");
        setLoading(false);
        toast.error("Erro inesperado.");
        setTimeout(() => router.replace("/"), 2000);
      }
    }

    validateAndConfirm();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-0" style={{ minHeight: 0 }}>
      <div className="bg-[#232336] rounded-xl shadow-lg p-10 flex flex-col items-center w-full max-w-md mt-24">
        {loading ? (
          <CircularProgress color="error" size={80} />
        ) : status === "success" ? (
          <h2 className="text-xl text-white mt-8">Email confirmado com sucesso!</h2>
        ) : (
          <h2 className="text-xl text-white mt-8">Link inválido ou expirado.</h2>
        )}
      </div>
    </div>
  );
}
