"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { crunchClick } from "@/lib/haptics";

export function AutocompleteChipInput({
  value,
  onAdd,
  onRemove,
  suggestions,
  placeholder = "Digite e aperte Enter",
}: {
  value: string[];
  onAdd: (nome: string) => void;
  onRemove: (nome: string) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit(nomeBruto: string) {
    const nome = nomeBruto.trim();
    if (!nome) return;
    const jaExiste = value.some((v) => v.toLowerCase() === nome.toLowerCase());
    if (!jaExiste) {
      crunchClick();
      onAdd(nome);
    }
    setDraft("");
  }

  const termo = draft.trim().toLowerCase();
  const sugestoesFiltradas = termo
    ? suggestions
        .filter(
          (s) => s.toLowerCase().includes(termo) && !value.some((v) => v.toLowerCase() === s.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((nome) => (
            <button
              key={nome}
              type="button"
              onClick={() => {
                crunchClick();
                onRemove(nome);
              }}
              className="btn-cozy animate-pop-in flex items-center gap-1.5 bg-terracotta px-3.5 py-1.5 text-sm text-white"
            >
              {nome}
              <X size={14} strokeWidth={2.5} />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(draft);
            }
          }}
          onBlur={() => commit(draft)}
          placeholder={placeholder}
          className="w-full rounded-full border border-cocoa/15 bg-card px-4 py-2.5 text-sm outline-none placeholder:text-cocoa-soft/70 focus:border-terracotta"
        />

        {sugestoesFiltradas.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-2xl border border-cocoa/10 bg-card shadow-[var(--shadow-cozy-sm)]">
            {sugestoesFiltradas.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(s)}
                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-cream-deep"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
