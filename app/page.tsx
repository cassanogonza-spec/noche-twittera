'use client';

import React, { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [signals, setSignals] = useState({
    tv: 0,
    politica: 0,
    futbol: 0,
    famosos: 0,
    hora: (() => {
      const h = new Date().getHours();
      return h === 0 ? 24 : h;
    })(),
  });

  const [lockedCelebration, setLockedCelebration] = useState(false);
  const [celebrationUntil, setCelebrationUntil] = useState<number | null>(null);

  useEffect(() => {
    const calculateSignals = () => {
      const now = new Date();
      const hour = now.getHours();

      const primeTimeBoost = hour >= 21 ? 7 : hour >= 18 ? 4 : 2;
      const trasnocheBoost = hour >= 0 && hour <= 2 ? 9 : 0;
      const randomDrama = () => Math.floor(Math.random() * 10);

      setSignals({
        tv: Math.min(10, primeTimeBoost + Math.floor(Math.random() * 3)),
        politica: randomDrama(),
        futbol: randomDrama(),
        famosos: randomDrama(),
        hora: hour + trasnocheBoost,
      });
    };

    calculateSignals();
    const interval = setInterval(calculateSignals, 8000);
    return () => clearInterval(interval);
  }, []);

  const score = useMemo(() => {
    const { tv, politica, futbol, famosos, hora } = signals;
    let base = tv * 8 + politica * 7 + futbol * 9 + famosos * 6;

    if (hora >= 22) base += 15;
    if (hora >= 24 || hora <= 2) base += 20;

    const calculated = Math.min(100, Math.round(base / 3));
    return lockedCelebration ? 100 : calculated;
  }, [signals, lockedCelebration]);

  useEffect(() => {
    const now = Date.now();

    if (celebrationUntil && now < celebrationUntil) {
      setLockedCelebration(true);
      return;
    }

    if (score >= 95 && !lockedCelebration) {
      setLockedCelebration(true);
      setCelebrationUntil(now + 1000 * 60 * 60 * 3); // 3 horas
    }

    if (celebrationUntil && now >= celebrationUntil) {
      setLockedCelebration(false);
      setCelebrationUntil(null);
    }
  }, [score, celebrationUntil, lockedCelebration]);

  const estado = useMemo(() => {
    if (score < 20) return "No pasa nada";
    if (score < 40) return "Timeline tibio";
    if (score < 60) return "Se está cocinando";
    if (score < 80) return "Se viene";
    if (score < 95) return "Noche twitera MUY probable";
    return "🔥 NOCHE TWITTERA DEL CARAJO";
  }, [score]);

  const escala = [
    "No pasa nada",
    "Timeline tibio",
    "Se cocina",
    "Se viene",
    "Hay memes",
    "NOCHE TWITTERA DEL CARAJO",
  ];

  const gags = [
    "Hoy la cosa se puede picar por los dichos de Trump sobre bombardear Irán.",
    "Si juega Boca y hay VAR polémico, esto se va al rojo en 3 minutos.",
    "Un ex Gran Hermano acaba de subir una historia sospechosa.",
    "Hay olor a cadena nacional, capturas y memes de tipografía Impact.",
  ];

  const gag = gags[score % gags.length];

  const heatStyle = {
    height: `${score}%`,
    opacity: Math.max(0.35, score / 100),
    background:
      score < 35
        ? "linear-gradient(to top, #3f3f46, #52525b)"
        : score < 70
        ? "linear-gradient(to top, #f97316, #fb923c)"
        : "linear-gradient(to top, #f97316, #dc2626)",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              TERMOTETRO
            </h1>
            <p className="text-xl text-zinc-400 mt-2">
              Lectura automática de potencial de noche twitera 🇦🇷
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <p className="text-zinc-300">Monitoreando señales en tiempo real...</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>TV/streaming: {signals.tv}/10</div>
              <div>Política: {signals.politica}/10</div>
              <div>Fútbol: {signals.futbol}/10</div>
              <div>Famosos: {signals.famosos}/10</div>
            </div>
            <p className="text-xs text-zinc-500">
              Actualización automática cada 8 segundos
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-end gap-6">
            <div className="relative h-[420px] w-32 bg-zinc-800 rounded-full border border-zinc-700 overflow-hidden shadow-2xl">
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
                style={heatStyle}
              />
            </div>

            <div className="h-[420px] flex flex-col justify-between text-xs text-zinc-400 py-2">
              {escala
                .slice()
                .reverse()
                .map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
            </div>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold">{score}%</div>

            {score >= 95 && (
              <div className="mt-4 p-4 rounded-2xl bg-red-600/20 border border-red-500 text-red-200 font-bold text-lg animate-pulse">
                🎉 SEÑORES, TENEMOS NOCHE TWITTERA 🎉
                <div className="text-3xl mt-2">🎆 🎊 🧨 🎉</div>
              </div>
            )}

            <p className="text-xl mt-2 text-zinc-300">{estado}</p>

            <p className="text-sm text-zinc-500 mt-3 max-w-md">
              El algoritmo analiza prime time, chances de quilombo político,
              potencial futbolero y nivel de memeabilidad social.
            </p>

            <p className="text-sm mt-4 max-w-md text-orange-300 italic">
              ⚡ {gag}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}