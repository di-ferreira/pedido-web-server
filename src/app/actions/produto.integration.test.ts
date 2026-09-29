import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  const { readFileSync } = require('node:fs');
  try {
    const content = readFileSync(`${process.cwd()}/.env`, 'utf-8');
    for (const line of content.split('\n')) {
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim();
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env ausente — segue sem variáveis (teste será pulado)
  }
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

import { cookies } from 'next/headers';
import { CustomFetch } from '@/services/api';
import { GetProducts } from '@/app/actions/produto';
import { ResponseType } from '@/@types';

const mockedCookies = cookies as unknown as ReturnType<typeof vi.fn>;

const EMSOFT_API = process.env.EMSOFT_API;
const VENDA_LOGIN = process.env.VENDA_LOGIN;
const VENDA_PASSWORD = process.env.VENDA_PASSWORD;

const hasEnv = !!(EMSOFT_API && VENDA_LOGIN && VENDA_PASSWORD);

describe.runIf(hasEnv)('Cálculo de preço com desconto de tabela (integração)', () => {
  it('deve calcular o preço com desconto de -12,70 e comparar com o preço base', async () => {
    const loginResponse = await CustomFetch<ResponseType<string>>(
      '/ServiceSistema/Login',
      {
        body: JSON.stringify({
          usuario: VENDA_LOGIN,
          senha: VENDA_PASSWORD,
        }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const token = loginResponse.body?.value;
    expect(token).toBeDefined();

    mockedCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: token }),
    });

    const products = await GetProducts({
      top: 1,
      skip: 0,
      orderBy: 'PRODUTO',
      filter: [
        {
          key: 'PRODUTO',
          value: '%',
          typeSearch: 'like',
        },
      ],
    });
    expect(products.error).toBeUndefined();
    expect(products.value?.value?.length).toBeGreaterThan(0);

    const prod = products.value!.value![0];
    const precoBase = prod.PRECO;

    const discount = -12.70;
    const priceCalculated =
      Math.round(precoBase * ((discount / 100) + 1) * 100) / 100;

    expect(priceCalculated).toBeLessThan(precoBase);
    expect(priceCalculated).toBeCloseTo(precoBase * 0.873, 2);
  }, 30000);
});
