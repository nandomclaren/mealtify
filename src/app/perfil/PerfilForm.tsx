"use client";

import { useState, useTransition } from "react";
import { ChipInput } from "@/components/ChipInput";
import { OBJETIVOS_NUTRICIONAIS, VETOS_SUGERIDOS } from "@/lib/schema";
import { crunchClick } from "@/lib/haptics";

type BlacklistItem = { id: string; nome: string };

export function PerfilForm({
  initialObjective,
  initialBlacklist,
}: {
  initialObjective: string;
  initialBlacklist: BlacklistItem[];
}) {
  const [objetivo, setObjetivo] = useState(initialObjective);
  const [customObjetivo, setCustomObjetivo] = useState(
    OBJETIVOS_NUTRICIONAIS.includes(initialObjective as (typeof OBJETIVOS_NUTRICIONAIS)[number])
      ? ""
      : initialObjective
  );
  const [blacklist, setBlacklist] = useState(initialBlacklist);
  const [salvo, setSalvo] = useState(false);
  const [pending, startTransition] = useTransition();

  const usandoCustom = !OBJETIVOS_NUTRICIONAIS.includes(
    objetivo as (typeof OBJETIVOS_NUTRICIONAIS)[number]
  );

  async function salvarObjetivo(valor: string) {
    setObjetivo(valor);
    setSalvo(false);
    startTransition(async () => {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nutritionalObjective: valor }),
      });
      setSalvo(true);
    });
  }

  async function addVeto(nome: string) {
    setBlacklist((prev) => [...prev, { id: `temp-${nome}`, nome }]);
    const res = await fetch("/api/blacklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    if (res.ok) {
      const item = await res.json();
      setBlacklist((prev) => prev.map((b) => (b.nome === nome ? item : b)));
    }
  }

  async function removeVeto(nome: string) {
    const alvo = blacklist.find((b) => b.nome === nome);
    setBlacklist((prev) => prev.filter((b) => b.nome !== nome));
    if (alvo && !alvo.id.startsWith("temp-")) {
      await fetch(`/api/blacklist/${alvo.id}`, { method: "DELETE" });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold">Objetivo nutricional</h2>
        <div className="flex flex-col gap-2">
          {OBJETIVOS_NUTRICIONAIS.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => {
                crunchClick();
                salvarObjetivo(op);
              }}
              className={`btn-cozy px-4 py-3 text-left text-sm ${
                objetivo === op ? "bg-terracotta text-white" : "card-cozy text-cocoa"
              }`}
            >
              {op}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              crunchClick();
              if (customObjetivo) salvarObjetivo(customObjetivo);
              else setObjetivo("");
            }}
            className={`btn-cozy px-4 py-3 text-left text-sm ${
              usandoCustom ? "bg-terracotta text-white" : "card-cozy text-cocoa"
            }`}
          >
            Outro objetivo…
          </button>

          {(usandoCustom || customObjetivo) && (
            <input
              value={customObjetivo}
              onChange={(e) => setCustomObjetivo(e.target.value)}
              onBlur={() => customObjetivo && salvarObjetivo(customObjetivo)}
              placeholder="Descreva o objetivo nutricional"
              className="rounded-2xl border border-cocoa/15 bg-card px-4 py-3 text-sm outline-none focus:border-terracotta"
            />
          )}
        </div>
        {pending && <p className="text-xs text-cocoa-soft">Salvando…</p>}
        {salvo && !pending && <p className="text-xs text-sage-dark">Salvo ✓</p>}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold">Veto permanente da família</h2>
        <p className="text-sm text-cocoa-soft">
          Esses ingredientes nunca aparecem nas sugestões nem na lista de compras.
        </p>
        <ChipInput
          value={blacklist.map((b) => b.nome)}
          onAdd={addVeto}
          onRemove={removeVeto}
          suggestions={VETOS_SUGERIDOS}
          placeholder="ex: fígado, camarão…"
        />
      </section>
    </div>
  );
}
