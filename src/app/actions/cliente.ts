'use server';

import { ResponseType } from '@/@types';
import { iCliente } from '@/@types/Cliente';
import { iFilter } from '@/@types/Filter';
import { iDataResultTable } from '@/@types/Table';
import { CustomFetch } from '@/services/api';
import { getCookie } from '.';
const ROUTE_CLIENTE = '/Clientes';

async function CreateFilter(filter: iFilter<iCliente>): Promise<string> {
  const VendedorLocal: string = await getCookie('user');

  let ResultFilter: string = `$filter=VENDEDOR eq ${VendedorLocal}`;

  if (filter.filter && filter.filter.length >= 1) {
    ResultFilter = `$filter=VENDEDOR eq ${VendedorLocal}`;
    const andStr = ' AND ';
    filter.filter.map((itemFilter) => {
      if (itemFilter.typeSearch) {
        itemFilter.typeSearch === 'like'
          ? (ResultFilter = `${ResultFilter}${andStr} contains(${
              itemFilter.key
            }, '${String(itemFilter.value).toUpperCase()}')${andStr}`)
          : itemFilter.typeSearch === 'eq' &&
            (ResultFilter = `${ResultFilter}${andStr}${itemFilter.key} eq '${itemFilter.value}'${andStr}`);
      } else
        ResultFilter = `${ResultFilter}${andStr} contains(${
          itemFilter.key
        }, '${String(itemFilter.value).toUpperCase()}')${andStr}`;
      return (ResultFilter = ResultFilter.slice(0, -andStr.length));
    });
  }

  const ResultOrderBy = filter.orderBy ? `&$orderby=${filter.orderBy}` : '';

  const ResultSkip = filter.skip ? `&$skip=${filter.skip}` : '&$skip=0';

  let ResultTop = filter.top ? `$top=${filter.top}` : '$top=15';

  ResultFilter !== '' && (ResultTop = `&${ResultTop}`);

  const ResultRoute: string = `?${ResultFilter}${ResultTop}${ResultSkip}${ResultOrderBy}&$inlinecount=allpages`;

  return ResultRoute;
}

export async function GetClienteFromVendedor(
  filter: iFilter<iCliente> | null | undefined
): Promise<ResponseType<iDataResultTable<iCliente>>> {
  const VendedorLocal: string = await getCookie('user');
  const tokenCookie = await getCookie('token');

  const FILTER = filter
    ? await CreateFilter(filter)
    : `?$filter=VENDEDOR eq ${VendedorLocal}&$inlinecount=allpages`;

  const response = await CustomFetch<{
    '@xdata.count': number;
    value: iCliente[];
  }>(`${ROUTE_CLIENTE}${FILTER}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });

  const result: iDataResultTable<iCliente> = {
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

