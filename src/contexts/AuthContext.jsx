"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    else setUser(null);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else if (user === null) localStorage.removeItem("user");
  }, [user]);

  function login(userData) {
    // Se for customer, carrega o NIF do utilizador (se existir)
    if (userData && userData.role === "customer" && userData.id) {
      fetch(`/api/users`)
        .then((res) => res.json())
        .then((users) => {
          const found = users.find((u) => String(u.id) === String(userData.id));
          if (found && found.nif) {
            setUser({ ...userData, nif: found.nif });
          } else {
            setUser(userData);
          }
        })
        .catch(() => setUser(userData));
    } else {
      setUser(userData);
    }
  }

  function logout() {
    router.replace("/");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
