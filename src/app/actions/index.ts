'use server';
import { ResponseType } from '@/@types';
import { KEY_NAME_TOKEN } from '@/constants';
import { returnExpiresTimes } from '@/lib/utils';
import { cookies } from 'next/headers';
import './cliente';
import './user';

export async function setCookie(name: string, value: string): Promise<void> {
  (await cookies()).set({
    name: `${KEY_NAME_TOKEN}${name}`,
    value: value,
    httpOnly: true,
    expires: returnExpiresTimes(120),
  });
}

export async function getCookie(value: string): Promise<string> {
  const token = (await cookies()).get(`${KEY_NAME_TOKEN}${value}`);
  return token ? token.value : '';
}

export async function removeCookie(name: string): Promise<void> {
  (await cookies()).delete(`${KEY_NAME_TOKEN}${name}`);
}

/**
 * Valida a sessão (fail-fast) antes de qualquer ação autenticada.
 * Retorna o token quando há sessão válida; caso contrário, um erro `unauthorized`.
 * Uso:
 *   const auth = await requireAuth();
 *   if (auth.error) return { error: auth.error };
 *   // auth.value contém o token da sessão
 */
export async function requireAuth(): Promise<ResponseType<string>> {
  const token = await getCookie('token');
  if (!token) {
    return {
      error: {
        code: 'unauthorized',
        message: 'Sessão expirada. Faça login novamente.',
      },
    };
  }
  return { value: token };
}

