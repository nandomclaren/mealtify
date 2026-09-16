-- CreateTable
CREATE TABLE "HelloFreshDish" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "vezesUsado" INTEGER NOT NULL DEFAULT 1,
    "ultimoUso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelloFreshDish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HelloFreshDish_nome_key" ON "HelloFreshDish"("nome");
