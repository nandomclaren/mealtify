import { prisma } from "@/lib/prisma";
import { PerfilForm } from "./PerfilForm";

export default async function PerfilPage() {
  const [profile, blacklist] = await Promise.all([
    prisma.householdProfile.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
    prisma.blacklistIngredient.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pt-8 pb-4">
      <header>
        <h1 className="font-heading text-2xl font-bold">Perfil da casa</h1>
        <p className="text-sm text-cocoa-soft">
          Objetivo nutricional e a lista de ingredientes que nunca devem aparecer no cardápio.
        </p>
      </header>

      <PerfilForm
        initialObjective={profile.nutritionalObjective}
        initialBlacklist={blacklist.map((b) => ({ id: b.id, nome: b.nome }))}
      />
    </div>
  );
}
