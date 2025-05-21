"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
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
    setUser(userData);
  }

  function logout() {
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
