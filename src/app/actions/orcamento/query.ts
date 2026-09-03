'use server';
import { ResponseType } from '@/@types';
import { iItensOrcamento, iOrcamento } from '@/@types/Orcamento';
import {
  FilterCondition,
  FilterGroup,
  ModelMetadata,
  QueryOptions,
  SearchOperator,
} from '@/@types/QueryFilter';
import { iDataResultTable } from '@/@types/Table';
import { iVendedor } from '@/@types/Vendedor';
import { ODataQueryBuilder } from '@/lib/queryFilter';
import { CustomFetch } from '@/services/api';
import dayjs from 'dayjs';
import { checkStatus } from '@/lib/utils';
import { getCookie, requireAuth } from '..';
import { getVendedorAction } from '../user';
import { ROUTE_GET_ALL_ORCAMENTO } from './constants';

export async function GetOrcamentosFromVendedor(
  filter?: QueryOptions<iOrcamento>,
): Promise<ResponseType<iDataResultTable<iOrcamento>>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const VendedorLocal: string = await getCookie('user');
  const Vendedor: iVendedor = (await getVendedorAction()).value!;
  const tokenCookie = auth.value!;
  const OrcamentoMetadata = {
    ORCAMENTO: 'number' as const,
    VENDEDOR: 'number' as const,
    CLIENTE: 'number' as const,
    TOTAL: 'number' as const,
    DATA: 'date' as const,
    PV: 'string' as const,
    TIPO: 'string' as const,
    BLOQUEADO: 'string' as const,
    ItensOrcamento: 'string' as const,
  } satisfies ModelMetadata<iOrcamento>;

  const formattedFilter =
    filter &&
    filter.filter!.conditions.map((f) => {
      const condition = f as FilterCondition<iOrcamento>;
      const operator: SearchOperator = condition.operator;
      return {
        key: condition.key,
        value: condition.value,
        operator: operator || 'eq',
      };
    });

  const filterConditions: FilterGroup<iOrcamento> = filter?.filter!;

  const QueryBuilder = new ODataQueryBuilder<iOrcamento>(
    OrcamentoMetadata,
  ).expand(
    'VENDEDOR',
    'CLIENTE',
    'ItensOrcamento/PRODUTO/FORNECEDOR',
    'ItensOrcamento/PRODUTO/FABRICANTE',
    'ItensOrcamento',
    'ItensOrcamento/PRODUTO',
  );

  const filterVendedor: Array<
    FilterCondition<iOrcamento> | FilterGroup<iOrcamento>
  > =
    Vendedor.TIPO_VENDEDOR === 'I'
      ? []
      : [
          {
            key: 'VENDEDOR',
            operator: 'eq',
            value: VendedorLocal,
          },
        ];

  filter !== undefined
    ? QueryBuilder.where({
        operator: filterConditions.operator,
        conditions: [
          ...(filterVendedor as FilterGroup<iOrcamento>['conditions']),
          ...(formattedFilter as FilterGroup<iOrcamento>['conditions']),
        ],
      })
        .top(filter.top || 10)
        .skip(filter.skip || 0)
        .orderBy(filter.orderBy || 'ORCAMENTO', 'desc')
        .build()
    : QueryBuilder.where({
        operator: 'and',
        conditions: [
          ...(filterVendedor as FilterGroup<iOrcamento>['conditions']),
          {
            key: 'DATA',
            operator: 'ge',
            value: `${dayjs().subtract(36, 'hours').format('YYYY-MM-DD')}`,
          },
          {
            operator: 'or',
            conditions: [
              {
                key: 'PV',
                operator: 'eq',
                value: 'N',
              },
              {
                key: 'PV',
                operator: 'eq',
                value: null,
              },
            ],
          },
        ],
      })
        .top(10)
        .skip(0)
        .orderBy('ORCAMENTO', 'desc');

  const FILTER = QueryBuilder.build();

  const response = await CustomFetch<{
    '@xdata.count': number;
    value: iOrcamento[];
  }>(`${ROUTE_GET_ALL_ORCAMENTO}${FILTER}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });

  const statusError = checkStatus(response);
  if (statusError) return statusError;

  const result: iDataResultTable<iOrcamento> = {
    Qtd_Registros: response.body!['@xdata.count'],
    value: response.body!.value,
  };

  return {
    value: result,
    error: undefined,
  };
}

export async function GetOrcamento(
  OrcamentoNumber: string | number,
): Promise<ResponseType<iOrcamento>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

  const response = await CustomFetch<iOrcamento>(
    `${ROUTE_GET_ALL_ORCAMENTO}(${OrcamentoNumber})?$expand=VENDEDOR,CLIENTE,
    ItensOrcamento/PRODUTO/FORNECEDOR,ItensOrcamento/PRODUTO/FABRICANTE,ItensOrcamento,
    ItensOrcamento/PRODUTO,ItensOrcamento/ORCAMENTO,ItensOrcamento/PRODUTO/ListaChaves`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  const statusError = checkStatus(response);
  if (statusError) return statusError;

  const result: iOrcamento = response.body!;

  const itensOrcs: iItensOrcamento[] = response.body!.ItensOrcamento.map(
    (item) => {
      return { ...item, ORCAMENTO: response.body!.ORCAMENTO };
    },
  );

  return {
    value: {
      ...result,
      ItensOrcamento: itensOrcs,
    },
    error: undefined,
  };
}
