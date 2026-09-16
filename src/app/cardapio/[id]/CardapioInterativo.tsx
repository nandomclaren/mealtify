"use client";

import { useState } from "react";
import { Check, Lock, RefreshCw } from "lucide-react";
import { crunchClick } from "@/lib/haptics";
import { CardapioSemanal, SLOT_KEYS, SLOT_LABELS, SlotKey } from "@/lib/schema";

export function CardapioInterativo({
  planId,
  initialCardapio,
  initialRoteiro,
}: {
  planId: string;
  initialCardapio: CardapioSemanal;
  initialRoteiro: string[];
}) {
  const [cardapio, setCardapio] = useState(initialCardapio);
  const [roteiro, setRoteiro] = useState(initialRoteiro);
  const [excluidos, setExcluidos] = useState<Record<SlotKey, string[]>>(() =>
    Object.fromEntries(SLOT_KEYS.map((s) => [s, [] as string[]])) as Record<SlotKey, string[]>
  );
  const [confirmados, setConfirmados] = useState<Partial<Record<SlotKey, boolean>>>({});
  const [carregando, setCarregando] = useState<SlotKey | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function trocar(slot: SlotKey) {
    setErro(null);
    setCarregando(slot);
    const excluidosAtuais = [...excluidos[slot], cardapio[slot].prato];

    try {
      const res = await fetch(`/api/plans/${planId}/retry-dish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, excluded: excluidosAtuais }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.toString() || "Não consegui trocar esse prato agora.");
      }

      const resultado = await res.json();
      setCardapio((prev) => ({ ...prev, [slot]: resultado.prato }));
      setRoteiro(resultado.roteiroPreparoDomingo);
      setExcluidos((prev) => ({ ...prev, [slot]: excluidosAtuais }));
      setConfirmados((prev) => ({ ...prev, [slot]: false }));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui trocar esse prato agora.");
    } finally {
      setCarregando(null);
    }
  }

  function confirmar(slot: SlotKey) {
    crunchClick();
    setConfirmados((prev) => ({ ...prev, [slot]: true }));
  }

  return (
    <>
      <section className="flex flex-col gap-3">
        {erro && <p className="text-sm font-semibold text-blush">{erro}</p>}

        {SLOT_KEYS.map((slot) => {
          const prato = cardapio[slot];
          const confirmado = confirmados[slot];
          const carregandoEsse = carregando === slot;

          return (
            <div
              key={slot}
              className={`card-cozy flex items-center gap-3 px-4 py-4 ${
                confirmado ? "ring-2 ring-sage" : ""
              }`}
            >
              <div className="flex-1">
                <p className="text-xs font-semibold text-cocoa-soft">{SLOT_LABELS[slot]}</p>
                <p className="font-heading text-base font-bold">{prato.prato}</p>
                <p className="text-xs text-cocoa-soft">
                  {prato.calorias} kcal · {prato.proteina_g}g proteína
                </p>
              </div>

              {prato.travado ? (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-butter text-cocoa">
                  <Lock size={16} />
                </span>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={carregandoEsse}
                    aria-label="Gostei desse prato"
                    onClick={() => confirmar(slot)}
                    className={`btn-cozy flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-40 ${
                      confirmado ? "bg-sage text-white" : "bg-cream-deep text-cocoa-soft"
                    }`}
                  >
                    <Check size={16} strokeWidth={2.6} />
                  </button>
                  <button
                    type="button"
                    disabled={carregandoEsse}
                    aria-label="Trocar esse prato"
                    onClick={() => trocar(slot)}
                    className="btn-cozy flex h-9 w-9 items-center justify-center rounded-full bg-cream-deep text-cocoa-soft disabled:opacity-40"
                  >
                    <RefreshCw size={16} strokeWidth={2.4} className={carregandoEsse ? "animate-spin" : ""} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-bold">Roteiro de preparo — domingo</h2>
        <ol className="card-cozy flex flex-col gap-3 px-5 py-4">
          {roteiro.map((passo, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-bold text-white">
                {i + 1}
              </span>
              {passo}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
