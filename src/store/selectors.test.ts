import { describe, it, expect } from 'vitest';
import {
  selectTotalBudget,
  selectItemCount,
  selectItemByProduct,
} from '@/store/selectors';
import { iOrcamento } from '@/@types/Orcamento';

const mockOrc: iOrcamento = {
  ORCAMENTO: 1,
  ItensOrcamento: [
    { PRODUTO: { PRODUTO: '101' }, TOTAL: 100 } as any,
    { PRODUTO: { PRODUTO: '102' }, TOTAL: 200 } as any,
    { PRODUTO: { PRODUTO: '103' }, TOTAL: 50 } as any,
  ],
} as iOrcamento;

describe('selectTotalBudget', () => {
  it('soma os totais dos itens', () => {
    expect(selectTotalBudget(mockOrc)).toBe(350);
  });

  it('retorna 0 para orçamento undefined', () => {
    expect(selectTotalBudget(undefined)).toBe(0);
  });

  it('retorna 0 para ItensOrcamento vazio', () => {
    expect(selectTotalBudget({ ItensOrcamento: [] } as iOrcamento)).toBe(0);
  });

  it('trata TOTAL undefined como 0', () => {
    const orc = {
      ItensOrcamento: [{ PRODUTO: { PRODUTO: 1 } } as any],
    } as iOrcamento;
    expect(selectTotalBudget(orc)).toBe(0);
  });
});

describe('selectItemCount', () => {
  it('retorna a quantidade de itens', () => {
    expect(selectItemCount(mockOrc)).toBe(3);
  });

  it('retorna 0 para orçamento undefined', () => {
    expect(selectItemCount(undefined)).toBe(0);
  });
});

describe('selectItemByProduct', () => {
  it('encontra o item pelo código do produto', () => {
    const item = selectItemByProduct(mockOrc, '102');
    expect(item?.PRODUTO?.PRODUTO).toBe('102');
    expect(item?.TOTAL).toBe(200);
  });

  it('retorna undefined para produto não encontrado', () => {
    expect(selectItemByProduct(mockOrc, '999')).toBeUndefined();
  });

  it('retorna undefined para orçamento undefined', () => {
    expect(selectItemByProduct(undefined, '101')).toBeUndefined();
  });
});
