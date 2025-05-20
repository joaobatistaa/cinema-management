"use client";

import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-start pt-20">
      <h2 className="text-[50px] font-bold text-center text-white tracking-wider mb-4">
        INICIAR SESSÃO
      </h2>
      <div className="w-full max-w-md mt-4 pt-12">
        <form className="space-y-5">
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
              placeholder="********"
              className="w-full px-4 py-2 mt-1 border-1 border-white rounded-lg text-gray"
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
            className="w-full py-3 bg-quaternary hover:bg-red-900  text-sm font-bold tracking-wider text-white rounded-lg mt-5 cursor-pointer"
          >
            INICIAR SESSÃO
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
  );
}
