import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.householdProfile.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const nutritionalObjective =
    typeof body.nutritionalObjective === "string" ? body.nutritionalObjective.trim() : "";

  if (!nutritionalObjective) {
    return NextResponse.json({ error: "nutritionalObjective é obrigatório" }, { status: 400 });
  }

  const profile = await prisma.householdProfile.upsert({
    where: { id: "singleton" },
    update: { nutritionalObjective },
    create: { id: "singleton", nutritionalObjective },
  });

  return NextResponse.json(profile);
}
