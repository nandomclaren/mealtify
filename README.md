# Mealtify

Planejamento semanal de almoços e batch cooking, pensado para ser instalado como PWA no celular.
Você conta o que já está fixo na semana (HelloFresh/Picard), tranca os pratos que já decidiu, e
uma IA (Claude, via API da Anthropic) monta o resto do cardápio, o roteiro de preparo de domingo e
a lista de compras — respeitando o veto de ingredientes da família.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS** — front-end e API routes num só projeto.
- **Prisma + PostgreSQL** — persistência do perfil da casa, veto de ingredientes, cardápios
  gerados e lista de compras.
- **Anthropic SDK (`@anthropic-ai/sdk`)** — geração do cardápio semanal via `claude-opus-5`,
  com output estruturado (JSON validado por `zod`) direto no schema do app.

Sem login — é um app de uso pessoal/família, com um único perfil compartilhado.

## Setup local

1. Copie `.env.example` para `.env` e preencha:
   - `DATABASE_URL`: string de conexão do Postgres.
   - `ANTHROPIC_API_KEY`: chave da API da Anthropic ([console.anthropic.com](https://console.anthropic.com)).
2. Instale as dependências e gere o Prisma Client:
   ```bash
   npm install
   ```
   (`postinstall` já roda `prisma generate` automaticamente.)
3. Aplique as migrations no banco:
   ```bash
   npx prisma migrate dev
   ```
4. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Abra [http://localhost:3000](http://localhost:3000).

## Deploy no Railway

1. Crie um serviço **PostgreSQL** no seu projeto Railway (se ainda não tiver um).
2. Crie o serviço do app apontando para este repositório.
3. Nas variáveis de ambiente do serviço do app, configure:
   - `DATABASE_URL` → copie da aba "Connect" do serviço Postgres (ou referencie a variável do
     Postgres direto, ex: `${{Postgres.DATABASE_URL}}`).
   - `ANTHROPIC_API_KEY` → sua chave da API da Anthropic.
4. Build command: `npm run build` (padrão).
5. Start command: `npm run start` — esse script já roda `prisma migrate deploy` antes de subir o
   servidor, então as migrations são aplicadas automaticamente a cada deploy.

## Instalar como PWA

O app tem manifest + service worker prontos. No Chrome (Android ou desktop), abra o site e use
"Adicionar à tela inicial" / "Instalar app". No iOS Safari, use "Compartilhar → Adicionar à Tela de
Início".

## Estrutura

- `src/app/perfil` — objetivo nutricional + veto permanente de ingredientes da casa.
- `src/app/planejar` — wizard semanal: pratos fixos, pratos travados (cadeado) e vetos da semana.
  Ao gerar, chama `POST /api/plans/generate`, que monta o prompt, chama a Claude API e grava o
  resultado no banco.
- `src/app/cardapio/[id]` — cardápio gerado, score de atrito e roteiro de preparo de domingo.
- `src/app/compras/[id]` — lista de compras interativa (itens pendentes em cima, marcados embaixo,
  ambos em ordem alfabética).
- `src/lib/anthropic.ts` — prompt do nutricionista + chamada à Claude API com output estruturado.
- `src/lib/schema.ts` — schemas `zod` compartilhados entre o front-end e a chamada de IA.
- `prisma/schema.prisma` — modelo de dados.
