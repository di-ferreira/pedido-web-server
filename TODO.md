# TODO — Melhoria do pedido-web-server

## Contexto
Plano de melhoria abrangente do sistema (segurança, bugs, lógica, dados, design,
frontend, qualidade e tooling), com estratégia de testes (Vitest unit/integração,
Playwright E2E contra API de staging, SAST) para validar cada mudança.

## Decisões
- **Escopo**: tudo, em ordem de prioridade (alta → baixa).
- **Dados**: manter Server Actions + Zustand (extrair fetch + selectors).
- **Identidade visual**: alinhar à oficial EMSoft (Poppins, `--em-*`, `#1552C4`, toggle).
- **Testes**: Vitest (unit + integração) + Playwright (E2E, API de staging real).
- **Segurança**: testes de integração + SAST (semgrep/eslint-security) + `yarn audit`.
- **Git**: commits diretos em `master`, 1 commit Conventional por workstream (skill git-workflow).

## Regras por mudança
1. Validar: `yarn check` (lint + test + build) + `yarn audit` + `yarn semgrep`; E2E via `yarn test:e2e`.
2. Commit: 1 commit Conventional (`<type>(<scope>): <descrição pt-BR>`) direto em `master`.

## Tarefas

### Fase 0 — Infra de testes + git workflow ✅
- [x] Vitest + `@vitest/coverage-v8` + `vitest.config.ts` + scripts `test`/`test:coverage`
- [x] Playwright + `@axe-core/playwright` + `playwright.config.ts` + script `test:e2e`
- [x] SAST: `eslint-plugin-security` (regras de alto sinal) + `semgrep` (uv) + `npm audit`
- [x] Script `check` (lint + test + build)
- [x] Git workflow: `.gitmessage` (Conventional Commits) + pre-commit hook (segredos) via `core.hooksPath` + `postinstall`
- [x] `.gitignore`: `test-results/`, `playwright-report/`
- [x] Teste smoke (Vitest) + teste unit do `ODataQueryBuilder` (10 testes)

### Fase 1 — Alta (segurança + bugs + lógica)
- [x] **Segurança**: validar sessão nas Server Actions (fail-fast sem token) + teste integração (401)
- [x] **Segurança**: sanitizar filtros OData (`ODataQueryBuilder`) + testes unit (escaping/injeção)
- [x] **Segurança**: parametrizar/validar `SelectSQL` + teste integração (injeção SQL)
- [x] **Segurança**: mover hash de senha p/ servidor + teste (login; bcryptjs fora do bundle)
- [x] **Bug**: corrigir `ResponseType` (error objeto) + checar status antes do body + testes
- [x] **Lógica**: centralizar `SaldoCompra` + regra de bloqueio em 1 helper + testes unit
- [x] **Bug**: corrigir bugs pontuais (budgets/[id], ErrorMessage, Saldo NaN) + testes de regressão

### Fase 2 — Média (dados + design + front + qualidade)
- [x] **Dados**: `CustomFetch` (Authorization + timeout + ResponseType) + testes unit
- [x] **Dados**: eliminar N+1 (`RemoverOrcamento`) + fetches redundantes + teste (contagem de calls)
- [x] **Dados**: extrair fetch das stores + selectors (manter Server Actions + Zustand) + testes
- [ ] **Design**: alinhar identidade oficial EMSoft (Poppins, `--em-*`, `#1552C4`, toggle) + E2E (tema) + a11y
- [ ] **Design**: acessibilidade (ARIA, modal dialog, botões, labels) + E2E (axe-core) + teste focus trap
- [ ] **Design**: responsividade (w-screen, w-96, breakpoints, h-screen) + E2E (sweep de viewports)
- [x] **Front**: remover código morto (DataTable TanStack, fetchClient, modalStore, 6 deps) + build verde
- [x] **Front**: adicionar error boundaries (error.tsx/global-error.tsx) + E2E (estado de erro)
- [ ] **Front**: decompor componentes >300 linhas + eliminar duplicação + E2E de regressão
- [ ] **Qualidade**: tipagem (remover any, iVendedor duplicado, PreVenda.d.ts) + typecheck

### Fase 3 — Baixa (tooling)
- [ ] Config (exhaustive-deps, moduleResolution, deps) + CI (lint+test+build+audit+semgrep)
