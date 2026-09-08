import { iLiberacoes } from '@/@types/Liberacoes';

export type LiberacaoDecision =
  | { action: 'solicitar' }
  | { action: 'aguardar' }
  | { action: 'consumir' }
  | { action: 'proceder' };

export function decidirLiberacao(
  liberacao: iLiberacoes | undefined,
): LiberacaoDecision {
  if (!liberacao) return { action: 'solicitar' };

  if (liberacao.ID_ONDE === 0 && liberacao.USADO === 'S') {
    return { action: 'solicitar' };
  }

  if (liberacao.ID_ONDE === 9999) {
    return { action: 'aguardar' };
  }

  if (liberacao.USADO === 'N') {
    return { action: 'consumir' };
  }

  return { action: 'proceder' };
}
