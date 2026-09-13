"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { crunchClick } from "@/lib/haptics";

export type ShoppingItem = {
  id: string;
  nome: string;
  jaTenho: boolean;
};

function ordenar(itens: ShoppingItem[]) {
  return [...itens].sort((a, b) => {
    if (a.jaTenho !== b.jaTenho) return a.jaTenho ? 1 : -1;
    return a.nome.toLowerCase().localeCompare(b.nome.toLowerCase(), "pt-BR");
  });
}

export function ShoppingList({ initialItems }: { initialItems: ShoppingItem[] }) {
  const [itens, setItens] = useState(() => ordenar(initialItems));

  async function toggle(id: string) {
    crunchClick();
    setItens((prev) =>
      ordenar(prev.map((item) => (item.id === id ? { ...item, jaTenho: !item.jaTenho } : item)))
    );

    const alvo = itens.find((item) => item.id === id);
    const novoValor = alvo ? !alvo.jaTenho : true;

    try {
      await fetch(`/api/shopping/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jaTenho: novoValor }),
      });
    } catch {
      // se falhar, o estado local já refletiu a intenção do usuário; um refresh de página corrige
    }
  }

  const pendentes = itens.filter((i) => !i.jaTenho).length;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-cocoa-soft">
        {pendentes === 0 ? "Tudo na sacola! 🧺" : `${pendentes} item(ns) faltando`}
      </p>

      <ul className="flex flex-col gap-2">
        {itens.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="btn-cozy card-cozy flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  item.jaTenho
                    ? "border-sage bg-sage text-white"
                    : "border-cocoa/25 text-transparent"
                }`}
              >
                <Check size={15} strokeWidth={3} />
              </span>
              <span
                className={`text-[15px] ${
                  item.jaTenho ? "text-cocoa-soft/60 line-through" : "text-cocoa"
                }`}
              >
                {item.nome}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
