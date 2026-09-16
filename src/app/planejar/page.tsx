import { prisma } from "@/lib/prisma";
import { PlanejarWizard } from "./PlanejarWizard";

export default async function PlanejarPage() {
  const [profile, helloFreshDishes] = await Promise.all([
    prisma.householdProfile.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
    prisma.helloFreshDish.findMany({
      orderBy: [{ vezesUsado: "desc" }, { ultimoUso: "desc" }],
      take: 200,
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pt-8 pb-4">
      <header>
        <h1 className="font-heading text-2xl font-bold">Planejar a semana</h1>
        <p className="text-sm text-cocoa-soft">
          Conte o que já está fixo, tranque o que já decidiu e deixa o resto com a gente.
        </p>
      </header>

      <PlanejarWizard
        defaultObjective={profile.nutritionalObjective}
        initialHelloFreshSuggestions={helloFreshDishes.map((d) => d.nome)}
      />
    </div>
  );
}
