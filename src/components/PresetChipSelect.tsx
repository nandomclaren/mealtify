"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { crunchClick } from "@/lib/haptics";

const OUTRO = "__outro__";

export function PresetChipSelect({
  value,
  onAdd,
  onRemove,
  options,
  placeholder = "Selecione um prato…",
}: {
  value: string[];
  onAdd: (nome: string) => void;
  onRemove: (nome: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  const [mostrarOutro, setMostrarOutro] = useState(false);
  const [outroValor, setOutroValor] = useState("");

  function adicionar(nome: string) {
    const limpo = nome.trim();
    if (!limpo) return;
    const jaExiste = value.some((v) => v.toLowerCase() === limpo.toLowerCase());
    if (!jaExiste) {
      crunchClick();
      onAdd(limpo);
    }
  }

  function commitOutro() {
    if (outroValor.trim()) adicionar(outroValor);
    setOutroValor("");
    setMostrarOutro(false);
  }

  const opcoesDisponiveis = options.filter(
    (op) => !value.some((v) => v.toLowerCase() === op.toLowerCase())
  );

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

      {mostrarOutro ? (
        <input
          autoFocus
          value={outroValor}
          onChange={(e) => setOutroValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitOutro();
            }
            if (e.key === "Escape") {
              setMostrarOutro(false);
              setOutroValor("");
            }
          }}
          onBlur={commitOutro}
          placeholder="Digite o nome do prato"
          className="rounded-full border border-cocoa/15 bg-card px-4 py-2.5 text-sm outline-none focus:border-terracotta"
        />
      ) : (
        <select
          value=""
          onChange={(e) => {
            const v = e.target.value;
            if (v === OUTRO) setMostrarOutro(true);
            else if (v) adicionar(v);
          }}
          className="rounded-full border border-cocoa/15 bg-card px-4 py-2.5 text-sm text-cocoa-soft outline-none focus:border-terracotta"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {opcoesDisponiveis.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
          <option value={OUTRO}>Outro (digitar)…</option>
        </select>
      )}
    </div>
  );
}
