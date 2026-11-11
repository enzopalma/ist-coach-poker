import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IST Coach Poker | Visor GTO Preflop/Postflop, Sala de Estudio & Analizador PT4",
  description:
    "Plataforma de estudio de póker 6-Max Cash conectada a PokerTracker 4: Tablas Preflop 13x13, Estrategia Postflop por Textura, Detector de Leaks y Sala de Estudio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
