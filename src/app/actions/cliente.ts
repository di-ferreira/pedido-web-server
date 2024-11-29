'use server';

import { iSelectSQL, ResponseType } from '@/@types';
import { iCliente } from '@/@types/Cliente';
import { iFilter } from '@/@types/Filter';
import { iDataResultTable } from '@/@types/Table';
import { CustomFetch } from '@/services/api';
import dayjs from 'dayjs';
import { getCookie } from '.';
const ROUTE_CLIENTE = '/Clientes';
const ROUTE_SELECT_SQL = '/ServiceSistema/SelectSQL';
const SQL_PGTO_ATRAZO = `SELECT COUNT(R.REGISTRO) AS QTD, SUM(R.RESTA) AS VALOR
FROM CTS R
JOIN CAR C ON (C.CARTAO=R.TIPO)
WHERE R.CONTA IN ('R','C') AND
      R.RESTA>0 AND
      R.VENCIMENTO<:DATA AND
      R.CLIENTE=:CLIENTE AND
      COALESCE(C.financeiro_cliente,'N')='S' AND
      R.CANCELADO='N'`;

const SQL_PGTO_NAO_VENCIDAS = `SELECT COUNT(R.REGISTRO) AS QTD, SUM(R.RESTA) AS VALOR
FROM CTS R
JOIN CAR C ON (C.CARTAO=R.TIPO)
WHERE R.CONTA IN ('C','R') AND
      R.RESTA>0 AND
      R.VENCIMENTO>=:DATA AND
      R.CLIENTE=:CLIENTE AND
      COALESCE(C.financeiro_cliente,'N')='S' AND
      R.CANCELADO='N'`;

const SQL_CONTAS_ABERTAS = `select R.VENCIMENTO,
       R.DATA,
       R.TIPO,
       R.HISTORICO,
       cast('TODAY' as date) - R.VENCIMENTO as ATRASO,
       R.RESTA,
       R.DOC,
       R.EMISSAO_BOLETO
from CTS R
LEFT OUTER JOIN CAR C ON (C.cartao=R.tipo)
where R.CONTA in ('R', 'C') and
      R.CANCELADO = 'N' and
      COALESCE(C.financeiro_cliente,'N')='S' AND
      R.CLIENTE = :CLIENTE and
      R.RESTA <> 0
order by 1`;

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

export async function GetCliente(
  customerCode: string | number
): Promise<ResponseType<iCliente>> {
  const tokenCookie = await getCookie('token');

  const response = await CustomFetch<iCliente>(
    `${ROUTE_CLIENTE}(${customerCode})?$expand=Telefones, AgendamentosList, PendenciasList`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    }
  );

  const result: iCliente = response.body;

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

export async function GetPGTOsAtrazados(cliente: number) {
  const tokenCookie = await getCookie('token');

  const body: string = JSON.stringify({
    pSQL: SQL_PGTO_ATRAZO,
    pPar: [
      {
        ParamName: 'CLIENTE',
        ParamType: 'ftInteger',
        ParamValues: [cliente],
      },
      {
        ParamName: 'DATA',
        ParamType: 'ftString',
        ParamValues: [String(dayjs().format('YYYY-MM-DD'))],
      },
    ],
  } as iSelectSQL);

  const response = await CustomFetch<any>(`${ROUTE_SELECT_SQL}`, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });

  if (response.body.StatusCode !== 200) {
    return {
      value: undefined,
      error: {
        code: String(response.body.StatusCode),
        message: String(response.body.StatusMessage),
      },
    };
  }

  return {
    value: response.body.Data,
    error: undefined,
  };
}

export async function GetPGTOsNaoVencidos(cliente: number) {
  const tokenCookie = await getCookie('token');

  const body: string = JSON.stringify({
    pSQL: SQL_PGTO_NAO_VENCIDAS,
    pPar: [
      {
        ParamName: 'CLIENTE',
        ParamType: 'ftInteger',
        ParamValues: [cliente],
      },
      {
        ParamName: 'DATA',
        ParamType: 'ftString',
        ParamValues: [String(dayjs().format('YYYY-MM-DD'))],
      },
    ],
  } as iSelectSQL);

  const response = await CustomFetch<any>(`${ROUTE_SELECT_SQL}`, {
    method: 'POST',
    body: body,
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

  return {
    value: response.body,
    error: undefined,
  };
}

export async function GetPGTOsEmAberto(cliente: number) {
  const tokenCookie = await getCookie('token');

  const body: string = JSON.stringify({
    pSQL: SQL_CONTAS_ABERTAS,
    pPar: [
      {
        ParamName: 'CLIENTE',
        ParamType: 'ftInteger',
        ParamValues: [cliente],
      },
    ],
  } as iSelectSQL);

  const response = await CustomFetch<any>(`${ROUTE_SELECT_SQL}`, {
    method: 'POST',
    body: body,
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

  return {
    value: response.body,
    error: undefined,
  };
}

