import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do next/headers (cookies) — em ambiente Node não há contexto de request Next.js
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock da camada de API — garante que a ação falha ANTES de chamar a API (fail-fast)
vi.mock('@/services/api', () => ({
  CustomFetch: vi.fn(),
}));

import { cookies } from 'next/headers';
import { CustomFetch } from '@/services/api';
import { GetCliente } from '@/app/actions/cliente';
import { GetOrcamento } from '@/app/actions/orcamento';
import { GetProduct } from '@/app/actions/produto';

const mockedCookies = cookies as unknown as ReturnType<typeof vi.fn>;
const mockedCustomFetch = CustomFetch as unknown as ReturnType<typeof vi.fn>;

const mockNoToken = () => {
  mockedCookies.mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  });
};

describe('requireAuth — validação de sessão nas Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNoToken();
  });

  it('GetOrcamento retorna unauthorized sem token e não chama a API', async () => {
    const result = await GetOrcamento(123);
    expect(result.error).toMatchObject({ code: 'unauthorized' });
    expect(result.value).toBeUndefined();
    expect(mockedCustomFetch).not.toHaveBeenCalled();
  });

  it('GetCliente retorna unauthorized sem token e não chama a API', async () => {
    const result = await GetCliente(123);
    expect(result.error).toMatchObject({ code: 'unauthorized' });
    expect(mockedCustomFetch).not.toHaveBeenCalled();
  });

  it('GetProduct retorna unauthorized sem token e não chama a API', async () => {
    const result = await GetProduct('ABC123');
    expect(result.error).toMatchObject({ code: 'unauthorized' });
    expect(mockedCustomFetch).not.toHaveBeenCalled();
  });

  it('GetOrcamento prossegue e chama a API quando há token válido', async () => {
    mockedCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'token-valido' }),
    });
    mockedCustomFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      body: { ORCAMENTO: 123, ItensOrcamento: [] },
    });

    const result = await GetOrcamento(123);

    expect(mockedCustomFetch).toHaveBeenCalledTimes(1);
    expect(result.error).toBeUndefined();
    expect(result.value).toBeDefined();
  });
});
