# AGENT.md — pedido-web-server

> Instruções para agentes de IA (LLM) que mantêm, geram ou refatoram código
> neste repositório. Descreve o que o projeto é, como funciona e as convenções
> obrigatórias.

## 1. Visão Geral

**EMSoft Pedido Web** — sistema web de orçamentos e pedidos para auto-peças.
Permite a vendedores consultar produtos, montar orçamentos e gerenciar clientes,
pré-vendas, vendas e liberações, integrando-se a uma API externa (OData).

- **Tipo**: aplicação Next.js (App Router) — front-end que consome API externa.
- **Idioma do domínio**: pt-BR (`Orcamento`, `Cliente`, `Produto`, `Vendedor`).
- **Moeda**: BRL (formatação `pt-BR`).

## 2. Stack

| Categoria        | Tecnologia                                            |
| ---------------- | ----------------------------------------------------- |
| Framework        | Next.js 14.2.6 (App Router, `output: 'standalone'`)   |
| Linguagem        | TypeScript (`strict: true`)                           |
| Estilo           | Tailwind CSS + shadcn/ui (Radix) + NextUI             |
| Estado (cliente) | Zustand                                               |
| Dados (cliente)  | SWR                                                   |
| Tabelas          | TanStack React Table                                  |
| PDF              | @react-pdf/renderer                                   |
| Gráficos         | ApexCharts / Recharts                                 |
| HTTP             | `fetch` nativo via `CustomFetch` (axios subutilizado) |
| Senhas           | bcryptjs                                              |
| Formatação       | dprint (`yarn format`)                                |
| Lint             | `next lint`                                           |

## 3. Comandos

```bash
yarn dev       # desenvolvimento (porta 3000)
yarn build     # build de produção
yarn start     # produção (porta 10016)
yarn lint      # next lint
yarn format    # dprint fmt (formata o código)
yarn analyze   # build com bundle analyzer (ANALYZE=true)
```

> Não há suíte de testes (sem Jest/Vitest no `package.json`).
> Valide com `yarn lint` + `yarn build` + teste manual.

## 4. Estrutura de Pastas

```
src/
├── app/                    # App Router (rotas, layouts, páginas)
│   ├── actions/            # ⭐ Server Actions ('use server') — camada de dados
│   │   ├── orcamento.ts    # orçamentos
│   │   ├── produto.ts      # produtos
│   │   ├── cliente.ts      # clientes
│   │   ├── preVenda.ts     # pré-vendas
│   │   ├── vendas.ts       # vendas
│   │   ├── liberacoes.ts   # liberações
│   │   ├── user.ts         # autenticação (login/logout)
│   │   └── index.ts        # helpers de cookie (setCookie/getCookie)
│   ├── auth/               # rota de login
│   └── app/                # área logada (dashboard, budgets, customers, ...)
├── components/             # componentes de UI
│   ├── ui/                 # primitivos shadcn/ui
│   └── <feature>/          # componentes por domínio (budgets, products, ...)
├── store/                  # ⭐ stores Zustand (useBudget, useProduct, useUser, useModal)
├── services/api.ts         # ⭐ CustomFetch (wrapper de fetch p/ API externa)
├── lib/
│   ├── queryFilter/        # ⭐ ODataQueryBuilder (monta queries OData)
│   ├── fetchClient/        # (legado — ver seção 8)
│   └── utils.ts            # cn(), hashing, máscaras, moeda, storage
├── @types/                 # tipos de domínio (iOrcamento, iProduto, ...)
├── constants/              # constantes (KEY_NAME_TOKEN, etc.)
└── middleware/             # ParseRoute (https→http)
```

## 5. Arquitetura e Fluxo de Dados

### 5.1 Fluxo principal (Server)

```
Página (Server Component)
  → Server Action (src/app/actions/*.ts, 'use server')
    → CustomFetch (src/services/api.ts)
      → API externa OData (process.env.EMSOFT_API)
```

### 5.2 Fluxo interativo (Client)

```
Componente ('use client')
  → Store Zustand (src/store/*)
    → Server Action (mesma camada de dados)
```

### 5.3 Padrões obrigatórios

- **Server Actions**: `'use server'` na 1ª linha; vivem em `src/app/actions/`.
- **Retorno padronizado**: `ResponseType<T>` = `{ value?: T; error?: { code, message } }`.
  Sempre retornar `{ value, error }` (não lançar para o UI tratar).
- **HTTP**: usar `CustomFetch<T>` de `@/services/api` — retorna
  `{ status, statusText, body }` e já prefixa `EMSOFT_API`.
- **Auth nas requisições**: header `Authorization: bearer ${tokenCookie}`
  (token via `getCookie('token')`).
- **Queries OData**: montar com `ODataQueryBuilder` + `ModelMetadata`
  (`string|number|date|boolean`), não concatenar strings.
- **Tipos de domínio**: prefixo `i` (`iOrcamento`, `iProduto`, `iCliente`) em `src/@types/`.

### 5.4 Autenticação / Sessão

- Login: `LoginUser` (actions/user.ts) → login do sistema → busca vendedor →
  `compareHash` (bcrypt) → `setCookie('token')` + `setCookie('user')`.
- Cookies httpOnly com prefixo `pedidoweb_` (`KEY_NAME_TOKEN`), expiração 120 min.
- Proteção de rotas: `SessionWrapper` lê `pedidoweb_token` e faz
  `redirect('/auth')` se ausente.
- ⚠️ `NEXTAUTH_URL`/`NEXTAUTH_SECRET` existem no `.env` mas **não são usados**
  (auth é própria por cookie).

### 5.5 Backend (API externa)

- A `EMSOFT_API` é um servidor **Delphi TMS XData** que expõe CRUD automático
  com sintaxe **OData** (`$filter`, `$orderby`, `$top`, `$skip`, `$expand`,
  `$select`, `$inlinecount`) + service operations (`/ServiceVendas/*`,
  `/ServiceSistema/*`).
- O `ODataQueryBuilder` (front) gera exatamente essa sintaxe.
- Persistência do backend: ORM **TMS Aurelius**.
- 📚 Contratos do backend documentados nas skills `delphi-tms-xdata` e
  `delphi-tms-aurelius` (`.ia/skills/`). Consultar antes de alterar queries.

## 6. Convenções de Código

- **Alias**: `@/*` → `./src/*` (sempre usar em imports internos).
- **Componentes**: PascalCase; features em `components/<feature>/`.
- **Stores**: hooks `useXxx` (`useBudget`, `useProduct`); exportados em `store/index.ts`.
- **Ações exportadas**: PascalCase (`GetOrcamentos`, `NewOrcamento`); internas camelCase.
- **UI**: pt-BR; moeda via `FormatToCurrency` (BRL); datas via `dayjs`.
- **Estilo**: Tailwind + `cn()` (clsx + tailwind-merge); cores da marca `emsoft_*`.
- **Commits**: Conventional Commits (`feat`, `fix`, `refactor`, `chore`, ...).
- **Formatação**: rodar `yarn format` (dprint) antes de commit.

## 7. Regras para o Agente (do-not)

- Não criar novo wrapper de HTTP — reutilizar `CustomFetch`.
- Não concatenar queries OData manualmente — usar `ODataQueryBuilder`.
- Não expor/commitar segredos (`.env` é gitignored; `example.env` é o template).
- Não adicionar dependências sem necessidade (axios já está subutilizado).
- Manter o padrão de retorno `ResponseType<T>` em todas as ações.

## 8. Achados do Review (dívida técnica / atenção)

1. **Dois wrappers de fetch**: `lib/fetchClient` (lê `cookies().get('token')`
   sem o prefixo `pedidoweb_` → quebraria) é **legado/não usado**. O padrão real
   é `CustomFetch` (`services/api.ts`). Não usar `fetchClient`.
2. **Server Actions sem revalidação de auth**: as ações confiam no cookie, mas
   não validam a sessão internamente (Server Actions são endpoints públicos).
   Ao adicionar mutações, validar token/usuário dentro da ação.
3. **Sem testes**: nenhum framework de teste; risco em refactors.
4. **Arquivos grandes** (candidatos a decomposição): `EditBudgetIten/FormEdit.tsx`
   (624), `customers/[id]/page.tsx` (599), `FormEditPreSale.tsx` (574),
   `actions/orcamento.ts` (518).
5. **`NEXTAUTH_*` órfãos**: variáveis de ambiente sem uso real.
6. **Tipagem frouxa pontual**: `any` em mapeamentos de filtro
   (ex.: `actions/orcamento.ts` → `filter.conditions.map((f: any) => ...)`).
7. **Identidade visual divergente**: o projeto usa fonte `Open_Sans` + paleta
   `emsoft_*` (`tailwind.config.ts`, ex.: azul `#063778`), que difere da skill
   `emsoft-identidade-visual` (fonte `Poppins`, tokens `--em-*`, azul `#1552C4`,
   botão de tema claro/escuro obrigatório). Alinhar se a identidade oficial for
   a referência.

## 9. Skills disponíveis (`.ia/skills/`)

Consultar a skill relevante antes de tarefas específicas.

**Front-end / Next.js / React**

- `next-best-practices`, `vercel-react-best-practices` — performance e padrões Next/React
- `typescript`, `typescript-clean-code` — qualidade e clean code TS
- `tailwindcss`, `shadcn` — estilização e componentes
- `frontend-design`, `frontend-engineer`, `web-design-guidelines` — UI/UX
- `check-fix-accessibility` — acessibilidade
- `emsoft-identidade-visual` — identidade visual oficial EMSoft (cores, Poppins, tema)

**Back-end (Delphi — API `EMSOFT_API`)**

- `delphi-tms-xdata` — framework REST/OData do servidor (contrato da API)
- `delphi-tms-aurelius` — ORM do backend

**Infra / Processo**

- `docker` — containerização (build usa `output: 'standalone'`)
- `git-workflow` — commits/branches (Conventional Commits)
- `software-architect` — decisões de arquitetura
