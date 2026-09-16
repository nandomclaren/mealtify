import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardapioSemanal, ScoreAtrito } from "@/lib/schema";
import { ShoppingBasket, TriangleAlert } from "lucide-react";
import { CardapioInterativo } from "./CardapioInterativo";

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

      <CardapioInterativo
        planId={plan.id}
        initialCardapio={cardapio}
        initialRoteiro={plan.roteiroPreparoDomingo}
      />

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
