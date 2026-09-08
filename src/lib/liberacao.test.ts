import { describe, it, expect } from 'vitest';
import { iLiberacoes } from '@/@types/Liberacoes';
import { decidirLiberacao } from '@/lib/liberacao';

function liberacao(partial: Partial<iLiberacoes>): iLiberacoes {
  return {
    ID: 1,
    NOME: 'CLIENTE',
    CODIGO: 'INADIMPLENCIA',
    CHAVE: 100,
    DATA_HORA: '',
    QUEM: '',
    USADO: 'N',
    ONDE: 'PRÉ-VENDA',
    ID_ONDE: 1,
    OBS: '',
    MOVIMENTO: 0,
    ...partial,
  };
}

describe('decidirLiberacao', () => {
  it('solicita quando não existe liberação', () => {
    expect(decidirLiberacao(undefined)).toEqual({ action: 'solicitar' });
  });

  it('solicita quando ID_ONDE === 0 e USADO === S (consumida sem destino)', () => {
    expect(
      decidirLiberacao(liberacao({ ID_ONDE: 0, USADO: 'S' })),
    ).toEqual({ action: 'solicitar' });
  });

  it('aguarda quando ID_ONDE === 9999 (pendente no ERP)', () => {
    expect(
      decidirLiberacao(liberacao({ ID_ONDE: 9999, USADO: 'N' })),
    ).toEqual({ action: 'aguardar' });
  });

  it('aguarda quando ID_ONDE === 9999 mesmo com USADO === S', () => {
    expect(
      decidirLiberacao(liberacao({ ID_ONDE: 9999, USADO: 'S' })),
    ).toEqual({ action: 'aguardar' });
  });

  it('consome quando USADO === N e ID_ONDE é real', () => {
    expect(
      decidirLiberacao(liberacao({ ID_ONDE: 5, USADO: 'N' })),
    ).toEqual({ action: 'consumir' });
  });

  it('procede quando USADO === S e ID_ONDE é real', () => {
    expect(
      decidirLiberacao(liberacao({ ID_ONDE: 5, USADO: 'S' })),
    ).toEqual({ action: 'proceder' });
  });
});
