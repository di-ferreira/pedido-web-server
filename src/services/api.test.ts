import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toResponseType } from '@/services/api';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('toResponseType', () => {
  it('retorna value para status 200', () => {
    const response = { status: 200, statusText: 'OK', body: { data: 1 } };
    const result = toResponseType(response);
    expect(result.value).toEqual({ data: 1 });
    expect(result.error).toBeUndefined();
  });

  it('retorna value para status 201', () => {
    const response = { status: 201, statusText: 'Created', body: { id: 1 } };
    const result = toResponseType(response);
    expect(result.value).toEqual({ id: 1 });
  });

  it('retorna error para status 401', () => {
    const response = { status: 401, statusText: 'Unauthorized', body: null };
    const result = toResponseType(response);
    expect(result.value).toBeUndefined();
    expect(result.error).toEqual({
      code: '401',
      message: 'Unauthorized',
    });
  });

  it('retorna error para status 500', () => {
    const response = {
      status: 500,
      statusText: 'Internal Server Error',
      body: null,
    };
    const result = toResponseType(response);
    expect(result.error!.code).toBe('500');
  });

  it('usa mensagem padrão quando statusText é vazio', () => {
    const response = { status: 502, statusText: '', body: null };
    const result = toResponseType(response);
    expect(result.error!.message).toBe('Erro na requisição');
  });

  it('retorna error para status 408 (timeout)', () => {
    const response = {
      status: 408,
      statusText: 'Request Timeout',
      body: null,
    };
    const result = toResponseType(response);
    expect(result.error!.code).toBe('408');
    expect(result.error!.message).toBe('Request Timeout');
  });
});
