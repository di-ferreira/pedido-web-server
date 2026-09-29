import { describe, expect, it } from 'vitest';
import { iCondicaoPgtoApi } from '@/@types/PreVenda';
import {
  filtrarCondicoesPorValor,
  mapCondicaoPgto,
} from '@/lib/condicaoPgto';

const condicao = (
  overrides: Partial<iCondicaoPgtoApi> = {},
): iCondicaoPgtoApi => ({
  ID: 1,
  TABELA: '10',
  NOME: '10x SEM JUROS',
  Parcelas: 10,
  PZ01: 30,
  PZ02: 60,
  PZ03: 90,
  PZ04: 120,
  PZ05: 150,
  PZ06: 180,
  PZ07: 210,
  PZ08: 240,
  PZ09: 270,
  PZ10: 300,
  VALOR_PARCELA: 100,
  DESCONTO_MAX: 0,
  DESTACAR_DESCONTO: 'N',
  TIPO: 'V',
  FORMA: 'DINHEIRO',
  ...overrides,
});

describe('mapCondicaoPgto', () => {
  it('normaliza Parcelas (caixa mista na API) para PARCELAS', () => {
    expect(mapCondicaoPgto(condicao({ Parcelas: 3 })).PARCELAS).toBe(3);
  });

  it('calcula VALOR_MINIMO como VALOR_PARCELA * PARCELAS', () => {
    const result = mapCondicaoPgto(
      condicao({ Parcelas: 3, VALOR_PARCELA: 333.33 }),
    );

    expect(result.VALOR_MINIMO).toBeCloseTo(999.99, 2);
  });

  it('calcula PM como média dos prazos', () => {
    // 30 + 60 + 90 = 180 / 3 = 60
    expect(mapCondicaoPgto(condicao({ Parcelas: 3 })).PM).toBe(60);
  });

  it('trunca PM como o CAST(... AS INTEGER) do SQL original', () => {
    // 30 + 60 + 91 = 181 / 3 = 60.33 -> 60
    expect(mapCondicaoPgto(condicao({ Parcelas: 3, PZ03: 91 })).PM).toBe(60);
  });

  it('ignora prazos além de PARCELAS ao calcular PM', () => {
    // Só as 2 primeiras parcelas valem: 30 + 60 = 90 / 2 = 45
    expect(mapCondicaoPgto(condicao({ Parcelas: 2 })).PM).toBe(45);
  });

  it('devolve PM 0 quando não há parcelas', () => {
    expect(mapCondicaoPgto(condicao({ Parcelas: 0 })).PM).toBe(0);
  });

  it('preserva os demais campos da entidade', () => {
    const result = mapCondicaoPgto(
      condicao({
        ID: 42,
        NOME: 'À VISTA',
        DESCONTO_MAX: 3.5,
        FORMA: 'BOLETO',
      }),
    );

    expect(result).toMatchObject({
      ID: 42,
      NOME: 'À VISTA',
      DESCONTO_MAX: 3.5,
      FORMA: 'BOLETO',
      TIPO: 'V',
      DESTACAR_DESCONTO: 'N',
    });
  });
});

describe('filtrarCondicoesPorValor', () => {
  const eligible = filtrarCondicoesPorValor(
    [
      condicao({ ID: 1, Parcelas: 10, VALOR_PARCELA: 500 }), // mínimo 5000
      condicao({ ID: 2, Parcelas: 1, VALOR_PARCELA: 100 }), // mínimo 100
      condicao({ ID: 3, Parcelas: 2, VALOR_PARCELA: 400 }), // mínimo 800
    ].map(mapCondicaoPgto),
    1000,
  );

  it('descarta condições cujo valor mínimo ultrapassa o total', () => {
    expect(eligible.map((c) => c.ID)).toEqual([2, 3]);
  });

  it('ordena por VALOR_MINIMO crescente', () => {
    expect(eligible.map((c) => c.VALOR_MINIMO)).toEqual([100, 800]);
  });

  it('mantém condição cujo valor mínimo é igual ao total', () => {
    const resultado = filtrarCondicoesPorValor(
      [mapCondicaoPgto(condicao({ Parcelas: 2, VALOR_PARCELA: 500 }))],
      1000,
    );

    expect(resultado).toHaveLength(1);
  });

  it('devolve lista vazia quando nada é elegível', () => {
    const resultado = filtrarCondicoesPorValor(
      [mapCondicaoPgto(condicao({ Parcelas: 10, VALOR_PARCELA: 5000 }))],
      10,
    );

    expect(resultado).toEqual([]);
  });

  it('não altera o array original', () => {
    const original = [condicao({ ID: 9, VALOR_PARCELA: 1000 })].map(
      mapCondicaoPgto,
    );
    const copia = [...original];

    filtrarCondicoesPorValor(original, 0);

    expect(original).toEqual(copia);
  });
});
