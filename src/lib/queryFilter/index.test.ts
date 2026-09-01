import { describe, it, expect } from 'vitest';
import { ODataQueryBuilder } from '@/lib/queryFilter';
import type { ModelMetadata } from '@/@types/QueryFilter';

interface Produto {
  CODIGO: string;
  NOME: string;
  PRECO: number;
  ATIVO: boolean;
  DATA: string;
}

const metadata = {
  CODIGO: 'string' as const,
  NOME: 'string' as const,
  PRECO: 'number' as const,
  ATIVO: 'boolean' as const,
  DATA: 'date' as const,
} satisfies ModelMetadata<Produto>;

describe('ODataQueryBuilder', () => {
  it('monta query básica com top/skip padrão e inlinecount', () => {
    const result = new ODataQueryBuilder<Produto>(metadata).build();
    expect(result).toContain('$top=15');
    expect(result).toContain('$skip=0');
    expect(result).toContain('$inlinecount=allpages');
  });

  it('aplica top, skip e orderby', () => {
    const result = new ODataQueryBuilder<Produto>(metadata)
      .top(10)
      .skip(20)
      .orderBy('PRECO', 'asc')
      .build();
    expect(result).toContain('$top=10');
    expect(result).toContain('$skip=20');
    expect(result).toContain('$orderby=PRECO asc');
  });

  it('escapa aspas simples em valores de string (prevenção de injeção OData)', () => {
    const result = new ODataQueryBuilder<Produto>(metadata)
      .where({
        operator: 'and',
        conditions: [{ key: 'NOME', operator: 'eq', value: "O'Brien" }],
      })
      .build();
    expect(result).toContain("NOME eq 'O''Brien'");
    expect(result).not.toContain("NOME eq 'O'Brien'");
  });

  it('neutraliza tentativa de injeção com aspa + OR 1=1', () => {
    const result = new ODataQueryBuilder<Produto>(metadata)
      .where({
        operator: 'and',
        conditions: [
          { key: 'NOME', operator: 'eq', value: "x' or 1=1 --" },
        ],
      })
      .build();
    expect(result).toContain("NOME eq 'x'' or 1=1 --'");
  });

  it('trata null/undefined como null sem aspas', () => {
    const result = new ODataQueryBuilder<Produto>(metadata)
      .where({
        operator: 'and',
        conditions: [{ key: 'NOME', operator: 'eq', value: null }],
      })
      .build();
    expect(result).toContain('NOME eq null');
  });

  it('formata número sem aspas', () => {
    const result = new ODataQueryBuilder<Produto>(metadata)
      .where({
        operator: 'and',
        conditions: [{ key: 'PRECO', operator: 'gt', value: 100 }],
      })
      .build();
    expect(result).toContain('PRECO gt 100');
  });

  it('formata booleano como true/false', () => {
    const result = new ODataQueryBuilder<Produto>(metadata)
      .where({
        operator: 'and',
        conditions: [{ key: 'ATIVO', operator: 'eq', value: true }],
      })
      .build();
    expect(result).toContain('ATIVO eq true');
  });

  it('formata data como YYYY-MM-DD entre aspas', () => {
    const result = new ODataQueryBuilder<Produto>(metadata)
      .where({
        operator: 'and',
        conditions: [{ key: 'DATA', operator: 'eq', value: '2024-01-15' }],
      })
      .build();
    expect(result).toContain("DATA eq '2024-01-15'");
  });

  it('suporta operadores contains/startswith/endswith', () => {
    const result = new ODataQueryBuilder<Produto>(metadata)
      .where({
        operator: 'and',
        conditions: [{ key: 'NOME', operator: 'contains', value: 'motor' }],
      })
      .build();
    expect(result).toContain("contains(NOME, 'motor')");
  });

  it('suporta grupos aninhados com parênteses', () => {
    const result = new ODataQueryBuilder<Produto>(metadata)
      .where({
        operator: 'or',
        conditions: [
          { key: 'NOME', operator: 'eq', value: 'a' },
          {
            operator: 'and',
            conditions: [
              { key: 'PRECO', operator: 'gt', value: 10 },
              { key: 'ATIVO', operator: 'eq', value: true },
            ],
          },
        ],
      })
      .build();
    expect(result).toContain(
      "$filter=NOME eq 'a' or (PRECO gt 10 and ATIVO eq true)",
    );
  });
});
