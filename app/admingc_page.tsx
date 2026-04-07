'use client';

import React, { useEffect, useState } from "react";

interface Config {
  base: number;
  tv: number;
  politica: number;
  futbol: number;
  famosos: number;
  override: boolean;
}

const DEFAULT_CONFIG: Config = {
  base: 20,
  tv: 3,
  politica: 5,
  futbol: 2,
  famosos: 3,
  override: false,
};

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <span className="text-zinc-400 text-sm w-32 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 accent-orange-500"
      />
      <span className="text-white text-sm font-bold w-8 text-right">{value}</span>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // La validación real la hace la API, pero hacemos una pre-check
    // para no exponer la contraseña en el cliente.
    // La contraseña se valida en el POST al guardar.
    // Acá solo la guardamos para usarla en el header.
    if (password.trim() === "") {
      setError("Ingresá la contraseña");
      return;
    }
    setAuthed(true);
    setError("");
  };

  useEffect(() => {
    if (!authed) return;
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, [authed]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": password,
        },
        body: JSON.stringify(config),
      });
      if (res.status === 401) {
        setError("Contraseña incorrecta");
        setAuthed(false);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof Config) => (v: number | boolean) =>
    setConfig((prev) => ({ ...prev, [key]: v }));

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-zinc-900 rounded-3xl p-8 w-full max-w-sm space-y-4">
          <h1 className="text-white text-2xl font-bold">Admin</h1>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Panel de control</h1>
          <p className="text-zinc-400 mt-1 text-sm">Los cambios afectan a todos los visitantes en tiempo real.</p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 space-y-2">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Tensión de fondo</p>
          <SliderRow
            label="Base mínima"
            value={config.base}
            min={0}
            max={60}
            onChange={set("base") as (v: number) => void}
          />
          <p className="text-zinc-600 text-xs -mt-2 mb-2">
            Contexto global. Hoy (conflicto Irán-EEUU): 35–45
          </p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 space-y-2">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Categorías</p>
          <SliderRow label="TV/streaming" value={config.tv} min={0} max={10} onChange={set("tv") as (v: number) => void} />
          <SliderRow label="Política" value={config.politica} min={0} max={10} onChange={set("politica") as (v: number) => void} />
          <SliderRow label="Fútbol" value={config.futbol} min={0} max={10} onChange={set("futbol") as (v: number) => void} />
          <SliderRow label="Famosos" value={config.famosos} min={0} max={10} onChange={set("famosos") as (v: number) => void} />
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Override</p>
          <button
            onClick={() => set("override")(!config.override)}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              config.override
                ? "bg-red-600 text-white animate-pulse"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {config.override
              ? "🔥 NOCHE TWITTERA ACTIVADA — click para desactivar"
              : "Forzar NOCHE TWITTERA al 100"}
          </button>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
        >
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
