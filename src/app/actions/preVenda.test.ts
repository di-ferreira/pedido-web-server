import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  CustomFetch: vi.fn(),
}));

import { cookies } from 'next/headers';
import { iCondicaoPgtoApi } from '@/@types/PreVenda';
import { CustomFetch } from '@/services/api';
import { GetCondicaoPGTO } from '@/app/actions/preVenda';

const mockedCookies = cookies as unknown as ReturnType<typeof vi.fn>;
const mockedCustomFetch = CustomFetch as unknown as ReturnType<typeof vi.fn>;

const mockToken = () => {
  mockedCookies.mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'token-valido' }),
  });
};

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

const mockResponse = (value: iCondicaoPgtoApi[]) => {
  mockedCustomFetch.mockResolvedValue({
    status: 200,
    statusText: 'OK',
    body: { '@xdata.count': value.length, value },
  });
};

const urlDaRequisicao = () => mockedCustomFetch.mock.calls[0][0] as string;

describe('GetCondicaoPGTO', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken();
  });

  it('consulta o endpoint /CondicoesDePagamento filtrando TABELA e TIPO', async () => {
    mockResponse([condicao()]);

    await GetCondicaoPGTO(5000, '10');

    const url = urlDaRequisicao();

    expect(url).toContain('/CondicoesDePagamento?');
    expect(url).toContain("$filter=TABELA eq '10' and TIPO eq 'V'");
  });

  it('adiciona Parcelas eq 1 quando somenteAvista', async () => {
    mockResponse([condicao({ Parcelas: 1 })]);

    await GetCondicaoPGTO(5000, '10', true);

    expect(urlDaRequisicao()).toContain(
      "$filter=TABELA eq '10' and TIPO eq 'V' and Parcelas eq 1",
    );
  });

  it('não adiciona filtro de parcelas quando somenteAvista é falso', async () => {
    mockResponse([condicao()]);

    await GetCondicaoPGTO(5000, '10', false);

    expect(urlDaRequisicao()).not.toContain('Parcelas eq 1');
  });

  it('descarta condições cujo valor mínimo ultrapassa o total', async () => {
    mockResponse([
      condicao({ ID: 1, Parcelas: 10, VALOR_PARCELA: 500 }), // mínimo 5000
      condicao({ ID: 2, Parcelas: 1, VALOR_PARCELA: 100 }), // mínimo 100
    ]);

    const result = await GetCondicaoPGTO(1000, '10');

    expect(result.value?.map((c) => c.ID)).toEqual([2]);
  });

  it('ordena por VALOR_MINIMO crescente', async () => {
    mockResponse([
      condicao({ ID: 1, Parcelas: 3, VALOR_PARCELA: 500 }), // 1500
      condicao({ ID: 2, Parcelas: 1, VALOR_PARCELA: 100 }), // 100
      condicao({ ID: 3, Parcelas: 2, VALOR_PARCELA: 400 }), // 800
    ]);

    const result = await GetCondicaoPGTO(5000, '10');

    expect(result.value?.map((c) => c.ID)).toEqual([2, 3, 1]);
  });

  it('normaliza Parcelas e VALOR_MINIMO na resposta', async () => {
    mockResponse([condicao({ Parcelas: 4, VALOR_PARCELA: 25 })]);

    const result = await GetCondicaoPGTO(5000, '10');

    expect(result.value?.[0]).toMatchObject({
      PARCELAS: 4,
      VALOR_PARCELA: 25,
      VALOR_MINIMO: 100,
    });
  });

  it('devolve lista vazia e sem erro quando nada é elegível', async () => {
    mockResponse([condicao({ Parcelas: 10, VALOR_PARCELA: 5000 })]);

    const result = await GetCondicaoPGTO(10, '10');

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual([]);
  });

  it('propaga erro quando a API responde status diferente de 200', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 401,
      statusText: 'Unauthorized',
      body: null,
    });

    const result = await GetCondicaoPGTO(5000, '10');

    expect(result.value).toBeUndefined();
    expect(result.error).toMatchObject({ code: '401' });
  });
});
