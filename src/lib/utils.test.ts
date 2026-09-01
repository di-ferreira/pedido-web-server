import { describe, it, expect } from 'vitest';
import { assertSafeSQLValue } from '@/lib/utils';

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
