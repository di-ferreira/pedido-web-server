import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  CustomFetch: vi.fn(),
}));

import { cookies } from 'next/headers';
import { CustomFetch } from '@/services/api';
import {
  GetNewPriceFromTable,
  GetProductPromotion,
  GetSaleHistory,
  GetSimilares,
} from '@/app/actions/produto';

const mockedCookies = cookies as unknown as ReturnType<typeof vi.fn>;
const mockedCustomFetch = CustomFetch as unknown as ReturnType<typeof vi.fn>;

const mockToken = () => {
  mockedCookies.mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'token-valido' }),
  });
};

const prod = { PRODUTO: 'YN12/1034' } as any;
const cliente = { CLIENTE: 'C1' } as any;

describe('GetNewPriceFromTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken();
  });

  it('retorna 404 (não lança) quando Data é array vazio', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      body: { Data: [], RecordCount: 0 },
    });

    const result = await GetNewPriceFromTable(prod, 'T1');

    expect(result.error).toMatchObject({ code: '404' });
    expect(result.value).toBeUndefined();
  });

  it('retorna o preço quando há linha', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      body: { Data: [{ NOVO_PRECO: 12.5 }], RecordCount: 1 },
    });

    const result = await GetNewPriceFromTable(prod, 'T1');

    expect(result.error).toBeUndefined();
    expect(result.value).toBe(12.5);
  });
});

describe('GetProductPromotion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken();
  });

  it('retorna 404 (não lança) quando Data é array vazio', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      body: { Data: [] },
    });

    const result = await GetProductPromotion(prod);

    expect(result.error).toMatchObject({ code: '404' });
    expect(result.value).toBeUndefined();
  });

  it('retorna erro quando o status não é 200', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 500,
      statusText: 'Internal Server Error',
      body: null,
    });

    const result = await GetProductPromotion(prod);

    expect(result.error).toMatchObject({ code: '500' });
    expect(result.value).toBeUndefined();
  });
});

describe('GetSaleHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken();
  });

  it('retorna lista vazia (não lança) quando body é null', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      body: null,
    });

    const result = await GetSaleHistory(cliente, prod);

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual([]);
  });
});

describe('GetSimilares', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken();
  });

  it('monta a query com $expand=EXTERNO e $select restritivo', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      body: { value: [] },
    });

    await GetSimilares('DT20173');

    const url = mockedCustomFetch.mock.calls[0][0] as string;
    expect(url).toContain('$expand=EXTERNO,EXTERNO/FABRICANTE');
    expect(url).toContain('$select=');
    expect(url).toContain('EXTERNO/PRODUTO');
    expect(url).toContain('EXTERNO/PRECO');
    expect(url).toContain('EXTERNO/FABRICANTE/NOME');
  });

  it('retorna a lista de similares quando há valor', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      body: { value: [{ EXTERNO: { PRODUTO: 'X' } }] },
    });

    const result = await GetSimilares('DT20173');

    expect(result.error).toBeUndefined();
    expect(result.value).toHaveLength(1);
  });
});
