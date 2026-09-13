import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeeklyPlan } from "@/lib/anthropic";
import { generatePlanInputSchema } from "@/lib/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = generatePlanInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;

  const blacklist = await prisma.blacklistIngredient.findMany({ orderBy: { nome: "asc" } });
  const blacklistNames = blacklist.map((item) => item.nome);

  const plan = await prisma.weeklyPlan.create({
    data: {
      nutritionalObjective: input.nutritionalObjective,
      fixedHelloFresh: input.fixedHelloFresh,
      fixedPicard: input.fixedPicard,
      lockedDishes: input.lockedDishes,
      extraVetos: input.extraVetos,
      status: "GENERATING",
    },
  });

  try {
    const result = await generateWeeklyPlan(input, blacklistNames);

    const [updated] = await prisma.$transaction([
      prisma.weeklyPlan.update({
        where: { id: plan.id },
        data: {
          status: "READY",
          diagnosticoCompensacao: result.diagnostico_compensacao,
          scoreAtrito: result.score_atrito,
          cardapioSemanal: result.cardapio_semanal,
          roteiroPreparoDomingo: result.roteiro_preparo_domingo,
        },
      }),
      prisma.shoppingListItem.createMany({
        data: result.lista_compras_mercado.map((nome) => ({
          weeklyPlanId: plan.id,
          nome,
        })),
      }),
    ]);

    const withItems = await prisma.weeklyPlan.findUnique({
      where: { id: updated.id },
      include: { shoppingItems: { orderBy: { nome: "asc" } } },
    });

    return NextResponse.json(withItems, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao gerar o cardápio.";
    await prisma.weeklyPlan.update({
      where: { id: plan.id },
      data: { status: "ERROR", errorMessage: message },
    });
    return NextResponse.json({ error: message, planId: plan.id }, { status: 502 });
  }
}
