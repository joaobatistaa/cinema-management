import React from "react";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-300">
      <div className="w-[1000px] h-[700px] bg-primary rounded-2xl shadow-xl">
        {children}
      </div>
    </div>
  );
}
