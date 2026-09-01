import { iItensOrcamento, iOrcamento } from '@/@types/Orcamento';

export function selectTotalBudget(orc: iOrcamento | undefined): number {
  if (!orc?.ItensOrcamento) return 0;
  return orc.ItensOrcamento.reduce(
    (sum, item) => sum + (item.TOTAL ?? 0),
    0,
  );
}

export function selectItemCount(orc: iOrcamento | undefined): number {
  return orc?.ItensOrcamento?.length ?? 0;
}

export function selectItemByProduct(
  orc: iOrcamento | undefined,
  produto: string,
): iItensOrcamento | undefined {
  return orc?.ItensOrcamento?.find((i) => i.PRODUTO?.PRODUTO === produto);
}
