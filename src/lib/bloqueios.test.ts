import { describe, it, expect } from 'vitest';
import { getBloqueios } from '@/lib/bloqueios';

describe('getBloqueios', () => {
  it('retorna lista vazia quando não há bloqueios', () => {
    const result = getBloqueios({
      contasAtrazadas: 0,
      usaLimite: false,
      saldoCompra: 1000,
      bloqueado: 'N',
    });
    expect(result).toEqual([]);
  });

  it('detecta INADIMPLENCIA quando contasAtrazadas > 0', () => {
    const result = getBloqueios({
      contasAtrazadas: 500,
      usaLimite: false,
      saldoCompra: 1000,
      bloqueado: 'N',
    });
    expect(result).toContain('INADIMPLENCIA');
  });

  it('detecta LIMITE quando usaLimite e saldoCompra <= 0', () => {
    const result = getBloqueios({
      contasAtrazadas: 0,
      usaLimite: true,
      saldoCompra: 0,
      bloqueado: 'N',
    });
    expect(result).toContain('LIMITE');
  });

  it('detecta LIMITE quando usaLimite e saldoCompra negativo', () => {
    const result = getBloqueios({
      contasAtrazadas: 0,
      usaLimite: true,
      saldoCompra: -100,
      bloqueado: 'N',
    });
    expect(result).toContain('LIMITE');
  });

  it('não detecta LIMITE quando usaLimite e saldoCompra > 0 (sem totalPedido)', () => {
    const result = getBloqueios({
      contasAtrazadas: 0,
      usaLimite: true,
      saldoCompra: 500,
      bloqueado: 'N',
    });
    expect(result).not.toContain('LIMITE');
  });

  it('detecta LIMITE quando totalPedido > saldoCompra', () => {
    const result = getBloqueios({
      contasAtrazadas: 0,
      usaLimite: true,
      saldoCompra: 500,
      totalPedido: 600,
      bloqueado: 'N',
    });
    expect(result).toContain('LIMITE');
  });

  it('não detecta LIMITE quando totalPedido <= saldoCompra', () => {
    const result = getBloqueios({
      contasAtrazadas: 0,
      usaLimite: true,
      saldoCompra: 500,
      totalPedido: 400,
      bloqueado: 'N',
    });
    expect(result).not.toContain('LIMITE');
  });

  it('detecta BLOQUEADO quando bloqueado === S', () => {
    const result = getBloqueios({
      contasAtrazadas: 0,
      usaLimite: false,
      saldoCompra: 1000,
      bloqueado: 'S',
    });
    expect(result).toContain('BLOQUEADO');
  });

  it('detecta múltiplos bloqueios simultâneos', () => {
    const result = getBloqueios({
      contasAtrazadas: 100,
      usaLimite: true,
      saldoCompra: -50,
      bloqueado: 'S',
    });
    expect(result).toContain('INADIMPLENCIA');
    expect(result).toContain('LIMITE');
    expect(result).toContain('BLOQUEADO');
    expect(result).toHaveLength(3);
  });

  it('não detecta LIMITE quando usaLimite é false', () => {
    const result = getBloqueios({
      contasAtrazadas: 0,
      usaLimite: false,
      saldoCompra: -100,
      bloqueado: 'N',
    });
    expect(result).not.toContain('LIMITE');
  });
});
