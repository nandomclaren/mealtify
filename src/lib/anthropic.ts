import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  GeneratePlanInput,
  weeklyPlanAIResponseSchema,
  WeeklyPlanAIResponse,
  retryDishSchema,
  RetryDishResult,
  SlotKey,
  SLOT_LABELS,
} from "./schema";

const client = new Anthropic();

const DIRETRIZES_SIMPLICIDADE = `SIMPLICIDADE OBRIGATÓRIA (a regra mais importante deste pedido): isso é almoço de dia a dia de um casal, comido sozinho em casa ou levado de marmita pro trabalho — NÃO é comida de ocasião especial. Técnicas básicas de preparo (cortar em cubos/tiras, temperar com sal/alho/páprica, grelhar, assar) são normais e NÃO tornam um prato complexo — o problema é a QUANTIDADE de componentes e etapas, não a técnica. É TERMINANTEMENTE PROIBIDO:
- Preparos com uma etapa extra de "finalização" ou molho feito à parte (ex: "finalizado com molho de iogurte grego", "ao molho de ervas finas", reduções, cremes à parte) — o tempero vai direto no prato, sem componente extra pra fazer.
- Pratos com 4 ou mais componentes separados no mesmo prato (ex: proteína + 2 acompanhamentos + molho à parte já são 4).
- Nomenclatura de cardápio de restaurante (termos como "confit", "crocante", "al dente" como diferencial, ou listar 3+ ingredientes de tempero no nome do prato).
Em vez disso, cada prato deve ter no máximo 3 componentes: 1 proteína + 1 carboidrato simples + 1 vegetal (o vegetal é opcional), temperados e preparados do jeito mais direto possível (grelhado, assado no forno, refogado, cozido, no vapor). Nomeie o prato de forma simples e direta, como alguém diria em casa (ex: "Frango grelhado com arroz e brócolis", "Patinho em cubos com purê de batata", "Omelete com legumes e torrada") — cortar em cubos, tiras ou fatias é só uma forma de corte, não um sinal de prato complexo.`;

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
2. ${DIRETRIZES_SIMPLICIDADE}
3. COMPENSAÇÃO ATIVA: Analise a densidade dos pratos fixos. Se o HelloFresh/Picard tiver predominância de massas, queijos pesados, frituras ou sódio, os almoços de Seg a Qua DEVEM ser obrigatoriamente leves, hiperproteicos (mínimo 35g de proteína magra comum: frango, patinho, ovos, peixe branco simples) e vegetais de digestão fácil.
4. TETO CALÓRICO: Almoços de dia de semana devem mirar estritamente entre 500 kcal e 650 kcal por porção.
5. TRATAMENTO DE PRATOS TRAVADOS (CADEADO):
   - Mantenha rigorosamente os pratos travados pelo usuário ("travado": true).
   - Para os slots livres, proponha opções que reaproveitem os mesmos métodos térmicos e ingredientes dos pratos travados para evitar panelas extras no domingo.
6. MÉTRICAS DE PREPARO (SCORE DE PREGUIÇA):
   - Tempo total de bancada no domingo: MÁXIMO 1h30.
   - Penalize combinações que exijam mais de 2 frentes térmicas simultâneas (ex: forno + 2 bocas de fogão).
7. LISTA DE COMPRAS:
   - Array simples de strings com os ingredientes necessários (com quantidades).
   - A lista DEVE estar ESTRITAMENTE em ordem alfabética de A a Z. Sem seções, categorias ou corredores de mercado.

Responda preenchendo exatamente o schema fornecido.`;
}

function friendlyParseError(error: unknown): Error {
  if (
    error instanceof Error &&
    /failed to parse structured output/i.test(error.message)
  ) {
    return new Error(
      "A resposta da IA veio incompleta (cortada no meio, provavelmente por causa do tamanho). Tenta de novo."
    );
  }
  return error instanceof Error ? error : new Error("Erro desconhecido ao falar com a IA.");
}

export async function generateWeeklyPlan(
  input: GeneratePlanInput,
  blacklist: string[]
): Promise<WeeklyPlanAIResponse> {
  const prompt = buildPrompt(input, blacklist);

  try {
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
  } catch (error) {
    throw friendlyParseError(error);
  }
}

export type RegenerateDishInput = {
  slot: SlotKey;
  nutritionalObjective: string;
  fixedHelloFresh: string[];
  fixedPicard: string[];
  outrosPratosDaSemana: { horario: string; prato: string }[];
  excluidos: string[];
  blacklist: string[];
  listaComprasAtual: string[];
  roteiroAtual: string[];
};

function buildRetryPrompt(input: RegenerateDishInput) {
  const ehFimDeSemana = input.slot.startsWith("sabado");

  return `Você é o mesmo nutricionista esportivo especializado em batch cooking de um pedido anterior. O usuário não gostou de UMA sugestão específica do cardápio e quer só uma alternativa pra esse horário — o restante da semana já está decidido e não deve ser mencionado ou alterado no cardápio.

Como esse prato muda, você também precisa atualizar a lista de compras e o roteiro de preparo de domingo — SÓ na parte que depende deste prato. Isso é crítico: a lista de compras e o roteiro alimentam um app que já está em uso, com itens da lista que o usuário pode já ter marcado como comprados. Se você reescrever um item ou passo que não mudou com um texto diferente (mesmo que equivalente), o app vai tratar como um item novo e o usuário perde a marcação.

DADOS DE ENTRADA:
- Horário a substituir: ${SLOT_LABELS[input.slot]}
- Objetivo nutricional: ${JSON.stringify(input.nutritionalObjective)}
- Refeições Fixas Jantar (HelloFresh): ${JSON.stringify(input.fixedHelloFresh)}
- Refeições Fixas Outros (Picard): ${JSON.stringify(input.fixedPicard)}
- Outros pratos já definidos essa semana (não repita o mesmo prato nem a mesma proteína+método de dois deles): ${JSON.stringify(input.outrosPratosDaSemana)}
- Pratos já rejeitados pelo usuário para esse horário (NÃO sugira nenhum desses de novo, nem uma variação óbvia): ${JSON.stringify(input.excluidos)}
- Ingredientes Vetados / Blacklist Familiar: ${JSON.stringify(input.blacklist)}
- Lista de compras ATUAL da semana (ainda inclui os ingredientes do prato que está sendo trocado): ${JSON.stringify(input.listaComprasAtual)}
- Roteiro de preparo de domingo ATUAL (ainda reflete o prato que está sendo trocado): ${JSON.stringify(input.roteiroAtual)}

DIRETRIZES PARA O NOVO PRATO:
1. VETO ABSOLUTO: proibido usar qualquer ingrediente da blacklist.
2. ${DIRETRIZES_SIMPLICIDADE}
3. ${
    ehFimDeSemana
      ? "Esse é um almoço de sábado: mire numa faixa calórica saudável e proteica, coerente com o objetivo nutricional, sem teto rígido."
      : "TETO CALÓRICO: esse é um almoço de dia de semana, mire estritamente entre 500 kcal e 650 kcal, com no mínimo 35g de proteína magra comum (frango, patinho, ovos, peixe branco simples)."
  }
4. Reaproveite, quando fizer sentido, os mesmos métodos térmicos e ingredientes já usados nos outros pratos da semana, pra não criar panela extra no domingo.

DIRETRIZES PARA A LISTA DE COMPRAS ATUALIZADA (lista_compras_mercado):
- Comece da lista ATUAL. Remova SOMENTE os ingredientes que eram exclusivos do prato antigo e não são usados por nenhum outro prato fixo/da semana. Se um ingrediente do prato antigo também é usado em outro prato, MANTENHA-O.
- Adicione os ingredientes novos exigidos pelo novo prato (com quantidade).
- Todo item que não tem relação com essa troca deve aparecer EXATAMENTE com o mesmo texto (mesma grafia, mesma quantidade) da lista atual — copie literalmente.
- Resultado final estritamente em ordem alfabética A-Z, sem seções.

DIRETRIZES PARA O ROTEIRO DE DOMINGO ATUALIZADO (roteiro_preparo_domingo):
- Comece do roteiro ATUAL. Ajuste apenas os passos que mencionam o prato antigo (ingrediente ou método de preparo dele).
- Todo passo que não tem relação com essa troca deve aparecer EXATAMENTE com o mesmo texto do roteiro atual — copie literalmente.
- Mantenha o limite de 1h30 de bancada e no máximo 2 frentes térmicas simultâneas.

Responda preenchendo exatamente o schema fornecido: o novo prato, a lista de compras completa atualizada e o roteiro completo atualizado.`;
}

export async function regenerateDish(input: RegenerateDishInput): Promise<RetryDishResult> {
  const prompt = buildRetryPrompt(input);

  try {
    const message = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 8000,
      output_config: {
        format: zodOutputFormat(retryDishSchema),
        effort: "low",
      },
      messages: [{ role: "user", content: prompt }],
    });

    if (!message.parsed_output) {
      throw new Error("A IA não conseguiu sugerir um novo prato agora.");
    }

    return message.parsed_output;
  } catch (error) {
    throw friendlyParseError(error);
  }
}
