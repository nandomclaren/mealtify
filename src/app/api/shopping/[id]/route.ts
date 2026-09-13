import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (typeof body.jaTenho !== "boolean") {
    return NextResponse.json({ error: "jaTenho (boolean) é obrigatório" }, { status: 400 });
  }

  const item = await prisma.shoppingListItem
    .update({ where: { id }, data: { jaTenho: body.jaTenho } })
    .catch(() => null);

  if (!item) {
    return NextResponse.json({ error: "item não encontrado" }, { status: 404 });
  }

  return NextResponse.json(item);
}
