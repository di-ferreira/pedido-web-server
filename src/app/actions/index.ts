'use server';
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

