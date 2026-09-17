# Responsiveness Check — pedido-web-server

**Date:** 2026-09-17
**Method:** Live Playwright browser testing (Chromium, viewport resize)
**Breakpoints tested:** 320px, 375px, 768px, 1024px
**Pages tested:** /auth, /app/dashboard, /app/customers, /app/products, /app/budgets, /app/pre-sales, /app/sales

---

## Root Cause (CRITICAL)

`tailwind.config.ts` **replaces** Tailwind's default `screens` object. The standard breakpoints `sm`, `md`, `lg`, `xl`, `2xl` are **not defined**. All responsive classes using these prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`, `max-sm:`, `max-md:`) generate **no CSS** and are dead code.

Only custom breakpoints exist:
- `tablet`: `(max-width:800px) and (orientation:portrait) OR (max-width:1340px) and (orientation:landscape)`
- `tablet-portrait`: `(max-width:800px) and (orientation:portrait)`
- `tablet-landscape`: `(max-width:1340px) and (orientation:landscape)`

**Impact:** Any component relying on `md:` or `sm:` for responsive behavior is non-functional. The `tablet` breakpoint matches phones AND 1280px laptops in landscape, making it unusable as a "mobile" breakpoint.

---

## 8-Check Matrix

| # | Check | /auth | /app/dashboard | /app/customers | /app/products | /app/budgets | /app/pre-sales | /app/sales |
|---|-------|-------|----------------|----------------|---------------|--------------|----------------|------------|
| 1 | No horizontal overflow | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 2 | Sidebar collapses on mobile | N/A | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| 3 | Tables scrollable on mobile | N/A | N/A | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| 4 | Cards stack on mobile | N/A | **FAIL** | N/A | N/A | N/A | N/A | N/A |
| 5 | Text readable (no truncation) | PASS | PASS | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| 6 | Touch targets >= 44px | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 7 | No hydration errors | N/A | PASS | **FAIL** | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| 8 | Header not cramped | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

**Legend:** PASS = works correctly, FAIL = broken, N/A = not applicable

---

## Detailed Findings

### 1. Sidebar Never Collapses (ALL app pages)

**Severity:** CRITICAL

The `<nav>` sidebar has `w-52` (208px) as its base width. The collapse mechanism uses `md:w-14` which is dead (no `md` breakpoint defined). The `onMouseOut` handler is mouse-only (no touch equivalent).

**Measured widths:**

| Viewport | Sidebar px | % of viewport |
|----------|-----------|---------------|
| 320px | 119px | 37% |
| 375px | 124-128px | 33-34% |
| 768px | 162-163px | 21% |
| 1024px | 172-173px | 17% |

The sidebar flex-shrinks but never collapses to icon-only. At 320px, 37% of the screen is consumed by navigation, leaving only ~190px for content.

**File:** `src/components/NavBar/index.tsx`

---

### 2. Tables Crushed on Mobile (customers, products, budgets, pre-sales, sales)

**Severity:** CRITICAL

All data tables use `table-fixed` + `overflow-x-hidden` (base class). The `overflow-x-auto` that should enable horizontal scrolling is gated behind `md:` (dead). At 320px, 5-7 columns are forced into ~166px of space.

**Measured table widths:**

| Viewport | Table px | Columns | Readable? |
|----------|---------|---------|-----------|
| 320px | 166px | 5-7 | NO — headers merge, values 2-3 chars |
| 375px | 213px | 5-7 | NO — same issue |
| 768px | 575px | 5-7 | Marginal |
| 1024px | 821px | 5-7 | Yes |

**Visual evidence (320px):**
- Headers render as "CÓDONOMBLOQCIDAAÇÕ" (merged string)
- Cell values show as "8...", "1...", "S...", "7..." (truncated)
- No horizontal scrollbar visible

**Files:**
- `src/components/CustomDataTable/index.tsx` — `table-fixed`, `overflow-x-hidden`
- `src/components/CustomDataTable/TableRowHeaderCell/index.tsx` — dead `max-sm:hidden`

---

### 3. Dashboard Cards Always Single Column

**Severity:** MEDIUM

Cards use `tablet:flex-col` which matches ALL viewports (phones + landscape laptops up to 1340px). Even at 1024px, cards remain in a single column instead of a grid.

**Expected:** 1 col (mobile) → 2 col (tablet) → 3-4 col (desktop)
**Actual:** 1 col at ALL widths

**File:** `src/app/app/dashboard/page.tsx`

---

### 4. Hydration Errors (customers, products, budgets, pre-sales, sales)

**Severity:** HIGH

5 hydration errors on every table page: `<div>` rendered inside `<tbody>` (invalid HTML). React falls back to client rendering, causing a flash and console errors.

**Console output:**
```
Warning: <div> cannot appear as a child of <tbody>.
Switched to client rendering because the server HTML was invalid.
```

**File:** `src/components/CustomDataTable/index.tsx` — renders a `<div>` wrapper inside `<tbody>`

---

### 5. /auth Page — Works Correctly

**Severity:** N/A (positive finding)

The login page uses `w-[400px] h-[500px]` base with `tablet-portrait:w-[90vw]` override. At 320/375px the form box is 90vw, no overflow, all elements readable. This is the only page that works correctly on mobile.

---

## Summary of Issues by Priority

| Priority | Issue | Pages affected | Fix |
|----------|-------|----------------|-----|
| P0 | Add standard Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) to `tailwind.config.ts` | ALL | Add default screens alongside custom ones |
| P0 | Enable horizontal scroll on tables for mobile | customers, products, budgets, pre-sales, sales | Change `overflow-x-hidden` to `overflow-x-auto` at base, or add `tablet-portrait:overflow-x-auto` |
| P1 | Fix sidebar collapse for touch/mobile | ALL app pages | Add touch handler or CSS-only collapse at `max-md` |
| P1 | Fix hydration: remove `<div>` from `<tbody>` | customers, products, budgets, pre-sales, sales | Use `<tr>` with colSpan or move div outside table |
| P2 | Fix dashboard card grid | dashboard | Replace `tablet:flex-col` with proper `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| P2 | Remove dead `md:`/`sm:`/`max-sm:` classes or make them functional | multiple | Audit all responsive classes after adding breakpoints |

---

## Screenshots

All screenshots saved to `.playwright-mcp/shots/`:

| Page | 320px | 375px | 768px | 1024px |
|------|-------|-------|-------|--------|
| /auth | `auth-320.png` | `auth-375.png` | `auth-768.png` | — |
| /app/dashboard | `dashboard-320.png` | `dashboard-375.png` | `dashboard-768.png` | `dashboard-1024.png` |
| /app/customers | `customers-320.png` | `customers-375.png` | `customers-768.png` | `customers-1024.png` |
| /app/products | `products-320.png` | `products-375.png` | `products-768.png` | `products-1024.png` |
| /app/budgets | `budgets-320.png` | `budgets-375.png` | `budgets-768.png` | `budgets-1024.png` |
| /app/pre-sales | `pre-sales-320.png` | `pre-sales-375.png` | `pre-sales-768.png` | `pre-sales-1024.png` |
| /app/sales | `sales-320.png` | `sales-375.png` | `sales-768.png` | `sales-1024.png` |
