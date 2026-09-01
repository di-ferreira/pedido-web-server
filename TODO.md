# TODO — Correção do limite de compra (CARTEIRA)

## Contexto
Clientes **sem** limite de compra estavam sendo bloqueados por uma checagem de
limite falsa. A flag decisória é `CARTEIRA`:

- `CARTEIRA='S'` = **COM** limite → checar saldo disponível; se `TOTAL > SaldoCompra`,
  não avança e emite liberação `LIMITE`.
- `CARTEIRA='N'` = **SEM** limite → sem checagem de limite; condições de pagamento
  **somente à vista** (`PARCELAS=1`).

`INADIMPLENCIA` e `BLOQUEADO` continuam valendo para todos os clientes.

## Tarefas

### 1. Centralizar a flag `UsaLimite`
- [x] Adicionar `UsaLimite: boolean` em `iFinanceiroCliente` (`src/@types/Cliente.d.ts`)
- [x] Retornar `UsaLimite` (derivado de `CARTEIRA`) em `GetFinanceiroCliente` (`src/app/actions/cliente.ts`)

### 2. Corrigir bloqueio por limite — orçamento e pré-venda
- [x] `src/components/budgets/budgetItens/DataTable/index.tsx`: portar por `UsaLimite` + `TOTAL > SaldoCompra`
- [x] `src/components/preSale/FormEditPreSale.tsx`: portar por `UsaLimite` + `TOTAL > SaldoCompra` e ajustar a mensagem `LIMITE`

### 3. Corrigir bloqueio por limite — clientes
- [x] `src/components/customers/DataTable/index.tsx`: portar por `UsaLimite` + `SaldoCompra <= 0`
- [x] `src/app/app/customers/[id]/page.tsx`: portar por `CARTEIRA === 'S'` + `SaldoCompra <= 0`

### 4. Restringir condição de pagamento "à vista" (cliente sem limite)
- [x] `src/app/actions/preVenda.ts`: parâmetro `somenteAvista` em `SQL_CONDICAO_PGTO` + `GetCondicaoPGTO`
- [x] `src/components/preSale/FormEditPreSale.tsx`: passar `somenteAvista` quando `CARTEIRA === 'N'`

### 5. Verificação
- [x] `yarn build` — ✓ compilou + type-check OK (12/12 páginas)
- [ ] `yarn lint` — bloqueado: o projeto não tem config de ESLint (`next lint` abre prompt interativo). Validado via type-check do build.
