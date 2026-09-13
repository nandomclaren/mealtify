import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { GeneratePlanInput, weeklyPlanAIResponseSchema, WeeklyPlanAIResponse } from "./schema";

const client = new Anthropic();

function buildPrompt(input: GeneratePlanInput, blacklist: string[]) {
  const vetosCompletos = Array.from(new Set([...blacklist, ...input.extraVetos]));

  return `Você é um nutricionista esportivo especializado em engenharia de batch cooking (preparo de marmitas em lote) e otimização logística doméstica.
Seu objetivo é planejar os almoços de Segunda a Quarta e duas refeições de Sábado, compensando os pratos fixos contratados, respeitando eventuais pratos que o usuário já travou com o "cadeado" e EXCLUINDO terminantemente ingredientes vetados.

DADOS DE ENTRADA:
- Objetivo nutricional: ${JSON.stringify(input.nutritionalObjective)}
- Refeições Fixas Jantar (HelloFresh): ${JSON.stringify(input.fixedHelloFresh)}
- Refeições Fixas Outros (Picard): ${JSON.stringify(input.fixedPicard)}
- Pratos Travados pelo Usuário (Cadeado): ${JSON.stringify(input.lockedDishes)}
- Ingredientes Vetados / Blacklist Familiar: ${JSON.stringify(vetosCompletos)}

DIRETRIZES DE CALIBRAGEM NUTRICIONAL E CULINÁRIA:
1. VETO ABSOLUTO (BLACKLIST): É terminantemente PROIBIDO sugerir pratos ou incluir na lista de compras qualquer ingrediente citado na lista de "Ingredientes Vetados", incluindo derivados diretos ou miúdos/proteínas exóticas que gerem atrito alimentar na casa.
2. COMPENSAÇÃO ATIVA: Analise a densidade dos pratos fixos. Se o HelloFresh/Picard tiver predominância de massas, queijos pesados, frituras ou sódio, os almoços de Seg a Qua DEVEM ser obrigatoriamente leves, hiperproteicos (mínimo 35g de proteína magra comum: frango, patinho, ovos, peixe branco simples) e vegetais de digestão fácil.
3. TETO CALÓRICO: Almoços de dia de semana devem mirar estritamente entre 500 kcal e 650 kcal por porção.
4. TRATAMENTO DE PRATOS TRAVADOS (CADEADO):
   - Mantenha rigorosamente os pratos travados pelo usuário ("travado": true).
   - Para os slots livres, proponha opções que reaproveitem os mesmos métodos térmicos e ingredientes dos pratos travados para evitar panelas extras no domingo.
5. MÉTRICAS DE PREPARO (SCORE DE PREGUIÇA):
   - Tempo total de bancada no domingo: MÁXIMO 1h30.
   - Penalize combinações que exijam mais de 2 frentes térmicas simultâneas (ex: forno + 2 bocas de fogão).
6. LISTA DE COMPRAS:
   - Array simples de strings com os ingredientes necessários (com quantidades).
   - A lista DEVE estar ESTRITAMENTE em ordem alfabética de A a Z. Sem seções, categorias ou corredores de mercado.

Responda preenchendo exatamente o schema fornecido.`;
}

export async function generateWeeklyPlan(
  input: GeneratePlanInput,
  blacklist: string[]
): Promise<WeeklyPlanAIResponse> {
  const prompt = buildPrompt(input, blacklist);

  const message = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
    output_config: {
      format: zodOutputFormat(weeklyPlanAIResponseSchema),
    },
  });

  if (!message.parsed_output) {
    throw new Error("A IA não retornou um cardápio em formato válido.");
  }

  return message.parsed_output;
}
