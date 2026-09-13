import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardapioSemanal, ScoreAtrito, SLOT_KEYS, SLOT_LABELS } from "@/lib/schema";
import { Lock, ShoppingBasket, TriangleAlert } from "lucide-react";

export default async function CardapioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await prisma.weeklyPlan.findUnique({ where: { id } });

  if (!plan) notFound();

  if (plan.status === "ERROR") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-5 pt-16 text-center">
        <p className="font-heading text-xl font-bold">Essa geração falhou</p>
        <p className="text-sm text-cocoa-soft">{plan.errorMessage}</p>
        <Link href="/planejar" className="btn-cozy bg-terracotta px-6 py-3 text-white">
          Tentar de novo
        </Link>
      </div>
    );
  }

  if (plan.status !== "READY") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-5 pt-16 text-center">
        <p className="font-heading text-xl font-bold">Ainda cozinhando…</p>
        <p className="text-sm text-cocoa-soft">Atualize a página em alguns instantes.</p>
      </div>
    );
  }

  const score = plan.scoreAtrito as ScoreAtrito;
  const cardapio = plan.cardapioSemanal as CardapioSemanal;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pt-8 pb-4">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-bold">Cardápio da semana</h1>
        {plan.diagnosticoCompensacao && (
          <p className="text-sm text-cocoa-soft">{plan.diagnosticoCompensacao}</p>
        )}
      </header>

      <section className="card-cozy flex flex-col gap-3 px-5 py-4">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-cream-deep px-3 py-1.5">
            🕒 {score.tempo_estimado_cozinha_minutos} min no domingo
          </span>
          <span className="rounded-full bg-cream-deep px-3 py-1.5">
            🍲 {score.panelas_utilizadas} panela(s)
          </span>
          <span className="rounded-full bg-cream-deep px-3 py-1.5">
            Complexidade: {score.nivel_complexidade}
          </span>
        </div>
        {score.alerta_autossabotagem && (
          <div className="flex items-start gap-2 rounded-2xl bg-blush/20 px-3.5 py-3 text-sm text-cocoa">
            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-blush" />
            <span>{score.alerta_autossabotagem}</span>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        {SLOT_KEYS.map((slot) => {
          const prato = cardapio[slot];
          return (
            <div key={slot} className="card-cozy flex items-center gap-3 px-4 py-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-cocoa-soft">{SLOT_LABELS[slot]}</p>
                <p className="font-heading text-base font-bold">{prato.prato}</p>
                <p className="text-xs text-cocoa-soft">
                  {prato.calorias} kcal · {prato.proteina_g}g proteína
                </p>
              </div>
              {prato.travado && (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-butter text-cocoa">
                  <Lock size={16} />
                </span>
              )}
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-bold">Roteiro de preparo — domingo</h2>
        <ol className="card-cozy flex flex-col gap-3 px-5 py-4">
          {plan.roteiroPreparoDomingo.map((passo, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-bold text-white">
                {i + 1}
              </span>
              {passo}
            </li>
          ))}
        </ol>
      </section>

      <Link
        href={`/compras/${plan.id}`}
        className="btn-cozy flex items-center justify-center gap-2 bg-terracotta px-6 py-4 text-white"
      >
        <ShoppingBasket size={18} />
        Ver lista de compras
      </Link>
    </div>
  );
}
