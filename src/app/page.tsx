import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChefHat, ClipboardList, Sparkles } from "lucide-react";
import { ScoreAtrito } from "@/lib/schema";

export default async function HomePage() {
  const [profile, latestPlan] = await Promise.all([
    prisma.householdProfile.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
    prisma.weeklyPlan.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pt-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-terracotta text-white shadow-[var(--shadow-cozy)]">
          <ChefHat size={30} />
        </span>
        <h1 className="font-heading text-2xl font-bold">Mealtify</h1>
        <p className="text-sm text-cocoa-soft">
          Batch cooking e marmitas sem estresse, do jeito da sua casa.
        </p>
      </header>

      <div className="card-cozy px-5 py-4 text-sm text-cocoa-soft">
        Objetivo atual: <span className="font-semibold text-cocoa">{profile.nutritionalObjective}</span>
        <Link href="/perfil" className="ml-2 font-semibold text-terracotta">
          editar
        </Link>
      </div>

      {latestPlan && latestPlan.status === "READY" ? (
        <PlanoResumo plan={latestPlan} />
      ) : (
        <div className="card-cozy flex flex-col items-center gap-3 px-6 py-8 text-center">
          <Sparkles className="text-butter" size={32} />
          <p className="font-heading text-lg font-bold">Vamos planejar sua semana?</p>
          <p className="text-sm text-cocoa-soft">
            Conte os pratos fixos, tranque o que já decidiu e deixa a IA equilibrar o resto.
          </p>
          <Link href="/planejar" className="btn-cozy bg-terracotta px-6 py-3 text-white">
            Planejar semana
          </Link>
        </div>
      )}

      <Link
        href="/planejar"
        className="btn-cozy card-cozy flex items-center gap-3 px-5 py-4 text-left"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-deep">
          <ClipboardList size={20} className="text-terracotta" />
        </span>
        <span>
          <span className="block font-semibold">Planejar nova semana</span>
          <span className="block text-xs text-cocoa-soft">Pratos fixos, cadeados e vetos da semana</span>
        </span>
      </Link>
    </div>
  );
}

function PlanoResumo({
  plan,
}: {
  plan: { id: string; diagnosticoCompensacao: string | null; scoreAtrito: unknown };
}) {
  const score = plan.scoreAtrito as ScoreAtrito | null;

  return (
    <Link href={`/cardapio/${plan.id}`} className="card-cozy flex flex-col gap-3 px-5 py-5">
      <p className="font-heading text-lg font-bold">Cardápio da semana</p>
      {plan.diagnosticoCompensacao && (
        <p className="text-sm text-cocoa-soft">{plan.diagnosticoCompensacao}</p>
      )}
      {score && (
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-cream-deep px-3 py-1">
            🕒 {score.tempo_estimado_cozinha_minutos} min de domingo
          </span>
          <span className="rounded-full bg-cream-deep px-3 py-1">
            🍲 {score.panelas_utilizadas} panela(s)
          </span>
          <span className="rounded-full bg-cream-deep px-3 py-1">
            Complexidade {score.nivel_complexidade}
          </span>
        </div>
      )}
      <span className="font-semibold text-terracotta">ver cardápio completo →</span>
    </Link>
  );
}
