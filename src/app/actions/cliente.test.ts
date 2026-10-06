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
  GetClientesPgtoEmAberto,
  GetPGTOsEmAberto,
  GetPGTOsNaoVencidos,
} from '@/app/actions/cliente';
import dayjs from 'dayjs';

const mockedCookies = cookies as unknown as ReturnType<typeof vi.fn>;
const mockedCustomFetch = CustomFetch as unknown as ReturnType<typeof vi.fn>;

const VENDEDOR = 123;

// O cookie 'user' (código do vendedor) e o 'token' (sessão) são lidos pelo mesmo
// mock, então a resposta precisa depender do nome do cookie.
const mockSessao = () => {
  mockedCookies.mockResolvedValue({
    get: vi.fn((name: string) =>
      name === 'pedidoweb_token'
        ? { value: 'token-valido' }
        : { value: String(VENDEDOR) }
    ),
  });
};

const envelope = (
  StatusCode: number,
  Data: unknown,
  StatusMessage = 'OK',
) => ({
  status: 200,
  statusText: 'OK',
  body: { StatusCode, StatusMessage, RecordCount: 0, Data },
});

const urlChamada = (indice = 0) =>
  String(mockedCustomFetch.mock.calls[indice][0]);

describe('GetClientesPgtoEmAberto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessao();
  });

  it('retorna a lista de clientes quando o SelectSQL responde StatusCode 200', async () => {
    const data = [{ NOME_CLIENTE: 'CLIENTE UM', VALOR: 150.5 }];
    mockedCustomFetch.mockResolvedValue(envelope(200, data));

    const result = await GetClientesPgtoEmAberto();

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual(data);
  });

  it('aspam a data no filtro de VENCIMENTO (sem aspas o Firebird lê como aritmética)', async () => {
    mockedCustomFetch.mockResolvedValue(envelope(200, []));

    await GetClientesPgtoEmAberto();

    const hoje = dayjs().format('YYYY-MM-DD');
    const sql = decodeURIComponent(urlChamada());
    expect(sql).toContain(`R.VENCIMENTO < '${hoje}'`);
    expect(sql).not.toContain(`R.VENCIMENTO < ${hoje}`);
  });

  it('filtra pelo vendedor do cookie sem aspas (código numérico)', async () => {
    mockedCustomFetch.mockResolvedValue(envelope(200, []));

    await GetClientesPgtoEmAberto();

    const sql = decodeURIComponent(urlChamada());
    expect(sql).toContain(
      `(R.id_vendedor1 = ${VENDEDOR} or R.id_vendedor2 = ${VENDEDOR})`,
    );
  });

  it('retorna erro do envelope quando o SQL falha com HTTP 200', async () => {
    mockedCustomFetch.mockResolvedValue(
      envelope(500, null, 'Dynamic SQL Error: invalid date comparison'),
    );

    const result = await GetClientesPgtoEmAberto();

    expect(result.value).toBeUndefined();
    expect(result.error).toEqual({
      code: '500',
      message: 'Dynamic SQL Error: invalid date comparison',
    });
  });
});

describe('GetPGTOsNaoVencidos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessao();
  });

  it('retorna o envelope quando o SelectSQL responde StatusCode 200', async () => {
    mockedCustomFetch.mockResolvedValue(envelope(200, [{ QTD: 1, VALOR: 10 }]));

    const result = await GetPGTOsNaoVencidos(1);

    expect(result.error).toBeUndefined();
    expect(result.value?.Data).toEqual([{ QTD: 1, VALOR: 10 }]);
  });

  it('retorna erro do envelope quando o SQL falha com HTTP 200', async () => {
    mockedCustomFetch.mockResolvedValue(envelope(422, null, 'SQL falhou'));

    const result = await GetPGTOsNaoVencidos(1);

    expect(result.value).toBeUndefined();
    expect(result.error).toEqual({ code: '422', message: 'SQL falhou' });
  });
});

describe('GetPGTOsEmAberto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessao();
  });

  it('retorna os boletos quando o SelectSQL responde StatusCode 200', async () => {
    const data = [{ RESTA: 50, DOC: '123' }];
    mockedCustomFetch.mockResolvedValue(envelope(200, data));

    const result = await GetPGTOsEmAberto(1);

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual(data);
  });

  it('retorna erro do envelope quando o SQL falha com HTTP 200', async () => {
    mockedCustomFetch.mockResolvedValue(envelope(500, null, 'SQL falhou'));

    const result = await GetPGTOsEmAberto(1);

    expect(result.value).toBeUndefined();
    expect(result.error).toEqual({ code: '500', message: 'SQL falhou' });
  });
});