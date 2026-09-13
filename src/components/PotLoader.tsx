"use client";

import { useEffect, useState } from "react";

/**
 * Panelinha tampada soltando vapor — o loading oficial do Mealtify.
 * Só aparece se a operação continuar depois de `delayMs` (padrão 2s),
 * pra não piscar em ações rápidas.
 */
export function PotLoader({
  label = "Cozinhando sua resposta…",
  delayMs = 2000,
  fullScreen = false,
}: {
  label?: string;
  delayMs?: number;
  fullScreen?: boolean;
}) {
  const [visible, setVisible] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!visible) return null;

  const content = (
    <div className="flex flex-col items-center justify-center gap-5 animate-pop-in">
      <PotArt />
      <p className="font-heading text-base text-cocoa-soft text-center px-6">{label}</p>
    </div>
  );

  if (!fullScreen) {
    return <div className="flex items-center justify-center py-10">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream/95 backdrop-blur-sm">
      {content}
    </div>
  );
}

function PotArt() {
  return (
    <svg width="128" height="128" viewBox="0 0 512 512" aria-hidden="true">
      <g className="animate-steam" style={{ transformOrigin: "196px 168px", animationDelay: "0s" }}>
        <path
          d="M196 168 C182 148 200 128 190 108 C204 122 214 146 200 168 Z"
          fill="var(--color-cocoa-soft)"
          opacity="0.55"
        />
      </g>
      <g className="animate-steam" style={{ transformOrigin: "256px 156px", animationDelay: "0.4s" }}>
        <path
          d="M256 156 C242 134 262 112 250 90 C266 106 278 132 262 156 Z"
          fill="var(--color-cocoa-soft)"
          opacity="0.55"
        />
      </g>
      <g className="animate-steam" style={{ transformOrigin: "316px 168px", animationDelay: "0.8s" }}>
        <path
          d="M316 168 C302 148 320 128 310 108 C324 122 334 146 320 168 Z"
          fill="var(--color-cocoa-soft)"
          opacity="0.55"
        />
      </g>

      <g className="animate-pot-wiggle" style={{ transformOrigin: "256px 340px" }}>
        <g className="animate-lid-jiggle">
          <path d="M120 226 Q256 172 392 226 L392 246 Q256 200 120 246 Z" fill="var(--color-butter)" />
          <circle cx="256" cy="196" r="18" fill="var(--color-butter)" />
          <rect x="238" y="176" width="36" height="16" rx="8" fill="var(--color-butter)" />
        </g>

        <path
          d="M108 262 Q256 214 404 262 L388 384 Q256 424 124 384 Z"
          fill="var(--color-card)"
        />
        <path
          d="M64 278 Q56 278 56 300 Q56 320 84 322 L110 322 L110 282 Z"
          fill="var(--color-card)"
        />
        <path
          d="M448 278 Q456 278 456 300 Q456 320 428 322 L402 322 L402 282 Z"
          fill="var(--color-card)"
        />
        <path
          d="M124 384 Q256 420 388 384 L382 400 Q256 434 130 400 Z"
          fill="var(--color-cream-deep)"
        />
        <path d="M150 300 Q256 330 362 300" stroke="var(--color-cream-deep)" strokeWidth="6" fill="none" opacity="0.7" />
      </g>
    </svg>
  );
}
