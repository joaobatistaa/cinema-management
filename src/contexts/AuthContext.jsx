"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else if (user === null) localStorage.removeItem("user");
  }, [user]);

  async function login(userData) {
    if (userData && userData.role === "customer" && userData.id) {
      try {
        const res = await fetch(`/api/users`);
        const users = await res.json();
        const found = users.find((u) => String(u.id) === String(userData.id));
        if (found && found.nif) {
          setUser({ ...userData, nif: found.nif });
        } else {
          setUser(userData);
        }
      } catch {
        setUser(userData);
      }
    } else {
      setUser(userData);
    }
  }

  function logout() {
    router.replace("/");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
