import { iCondicaoPgto, iCondicaoPgtoApi } from '@/@types/PreVenda';

const CHAVE_PRAZO = (n: number): keyof iCondicaoPgtoApi =>
  `PZ${String(n).padStart(2, '0')}` as keyof iCondicaoPgtoApi;

/**
 * Normaliza uma condição vinda de `GET /CondicoesDePagamento` para o formato
 * usado pelo app.
 *
 * O endpoint expõe os campos crus da entidade — `Parcelas` com caixa mista e
 * sem as colunas derivadas. Recria aqui o que a query SQL antiga (`OPP`)
 * calculava:
 *
 * - `VALOR_MINIMO` = `VALOR_PARCELA * PARCELAS`
 * - `PM` = média dos prazos PZ01..PZ0n, truncada como o `CAST(... AS INTEGER)`
 */
export function mapCondicaoPgto(condicao: iCondicaoPgtoApi): iCondicaoPgto {
  const parcelas = condicao.Parcelas;

  let somaPrazos = 0;
  for (let i = 1; i <= parcelas; i++) {
    somaPrazos += Number(condicao[CHAVE_PRAZO(i)] ?? 0);
  }

  return {
    ID: condicao.ID,
    NOME: condicao.NOME,
    PARCELAS: parcelas,
    VALOR_PARCELA: condicao.VALOR_PARCELA,
    VALOR_MINIMO: condicao.VALOR_PARCELA * parcelas,
    PM: parcelas > 0 ? Math.trunc(somaPrazos / parcelas) : 0,
    PZ01: condicao.PZ01,
    PZ02: condicao.PZ02,
    PZ03: condicao.PZ03,
    PZ04: condicao.PZ04,
    PZ05: condicao.PZ05,
    PZ06: condicao.PZ06,
    PZ07: condicao.PZ07,
    PZ08: condicao.PZ08,
    PZ09: condicao.PZ09,
    PZ10: condicao.PZ10,
    TIPO: condicao.TIPO,
    DESTACAR_DESCONTO: condicao.DESTACAR_DESCONTO,
    DESCONTO_MAX: condicao.DESCONTO_MAX,
    FORMA: condicao.FORMA,
  };
}

/**
 * Mantém apenas as condições que o valor total do pedido atinge e ordena da
 * menor para a maior parcela mínima, reproduzindo o
 * `WHERE (O.valor_parcela*O.PARCELAS) <= valor` e o `ORDER BY 6` do SQL antigo.
 *
 * Não dá para empurrar isso para o `$filter` porque o XData não expõe
 * aritmética entre propriedades do tipo `VALOR_PARCELA mul Parcelas`.
 */
export function filtrarCondicoesPorValor(
  condicoes: iCondicaoPgto[],
  valor: number,
): iCondicaoPgto[] {
  return condicoes
    .filter((condicao) => condicao.VALOR_MINIMO <= valor)
    .sort((a, b) => a.VALOR_MINIMO - b.VALOR_MINIMO);
}
