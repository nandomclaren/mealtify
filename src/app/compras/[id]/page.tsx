import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShoppingList } from "@/components/ShoppingList";

export default async function ComprasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await prisma.weeklyPlan.findUnique({
    where: { id },
    include: { shoppingItems: true },
  });

  if (!plan) notFound();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-8 pb-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Lista de compras</h1>
          <p className="text-sm text-cocoa-soft">Toca pra marcar o que já está na sacola.</p>
        </div>
        <Link href={`/cardapio/${plan.id}`} className="text-sm font-semibold text-terracotta">
          ver cardápio
        </Link>
      </header>

      <ShoppingList
        initialItems={plan.shoppingItems.map((item) => ({
          id: item.id,
          nome: item.nome,
          jaTenho: item.jaTenho,
        }))}
      />
    </div>
  );
}
