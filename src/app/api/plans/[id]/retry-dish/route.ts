import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { regenerateDish } from "@/lib/anthropic";
import { retryDishInputSchema, CardapioSemanal, SLOT_KEYS, SLOT_LABELS } from "@/lib/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = retryDishInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { slot, excluded } = parsed.data;

  const plan = await prisma.weeklyPlan.findUnique({
    where: { id },
    include: { shoppingItems: true },
  });

  if (!plan || plan.status !== "READY" || !plan.cardapioSemanal) {
    return NextResponse.json({ error: "Cardápio não encontrado ou ainda não está pronto." }, { status: 404 });
  }

  const cardapio = plan.cardapioSemanal as CardapioSemanal;
  const alvo = cardapio[slot];

  if (alvo.travado) {
    return NextResponse.json(
      { error: "Esse prato está travado com cadeado e não pode ser trocado." },
      { status: 400 }
    );
  }

  const blacklist = await prisma.blacklistIngredient.findMany({ orderBy: { nome: "asc" } });
  const blacklistNames = Array.from(new Set([...blacklist.map((b) => b.nome), ...plan.extraVetos]));

  const outrosPratosDaSemana = SLOT_KEYS.filter((s) => s !== slot).map((s) => ({
    horario: SLOT_LABELS[s],
    prato: cardapio[s].prato,
  }));

  try {
    const resultado = await regenerateDish({
      slot,
      nutritionalObjective: plan.nutritionalObjective,
      fixedHelloFresh: plan.fixedHelloFresh,
      fixedPicard: plan.fixedPicard,
      outrosPratosDaSemana,
      excluidos: Array.from(new Set([...excluded, alvo.prato])),
      blacklist: blacklistNames,
      listaComprasAtual: plan.shoppingItems.map((item) => item.nome),
      roteiroAtual: plan.roteiroPreparoDomingo,
    });

    const cardapioAtualizado: CardapioSemanal = {
      ...cardapio,
      [slot]: {
        prato: resultado.prato,
        calorias: resultado.calorias,
        proteina_g: resultado.proteina_g,
        travado: false,
      },
    };

    // Reconcilia a lista de compras preservando id e "já tenho" dos itens que não mudaram
    // (a IA foi instruída a repetir o texto exato dos itens não afetados pela troca).
    const itensAtuaisPorNome = new Map(
      plan.shoppingItems.map((item) => [item.nome.toLowerCase(), item])
    );
    const novosNomes = new Set(resultado.lista_compras_mercado.map((nome) => nome.toLowerCase()));

    const idsParaRemover = plan.shoppingItems
      .filter((item) => !novosNomes.has(item.nome.toLowerCase()))
      .map((item) => item.id);

    const nomesParaCriar = resultado.lista_compras_mercado.filter(
      (nome) => !itensAtuaisPorNome.has(nome.toLowerCase())
    );

    await prisma.$transaction([
      prisma.weeklyPlan.update({
        where: { id },
        data: {
          cardapioSemanal: cardapioAtualizado,
          roteiroPreparoDomingo: resultado.roteiro_preparo_domingo,
        },
      }),
      ...(idsParaRemover.length
        ? [prisma.shoppingListItem.deleteMany({ where: { id: { in: idsParaRemover } } })]
        : []),
      ...(nomesParaCriar.length
        ? [
            prisma.shoppingListItem.createMany({
              data: nomesParaCriar.map((nome) => ({ weeklyPlanId: id, nome })),
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      prato: cardapioAtualizado[slot],
      roteiroPreparoDomingo: resultado.roteiro_preparo_domingo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar um novo prato.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
