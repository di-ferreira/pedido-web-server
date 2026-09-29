'use server';

import { iApiResult, ResponseType } from '@/@types';
import { iFilter } from '@/@types/Filter';
import {
  iCondicaoPgto,
  iCondicaoPgtoApi,
  iFormaPgto,
  iMovimento,
  iPreVenda,
  iTransportadora,
} from '@/@types/PreVenda';
import { iDataResultTable } from '@/@types/Table';
import { FilterCondition } from '@/@types/QueryFilter';
import { filtrarCondicoesPorValor, mapCondicaoPgto } from '@/lib/condicaoPgto';
import { ODataQueryBuilder, sanitizeODataValue } from '@/lib/queryFilter';
import { CustomFetch } from '@/services/api';
import { checkStatus } from '@/lib/utils';
import { getCookie, requireAuth } from '.';
import { CondicaoPgtoMetadata } from './const_metadatas';
const ROUTE_GET_ALL_PRE_VENDA = '/Movimento';
const ROUTE_SAVE_PRE_VENDA = '/ServiceVendas/NovaPreVenda';
const ROUTE_SELECT_SQL = '/ServiceSistema/SelectSQL';
const ROUTE_CONDICAO_PGTO = '/CondicoesDePagamento';

// Paginação não pode truncar a lista: o filtro por valor mínimo e a ordenação
// são feitos em memória depois, então `$top` precisa cobrir todas as condições
// da tabela. O valor é alto de propósito — condições de pagamento são poucas.
const TOP_CONDICAO_PGTO = 500;

const SQL_FORMA_PGTO =
  "SELECT C.CARTAO FROM CAR C WHERE C.CAIXA='S' order by 1";
const SQL_TRANSPORTADORA =
  'SELECT FIRST 1500 F.FORNECEDOR, F.NOME, F.CIDADE FROM FNC F ORDER BY F.NOME';

const CreateFilter = async (filter: iFilter<iMovimento>): Promise<string> => {
  const VendedorLocal: string = await getCookie('user');

  let ResultFilter: string = `$filter=TIPOMOV eq 'PRE-VENDA'and CANCELADO eq 'N' and VENDEDOR eq ${VendedorLocal}`;

  if (filter.filter && filter.filter.length >= 1) {
    ResultFilter = `$filter=VENDEDOR eq ${VendedorLocal}`;
    const andStr = ' AND ';
    filter.filter.map((itemFilter) => {
      if (itemFilter.typeSearch)
        itemFilter.typeSearch === 'like'
          ? (ResultFilter = `${ResultFilter}${andStr}${
              itemFilter.key
            } like '% ${sanitizeODataValue(
              String(itemFilter.value).toUpperCase(),
            )} %'${andStr}`)
          : itemFilter.typeSearch === 'eq' &&
            (ResultFilter = `${ResultFilter}${andStr}${itemFilter.key} eq '${sanitizeODataValue(
              itemFilter.value,
            )}'${andStr}`);
      else
        ResultFilter = `${ResultFilter}${andStr}${
          itemFilter.key
        } like '% ${sanitizeODataValue(
          String(itemFilter.value).toUpperCase(),
        )} %'${andStr}`;
      return ResultFilter;
    });
    ResultFilter = ResultFilter.slice(0, -andStr.length);
  }

  const ResultOrderBy = filter.orderBy
    ? `&$orderby=${filter.orderBy}`
    : '&$orderby=MOVIMENTO desc,DATA desc';

  const ResultSkip = filter.skip ? `&$skip=${filter.skip}` : '&$skip=0';

  let ResultTop = filter.top ? `$top=${filter.top}` : '$top=15';

  ResultFilter !== '' && (ResultTop = `&${ResultTop}`);

  const ResultRoute: string = `?${ResultFilter}${ResultTop}${ResultSkip}${ResultOrderBy}&$inlinecount=allpages&$orderby=DATA desc&$expand=CLIENTE,VENDEDOR,Itens_List,Itens_List/PRODUTO`;

  return ResultRoute;
};

export async function GetPreVendas(
  filter: iFilter<iMovimento>,
): Promise<ResponseType<iDataResultTable<iMovimento>>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const VendedorLocal: string = await getCookie('user');
  const tokenCookie = auth.value!;

  const FILTER = filter
    ? await CreateFilter(filter)
    : `?$filter=VENDEDOR eq ${VendedorLocal} and TIPOMOV eq 'PRE-VENDA' and CANCELADO eq 'N'&$top=15&$inlinecount=allpages&$orderby=MOVIMENTO desc,DATA desc&$expand=CLIENTE,VENDEDOR,Itens_List,Itens_List/PRODUTO`;

  const response = await CustomFetch<{
    '@xdata.count': number;
    value: iMovimento[];
  }>(`${ROUTE_GET_ALL_PRE_VENDA}${FILTER}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });

  const statusError = checkStatus(response);
  if (statusError) return statusError;

  const result: iDataResultTable<iMovimento> = {
    Qtd_Registros: response.body!['@xdata.count'],
    value: response.body!.value,
  };

  return {
    value: result,
    error: undefined,
  };
}

export async function GetPreVenda(IdPV: number): Promise<ResponseType<iMovimento>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

  const response = await CustomFetch<iMovimento>(
    `${ROUTE_GET_ALL_PRE_VENDA}(${IdPV})?$expand=CLIENTE,VENDEDOR,Itens_List,Itens_List/PRODUTO`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  if (response.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(response.status),
        message: String(response.statusText),
      },
    };
  }

  return {
    value: response.body!,
    error: undefined,
  };
}

export async function GetFormasPGTO(): Promise<ResponseType<iFormaPgto[]>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

  const response = await CustomFetch<iApiResult<iFormaPgto[]>>(
    `${ROUTE_SELECT_SQL}?pSQL=${SQL_FORMA_PGTO}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  if (response.body!.StatusCode !== 200) {
    return {
      value: undefined,
      error: {
        code: String(response.body!.StatusCode),
        message: String(response.body!.StatusMessage),
      },
    };
  }

  return {
    value: response.body!.Data,
    error: undefined,
  };
}

/**
 * Lista as condições de pagamento elegíveis para o total informado, via
 * `GET /CondicoesDePagamento`.
 *
 * A elegibilidade por valor mínimo não vai no `$filter` (o XData não expõe
 * aritmética entre propriedades) — ela é aplicada em memória por
 * `filtrarCondicoesPorValor`, junto com a ordenação.
 */
export async function GetCondicaoPGTO(
  valor: number,
  tabela: string,
  somenteAvista = false,
): Promise<ResponseType<iCondicaoPgto[]>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

  const conditions: FilterCondition<iCondicaoPgtoApi>[] = [
    { key: 'TABELA', value: tabela, operator: 'eq' },
    { key: 'TIPO', value: 'V', operator: 'eq' },
  ];

  if (somenteAvista) {
    conditions.push({ key: 'Parcelas', value: 1, operator: 'eq' });
  }

  // O $filter do XData não expõe aritmética (VALOR_PARCELA mul Parcelas), então
  // a elegibilidade por valor mínimo é aplicada depois, em memória.
  const query = new ODataQueryBuilder<iCondicaoPgtoApi>(CondicaoPgtoMetadata)
    .where({ operator: 'and', conditions })
    .top(TOP_CONDICAO_PGTO)
    .orderBy('VALOR_PARCELA', 'asc')
    .build();

  const response = await CustomFetch<{
    '@xdata.count': number;
    value: iCondicaoPgtoApi[];
  }>(`${ROUTE_CONDICAO_PGTO}${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });

  if (response.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(response.status),
        message: String(response.statusText),
      },
    };
  }

  const value = filtrarCondicoesPorValor(
    (response.body?.value ?? []).map(mapCondicaoPgto),
    valor,
  );

  return {
    value,
    error: undefined,
  };
}

export async function GetTransport(): Promise<ResponseType<iTransportadora[]>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

  const response = await CustomFetch<iApiResult<iTransportadora[]>>(
    `${ROUTE_SELECT_SQL}?pSQL=${SQL_TRANSPORTADORA}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  if (response.body!.StatusCode !== 200) {
    return {
      value: undefined,
      error: {
        code: String(response.body!.StatusCode),
        message: String(response.body!.StatusMessage),
      },
    };
  }

  return {
    value: response.body!.Data,
    error: undefined,
  };
}

export async function SavePreVenda(
  PreVenda: iPreVenda,
): Promise<ResponseType<iMovimento>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

  const responseInsert = await CustomFetch<iMovimento>(ROUTE_SAVE_PRE_VENDA, {
    body: JSON.stringify(PreVenda),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });

  if (responseInsert.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(responseInsert.status),
        message: String(responseInsert.statusText),
      },
    };
  }

  return {
    value: responseInsert.body!,
    error: undefined,
  };
}

