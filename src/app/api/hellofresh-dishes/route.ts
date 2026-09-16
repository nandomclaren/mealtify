import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pratos = await prisma.helloFreshDish.findMany({
    orderBy: [{ vezesUsado: "desc" }, { ultimoUso: "desc" }],
    take: 200,
  });
  return NextResponse.json(pratos.map((p) => p.nome));
}

export async function POST(request: Request) {
  const body = await request.json();
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";

  if (!nome) {
    return NextResponse.json({ error: "nome é obrigatório" }, { status: 400 });
  }

  const existente = await prisma.helloFreshDish.findUnique({ where: { nome } });

  const prato = existente
    ? await prisma.helloFreshDish.update({
        where: { nome },
        data: { vezesUsado: { increment: 1 }, ultimoUso: new Date() },
      })
    : await prisma.helloFreshDish.create({ data: { nome } });

  return NextResponse.json(prato, { status: existente ? 200 : 201 });
}
