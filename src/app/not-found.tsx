"use client";

import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Página no encontrada</h1>
        <a href="/" className="text-indigo-400 underline">
          Volver al Inicio
        </a>
      </div>
    </div>
  );
}
