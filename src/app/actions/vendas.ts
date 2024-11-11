'use server';

import { iFilter } from '@/@types/Filter';
import { iMovimento } from '@/@types/PreVenda';
import { iDataResultTable } from '@/@types/Table';
import { CustomFetch } from '@/services/api';
import { getCookie } from '.';

const ROUTE_GET_ALL_PRE_VENDA = '/Movimento';

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
            } like '% ${String(itemFilter.value).toUpperCase()} %'${andStr}`)
          : itemFilter.typeSearch === 'eq' &&
            (ResultFilter = `${ResultFilter}${andStr}${itemFilter.key} eq '${itemFilter.value}'${andStr}`);
      else
        ResultFilter = `${ResultFilter}${andStr}${
          itemFilter.key
        } like '% ${String(itemFilter.value).toUpperCase()} %'${andStr}`;

      return ResultFilter;
    });

    ResultFilter = ResultFilter.slice(0, -andStr.length);
  }

  const ResultOrderBy = filter.orderBy ? `&$orderby=${filter.orderBy}` : '';

  const ResultSkip = filter.skip ? `&$skip=${filter.skip}` : '&$skip=0';

  let ResultTop = filter.top ? `$top=${filter.top}` : '$top=15';

  ResultFilter !== '' && (ResultTop = `&${ResultTop}`);

  const ResultRoute: string = `?${ResultFilter}${ResultTop}${ResultSkip}${ResultOrderBy}&$inlinecount=allpages&$orderby=DATA desc&$expand=CLIENTE,VENDEDOR,Itens_List,Itens_List/PRODUTO`;

  return ResultRoute;
};

export async function GetVendas(filter: iFilter<iMovimento>) {
  const VendedorLocal: string = await getCookie('user');
  const tokenCookie = await getCookie('token');

  const FILTER = filter
    ? await CreateFilter(filter)
    : `?$filter=VENDEDOR eq ${VendedorLocal} and TIPOMOV eq 'VENDA' and CANCELADO eq 'N'&$top=15&$inlinecount=allpages&$orderby=DATA desc&$expand=CLIENTE,VENDEDOR,Itens_List,Itens_List/PRODUTO`;

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

  const result: iDataResultTable<iMovimento> = {
    Qtd_Registros: response.body['@xdata.count'],
    value: response.body.value,
  };

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
    value: result,
    error: undefined,
  };
}

