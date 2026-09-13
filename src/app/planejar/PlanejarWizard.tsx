"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChipInput } from "@/components/ChipInput";
import { LockToggle } from "@/components/LockToggle";
import { PotLoader } from "@/components/PotLoader";
import { crunchClick } from "@/lib/haptics";
import { OBJETIVOS_NUTRICIONAIS, SLOT_KEYS, SLOT_LABELS, SlotKey } from "@/lib/schema";

type SlotState = { prato: string; locked: boolean };

const emptySlots = (): Record<SlotKey, SlotState> =>
  Object.fromEntries(SLOT_KEYS.map((slot) => [slot, { prato: "", locked: false }])) as Record<
    SlotKey,
    SlotState
  >;

export function PlanejarWizard({ defaultObjective }: { defaultObjective: string }) {
  const router = useRouter();
  const [objetivo, setObjetivo] = useState(defaultObjective);
  const [helloFresh, setHelloFresh] = useState<string[]>([]);
  const [picard, setPicard] = useState<string[]>([]);
  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>(emptySlots);
  const [extraVetos, setExtraVetos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function updateSlot(slot: SlotKey, patch: Partial<SlotState>) {
    setSlots((prev) => ({ ...prev, [slot]: { ...prev[slot], ...patch } }));
  }

  async function gerar() {
    setErro(null);
    setLoading(true);

    const lockedDishes = SLOT_KEYS.filter((slot) => slots[slot].locked && slots[slot].prato.trim()).map(
      (slot) => ({ slot, prato: slots[slot].prato.trim() })
    );

    try {
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nutritionalObjective: objetivo,
          fixedHelloFresh: helloFresh,
          fixedPicard: picard,
          lockedDishes,
          extraVetos,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.toString() || "Não consegui gerar o cardápio agora.");
      }

      const plan = await res.json();
      router.push(`/cardapio/${plan.id}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui gerar o cardápio agora.");
      setLoading(false);
    }
  }

  if (loading) {
    return <PotLoader fullScreen label="Equilibrando seu cardápio da semana…" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-bold">Objetivo desta semana</h2>
        <div className="flex flex-wrap gap-2">
          {OBJETIVOS_NUTRICIONAIS.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => {
                crunchClick();
                setObjetivo(op);
              }}
              className={`btn-cozy px-3.5 py-2 text-sm ${
                objetivo === op ? "bg-terracotta text-white" : "card-cozy text-cocoa"
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-bold">Jantares fixos (HelloFresh)</h2>
        <p className="text-sm text-cocoa-soft">O que já vem pronto/contratado essa semana.</p>
        <ChipInput
          value={helloFresh}
          onAdd={(nome) => setHelloFresh((prev) => [...prev, nome])}
          onRemove={(nome) => setHelloFresh((prev) => prev.filter((n) => n !== nome))}
          placeholder="ex: Strogonoff de frango"
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-bold">Outras refeições fixas (Picard)</h2>
        <ChipInput
          value={picard}
          onAdd={(nome) => setPicard((prev) => [...prev, nome])}
          onRemove={(nome) => setPicard((prev) => prev.filter((n) => n !== nome))}
          placeholder="ex: Lasanha de berinjela"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold">Pratos que você já decidiu</h2>
        <p className="text-sm text-cocoa-soft">
          Escreva o prato e trave com o cadeado 🔒 pra garantir que ele fique exatamente assim.
        </p>
        <div className="flex flex-col gap-2">
          {SLOT_KEYS.map((slot) => (
            <div key={slot} className="card-cozy flex items-center gap-2 p-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-cocoa-soft">{SLOT_LABELS[slot]}</p>
                <input
                  value={slots[slot].prato}
                  onChange={(e) => updateSlot(slot, { prato: e.target.value })}
                  placeholder="deixe a IA decidir"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-cocoa-soft/60"
                />
              </div>
              <LockToggle
                locked={slots[slot].locked}
                disabled={!slots[slot].prato.trim()}
                onChange={(locked) => updateSlot(slot, { locked })}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-bold">Algum veto só nesta semana?</h2>
        <p className="text-sm text-cocoa-soft">Além do que já está travado no seu perfil.</p>
        <ChipInput
          value={extraVetos}
          onAdd={(nome) => setExtraVetos((prev) => [...prev, nome])}
          onRemove={(nome) => setExtraVetos((prev) => prev.filter((n) => n !== nome))}
          placeholder="ex: berinjela essa semana"
        />
      </section>

      {erro && <p className="text-sm font-semibold text-blush">{erro}</p>}

      <button
        type="button"
        onClick={gerar}
        className="btn-cozy sticky bottom-24 bg-terracotta px-6 py-4 text-center text-base text-white shadow-[var(--shadow-cozy)]"
      >
        Gerar cardápio da semana
      </button>
    </div>
  );
}
