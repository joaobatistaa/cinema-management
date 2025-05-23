"use client";

import React from "react";
import AuthGuard from "@/src/components/AuthGuard";

export default function AppLayout({ children }) {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-300 overflow-auto">
      <div className="w-[1000px] h-[700px] bg-primary rounded-2xl shadow-xl">
        <AuthGuard>{children}</AuthGuard>
      </div>
    </div>
  );
}
