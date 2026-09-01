import { ResponseType } from '@/@types';
import { KEY_NAME_TOKEN } from '@/constants';
import { cookies } from 'next/headers';

const BASE_URL = process.env.EMSOFT_API;
const DEFAULT_TIMEOUT_MS = 30_000;

export type ResponseData<K> = {
  status: number;
  statusText: string;
  body: K;
};

export async function CustomFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number },
) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchInit } = init ?? {};

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const data = await fetch(`${BASE_URL}${input}`, {
      ...fetchInit,
      signal: controller.signal,
    });

    const hasBody = data.headers.get('content-length') !== '0';
    const isJson = data.headers.get('content-type')?.includes('application/json');

    let result: T | null = null;

    if (hasBody && isJson) {
      try {
        result = await data.json();
      } catch {
        return {
          status: data.status,
          statusText: data.statusText,
          body: null,
        };
      }
    }

    return {
      status: data.status,
      statusText: data.statusText,
      body: result,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 408,
        statusText: 'Request Timeout',
        body: null,
      };
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function CustomFetchAuth<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number },
) {
  const token = (await cookies()).get(`${KEY_NAME_TOKEN}token`);
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `bearer ${token.value}`);
  }
  return CustomFetch<T>(input, { ...init, headers });
}

export function toResponseType<T>(
  response: ResponseData<T | null>,
): ResponseType<T> {
  if (response.status >= 200 && response.status < 300) {
    return { value: response.body as T, error: undefined };
  }
  return {
    value: undefined,
    error: {
      code: String(response.status),
      message: response.statusText || 'Erro na requisição',
    },
  };
}
