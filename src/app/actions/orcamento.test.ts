import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  CustomFetch: vi.fn(),
}));

vi.mock('@/app/actions/user', () => ({
  getVendedorAction: vi.fn(),
}));

import { cookies } from 'next/headers';
import { CustomFetch } from '@/services/api';
import { getVendedorAction } from '@/app/actions/user';
import {
  GetOrcamento,
  GetOrcamentosFromVendedor,
} from '@/app/actions/orcamento';

const mockedCookies = cookies as unknown as ReturnType<typeof vi.fn>;
const mockedCustomFetch = CustomFetch as unknown as ReturnType<typeof vi.fn>;
const mockedGetVendedor =
  getVendedorAction as unknown as ReturnType<typeof vi.fn>;

const mockToken = () => {
  mockedCookies.mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'token-valido' }),
  });
};

describe('GetOrcamento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken();
  });

  it('retorna o orçamento com os itens mapeados com ORCAMENTO', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      body: {
        ORCAMENTO: 42,
        ItensOrcamento: [
          { PRODUTO: { PRODUTO: 'P1' } },
          { PRODUTO: { PRODUTO: 'P2' } },
        ],
      },
    });

    const result = await GetOrcamento(42);

    expect(result.error).toBeUndefined();
    expect(result.value?.ORCAMENTO).toBe(42);
    expect(result.value?.ItensOrcamento).toHaveLength(2);
    expect(result.value?.ItensOrcamento[0].ORCAMENTO).toBe(42);
    expect(result.value?.ItensOrcamento[1].ORCAMENTO).toBe(42);
  });

  it('retorna erro quando o status não é 200', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 404,
      statusText: 'Not Found',
      body: null,
    });

    const result = await GetOrcamento(42);

    expect(result.error).toMatchObject({ code: '404' });
    expect(result.value).toBeUndefined();
  });
});

describe('GetOrcamentosFromVendedor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken();
    mockedGetVendedor.mockResolvedValue({
      value: { TIPO_VENDEDOR: 'I' },
    });
  });

  it('retorna a tabela com Qtd_Registros e value', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      body: { '@xdata.count': 2, value: [{ ORCAMENTO: 1 }, { ORCAMENTO: 2 }] },
    });

    const result = await GetOrcamentosFromVendedor();

    expect(result.error).toBeUndefined();
    expect(result.value?.Qtd_Registros).toBe(2);
    expect(result.value?.value).toHaveLength(2);
  });

  it('retorna erro quando o status não é 200', async () => {
    mockedCustomFetch.mockResolvedValue({
      status: 500,
      statusText: 'Internal Server Error',
      body: null,
    });

    const result = await GetOrcamentosFromVendedor();

    expect(result.error).toMatchObject({ code: '500' });
    expect(result.value).toBeUndefined();
  });
});
