-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'ERROR');

-- CreateTable
CREATE TABLE "HouseholdProfile" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nutritionalObjective" TEXT NOT NULL DEFAULT 'Reduzir gordura e maximizar proteína',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseholdProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlacklistIngredient" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlacklistIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPlan" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "nutritionalObjective" TEXT NOT NULL,
    "fixedHelloFresh" TEXT[],
    "fixedPicard" TEXT[],
    "lockedDishes" JSONB NOT NULL DEFAULT '[]',
    "extraVetos" TEXT[],
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "errorMessage" TEXT,
    "diagnosticoCompensacao" TEXT,
    "scoreAtrito" JSONB,
    "cardapioSemanal" JSONB,
    "roteiroPreparoDomingo" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingListItem" (
    "id" TEXT NOT NULL,
    "weeklyPlanId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "jaTenho" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistIngredient_nome_key" ON "BlacklistIngredient"("nome");

-- CreateIndex
CREATE INDEX "WeeklyPlan_createdAt_idx" ON "WeeklyPlan"("createdAt");

-- CreateIndex
CREATE INDEX "ShoppingListItem_weeklyPlanId_idx" ON "ShoppingListItem"("weeklyPlanId");

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_weeklyPlanId_fkey" FOREIGN KEY ("weeklyPlanId") REFERENCES "WeeklyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
