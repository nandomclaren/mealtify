// Vibração sutil em dispositivos que suportam (Android/Chrome, instalado como PWA).
// Falha silenciosamente em iOS/desktop — é só um tempero, não uma dependência.
export function crunchClick() {
  try {
    navigator.vibrate?.(8);
  } catch {
    // ignore
  }
}

export function lockThud() {
  try {
    navigator.vibrate?.(20);
  } catch {
    // ignore
  }
}
