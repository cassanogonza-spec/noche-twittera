use client';

import React, { useEffect, useMemo, useState } from "react";

const phrases = [
  "No pasa nada",
  "Timeline tibio",
  "Se está cocinando",
  "Se viene",
  "Noche twitera muy probable",
  "🔥 NOCHE TWITTERA DEL CARAJO",
];

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

interface Config {
  base: number;
  tv: number;
  politica: number;
  futbol: number;
  famosos: number;
  override: boolean;
}

function calcScore(config: Config): number {
  if (config.override) return 100;
  const { base, tv, politica, futbol, famosos } = config;
  const h = new Date().getHours();
  const primeBoost = h >= 21 ? 10 : h >= 18 ? 5 : 0;
  const trasnoche = h >= 0 && h <= 2 ? 12 : 0;
  const rand = Math.floor(Math.random() * 10);
  const categoryScore = (tv * 8 + politica * 7 + futbol * 9 + famosos * 6) / 6;
  return Math.min(100, Math.round(base + categoryScore + primeBoost + trasnoche + rand));
}

export default function Page() {
  const [config, setConfig] = useState<Config>({
    base: 20,
    tv: 3,
    politica: 5,
    futbol: 2,
    famosos: 3,
    override: false,
  });
  const [score, setScore] = useState(0);
  const [lockedCelebration, setLockedCelebration] = useState(false);
  const [celebrationUntil, setCelebrationUntil] = useState<number | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      setConfig(data);
    } catch {}
  };

  useEffect(() => {
    fetchConfig();
    const interval = setInterval(fetchConfig, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setScore(calcScore(config));
  }, [config]);

  useEffect(() => {
    const now = Date.now();
    if (celebrationUntil && now < celebrationUntil) {
      setLockedCelebration(true);
      return;
    }
    if (score >= 95 && !lockedCelebration) {
      setLockedCelebration(true);
      setCelebrationUntil(now + 1000 * 60 * 60 * 3);
    }
    if (celebrationUntil && now >= celebrationUntil) {
      setLockedCelebration(false);
      setCelebrationUntil(null);
    }
  }, [score, celebrationUntil, lockedCelebration]);

  const displayScore = lockedCelebration ? 100 : score;

  const estado = useMemo(() => {
    if (displayScore < 20) return phrases[0];
    if (displayScore < 40) return phrases[1];
    if (displayScore < 60) return phrases[2];
    if (displayScore < 80) return phrases[3];
    if (displayScore < 95) return phrases[4];
    return phrases[5];
  }, [displayScore]);

  const gag = gags[displayScore % gags.length];

  const heatStyle = {
    height: `${displayScore}%`,
    opacity: Math.max(0.35, displayScore / 100),
    background:
      displayScore < 35
        ? "linear-gradient(to top, #3f3f46, #52525b)"
        : displayScore < 70
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
              <div>TV/streaming: {config.tv}/10</div>
              <div>Política: {config.politica}/10</div>
              <div>Fútbol: {config.futbol}/10</div>
              <div>Famosos: {config.famosos}/10</div>
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
              {escala.slice().reverse().map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="text-6xl font-bold">{displayScore}%</div>

            {displayScore >= 95 && (
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
