import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.blacklistIngredient.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";

  if (!nome) {
    return NextResponse.json({ error: "nome é obrigatório" }, { status: 400 });
  }

  const item = await prisma.blacklistIngredient.upsert({
    where: { nome },
    update: {},
    create: { nome },
  });

  return NextResponse.json(item, { status: 201 });
}
