"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { crunchClick } from "@/lib/haptics";

export function ChipInput({
  value,
  onAdd,
  onRemove,
  suggestions = [],
  placeholder = "Digite um ingrediente e aperte Enter",
}: {
  value: string[];
  onAdd: (nome: string) => void;
  onRemove: (nome: string) => void;
  suggestions?: readonly string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function normalize(s: string) {
    return s.trim();
  }

  function commit() {
    const nome = normalize(draft);
    if (!nome) return;
    const already = value.some((v) => v.toLowerCase() === nome.toLowerCase());
    if (!already) {
      crunchClick();
      onAdd(nome);
    }
    setDraft("");
  }

  const remainingSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
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

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          placeholder={placeholder}
          className="min-w-[10rem] flex-1 rounded-full border border-cocoa/15 bg-card px-4 py-1.5 text-sm outline-none placeholder:text-cocoa-soft/70 focus:border-terracotta"
        />
      </div>

      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {remainingSuggestions.map((nome) => (
            <button
              key={nome}
              type="button"
              onClick={() => {
                crunchClick();
                onAdd(nome);
              }}
              className="btn-cozy border border-dashed border-cocoa/25 px-3.5 py-1.5 text-sm text-cocoa-soft"
            >
              + {nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
