import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ComprasIndexPage() {
  const latest = await prisma.weeklyPlan.findFirst({
    where: { status: "READY" },
    orderBy: { createdAt: "desc" },
  });

  if (latest) {
    redirect(`/compras/${latest.id}`);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-5 pt-16 text-center">
      <p className="font-heading text-xl font-bold">Nenhuma lista ainda</p>
      <p className="text-sm text-cocoa-soft">
        Planeje sua semana pra gerar a lista de compras automaticamente.
      </p>
      <Link href="/planejar" className="btn-cozy bg-terracotta px-6 py-3 text-white">
        Planejar semana
      </Link>
    </div>
  );
}
