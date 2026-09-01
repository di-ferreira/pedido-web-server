import { describe, it, expect } from 'vitest';
import { assertSafeSQLValue, checkStatus } from '@/lib/utils';

describe('assertSafeSQLValue', () => {
  it('aceita valores alfanuméricos simples', () => {
    expect(assertSafeSQLValue('ABC123', 'campo')).toBe('ABC123');
  });

  it('aceita números', () => {
    expect(assertSafeSQLValue(42, 'campo')).toBe('42');
  });

  it('aceita underscores, hífens e pontos', () => {
    expect(assertSafeSQLValue('TAB-01.x', 'campo')).toBe('TAB-01.x');
  });

  it('rejeita aspas simples (injeção SQL)', () => {
    expect(() => assertSafeSQLValue("O'Brien", 'campo')).toThrow(
      'Valor inválido para campo',
    );
  });

  it('rejeita payload de injeção SQL', () => {
    expect(() =>
      assertSafeSQLValue("1; DROP TABLE CTS--", 'campo'),
    ).toThrow('Valor inválido para campo');
  });

  it('rejeita espaços', () => {
    expect(() => assertSafeSQLValue('a b', 'campo')).toThrow(
      'Valor inválido para campo',
    );
  });
});

describe('checkStatus', () => {
  it('retorna null para status 200', () => {
    const response = { status: 200, statusText: 'OK', body: { data: 1 } };
    expect(checkStatus(response)).toBeNull();
  });

  it('retorna null para status 201', () => {
    const response = { status: 201, statusText: 'Created', body: null };
    expect(checkStatus(response)).toBeNull();
  });

  it('retorna erro para status 401', () => {
    const response = { status: 401, statusText: 'Unauthorized', body: null };
    const result = checkStatus(response);
    expect(result).not.toBeNull();
    expect(result!.error!.code).toBe('401');
    expect(result!.error!.message).toBe('Unauthorized');
  });

  it('retorna erro para status 500', () => {
    const response = { status: 500, statusText: 'Internal Server Error', body: null };
    const result = checkStatus(response);
    expect(result).not.toBeNull();
    expect(result!.error!.code).toBe('500');
  });

  it('usa mensagem padrão quando statusText é vazio', () => {
    const response = { status: 502, statusText: '', body: null };
    const result = checkStatus(response);
    expect(result!.error!.message).toBe('Erro na requisição');
  });
});
