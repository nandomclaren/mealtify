"use client";

import { Lock, LockOpen } from "lucide-react";
import { lockThud } from "@/lib/haptics";

export function LockToggle({
  locked,
  onChange,
  disabled = false,
}: {
  locked: boolean;
  onChange: (locked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={locked}
      aria-label={locked ? "Prato travado" : "Travar prato"}
      onClick={() => {
        lockThud();
        onChange(!locked);
      }}
      className={`btn-cozy flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30 ${
        locked ? "bg-butter text-cocoa" : "bg-cream-deep text-cocoa-soft"
      }`}
    >
      {locked ? <Lock size={18} strokeWidth={2.4} /> : <LockOpen size={18} strokeWidth={2.4} />}
    </button>
  );
}
