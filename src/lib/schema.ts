import { z } from "zod";

export const SLOT_KEYS = [
  "segunda_almoco",
  "terca_almoco",
  "quarta_almoco",
  "sabado_refeicao_1",
  "sabado_refeicao_2",
] as const;

export type SlotKey = (typeof SLOT_KEYS)[number];

export const SLOT_LABELS: Record<SlotKey, string> = {
  segunda_almoco: "Segunda · Almoço",
  terca_almoco: "Terça · Almoço",
  quarta_almoco: "Quarta · Almoço",
  sabado_refeicao_1: "Sábado · Refeição 1",
  sabado_refeicao_2: "Sábado · Refeição 2",
};

export const OBJETIVOS_NUTRICIONAIS = [
  "Reduzir gordura e maximizar proteína",
  "Ganho de massa muscular",
  "Manutenção e equilíbrio",
  "Reeducação alimentar leve",
] as const;

export const VETOS_SUGERIDOS = [
  "Frutos do mar",
  "Miúdos",
  "Carne suína",
  "Coentro",
  "Fígado",
  "Camarão",
] as const;

export const pratoSlotSchema = z.object({
  prato: z.string().describe("Nome do prato sugerido para esse horário"),
  calorias: z.number().describe("Calorias estimadas da porção"),
  proteina_g: z.number().describe("Gramas de proteína da porção"),
  travado: z.boolean().describe("true se esse prato foi travado pelo usuário com o cadeado"),
});

export const cardapioSemanalSchema = z.object({
  segunda_almoco: pratoSlotSchema,
  terca_almoco: pratoSlotSchema,
  quarta_almoco: pratoSlotSchema,
  sabado_refeicao_1: pratoSlotSchema,
  sabado_refeicao_2: pratoSlotSchema,
});

export const scoreAtritoSchema = z.object({
  tempo_estimado_cozinha_minutos: z.number(),
  panelas_utilizadas: z.number(),
  nivel_complexidade: z.enum(["Baixo", "Médio", "Alto"]),
  alerta_autossabotagem: z.string().nullable(),
});

export const weeklyPlanAIResponseSchema = z.object({
  diagnostico_compensacao: z.string(),
  score_atrito: scoreAtritoSchema,
  cardapio_semanal: cardapioSemanalSchema,
  roteiro_preparo_domingo: z.array(z.string()),
  lista_compras_mercado: z.array(z.string()),
});

export type WeeklyPlanAIResponse = z.infer<typeof weeklyPlanAIResponseSchema>;
export type ScoreAtrito = z.infer<typeof scoreAtritoSchema>;
export type CardapioSemanal = z.infer<typeof cardapioSemanalSchema>;
export type PratoSlot = z.infer<typeof pratoSlotSchema>;

export const lockedDishSchema = z.object({
  slot: z.enum(SLOT_KEYS),
  prato: z.string().min(1),
});

export type LockedDish = z.infer<typeof lockedDishSchema>;

export const generatePlanInputSchema = z.object({
  nutritionalObjective: z.string().min(1),
  fixedHelloFresh: z.array(z.string()),
  fixedPicard: z.array(z.string()),
  lockedDishes: z.array(lockedDishSchema),
  extraVetos: z.array(z.string()),
});

export type GeneratePlanInput = z.infer<typeof generatePlanInputSchema>;

export const retryDishSchema = pratoSlotSchema.omit({ travado: true }).extend({
  lista_compras_mercado: z
    .array(z.string())
    .describe(
      "Lista de compras COMPLETA e atualizada da semana inteira, em ordem alfabética, já refletindo a troca deste prato (itens não afetados devem manter o texto idêntico ao da lista atual)"
    ),
  roteiro_preparo_domingo: z
    .array(z.string())
    .describe(
      "Roteiro de preparo de domingo COMPLETO e atualizado, já refletindo a troca deste prato (passos não afetados devem manter o texto idêntico ao roteiro atual)"
    ),
});
export type RetryDishResult = z.infer<typeof retryDishSchema>;

export const retryDishInputSchema = z.object({
  slot: z.enum(SLOT_KEYS),
  excluded: z.array(z.string()).default([]),
});
export type RetryDishInput = z.infer<typeof retryDishInputSchema>;
