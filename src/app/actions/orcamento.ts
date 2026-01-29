'use server';
import { iApiResult, ResponseType } from '@/@types';
import { iFilter, iFilterQuery } from '@/@types/Filter';
import {
  iItemInserir,
  iItemRemove,
  iItensOrcamento,
  iOrcamento,
  iOrcamentoInserir,
} from '@/@types/Orcamento';
import { iDataResultTable } from '@/@types/Table';
import { CustomFetch } from '@/services/api';
import dayjs from 'dayjs';
import { getCookie } from '.';
const ROUTE_GET_ALL_ORCAMENTO = '/Orcamento';
const ROUTE_SAVE_ORCAMENTO = '/ServiceVendas/NovoOrcamento';
const ROUTE_REMOVE_ITEM_ORCAMENTO = '/ServiceVendas/ExcluirItemOrcamento';
const ROUTE_SAVE_ITEM_ORCAMENTO = '/ServiceVendas/NovoItemOrcamento';

function ReturnFilterQuery(typeSearch: iFilterQuery<iOrcamento>): string {
  // Tratamento especial para valores nulos
  if (typeSearch.value === null) {
    return typeSearch.typeSearch === 'ne'
      ? `${typeSearch.key} ne null`
      : `${typeSearch.key} eq null`;
  }

  // Tratamento para operações numéricas
  if (['TOTAL', 'ORCAMENTO'].includes(String(typeSearch.key))) {
    switch (typeSearch.typeSearch) {
      case 'gt':
        return `${typeSearch.key} gt ${typeSearch.value}`;
      case 'lt':
        return `${typeSearch.key} lt ${typeSearch.value}`;
      case 'ge':
        return `${typeSearch.key} ge ${typeSearch.value}`;
      case 'le':
        return `${typeSearch.key} le ${typeSearch.value}`;
    }
  }

  // Tratamento padrão
  switch (typeSearch.typeSearch) {
    case 'like':
      return `contains(${typeSearch.key}, '${String(
        typeSearch.value,
      ).toUpperCase()}')`;

    case 'eq':
      return `${typeSearch.key} eq '${typeSearch.value}'`;

    case 'ne':
      return `${typeSearch.key} ne '${typeSearch.value}'`;

    default:
      return `contains(${typeSearch.key}, '${String(
        typeSearch.value,
      ).toUpperCase()}')`;
  }
}

async function CreateQueryParams(filter: iFilter<iOrcamento>): Promise<string> {
  // 1. Separação dos filtros por campo
  const groupedFilters: { [key: string]: iFilterQuery<iOrcamento>[] } = {};

  // Adiciona filtros do usuário
  filter.filter?.forEach((item) => {
    if (!groupedFilters[item.key]) {
      groupedFilters[item.key] = [];
    }
    groupedFilters[item.key].push(item);
  });

  // 2. Gera condições agrupadas
  const conditions: string[] = [];

  Object.entries(groupedFilters).forEach(([key, items]) => {
    // Determina operador de agrupamento (padrão: 'or' para PV, 'and' para outros)
    const groupOperator =
      items[0].groupOperator || (key === 'PV' ? 'or' : 'and');

    // Gera sub-condições
    const subConditions = items.map(ReturnFilterQuery).filter(Boolean);

    // Agrupa com operador definido
    if (subConditions.length > 1) {
      conditions.push(`(${subConditions.join(` ${groupOperator} `)})`);
    }
    // Única condição → adiciona sem parênteses
    else if (subConditions.length === 1) {
      conditions.push(subConditions[0]);
    }
  });

  // 3. Adiciona filtros fixos (VENDEDOR e DATA)
  const VendedorLocal: string = await getCookie('user');

  let dateFilter = '';
  dateFilter = `DATA ge ${dayjs().subtract(1, 'day').format('YYYY-MM-DD')}`;
  conditions.push(dateFilter);

  // Filtro do vendedor (sempre presente)
  conditions.unshift(`VENDEDOR eq ${VendedorLocal}`);

  // 4. Monta a string final
  const filterString = conditions.length
    ? `$filter=${conditions.join(' and ')}`
    : '';

  // 5. Parâmetros de paginação e ordenação
  const ResultTop = filter.top ? `&$top=${filter.top}` : '&$top=15';
  const ResultSkip = filter.skip ? `&$skip=${filter.skip}` : '&$skip=0';
  const ResultOrderBy = filter.orderBy
    ? `&$orderby=${filter.orderBy}`
    : '&$orderby=ORCAMENTO desc';

  // 6. Monta URL final
  return `?${filterString}${ResultTop}${ResultSkip}${ResultOrderBy}&$expand=VENDEDOR,CLIENTE,ItensOrcamento/PRODUTO/FORNECEDOR,ItensOrcamento/PRODUTO/FABRICANTE,ItensOrcamento,ItensOrcamento/PRODUTO&$inlinecount=allpages`;
}

export async function GetOrcamentosFromVendedor(
  filter?: iFilter<iOrcamento> | null | undefined,
): Promise<ResponseType<iDataResultTable<iOrcamento>>> {
  const VendedorLocal: string = await getCookie('user');

  const tokenCookie = await getCookie('token');

  const FILTER = filter
    ? await CreateQueryParams(filter)
    : `?$filter=VENDEDOR eq ${VendedorLocal} and DATA ge ${dayjs()
        .subtract(1, 'day')
        .format(
          'YYYY-MM-DD',
        )} and (PV ne 'S' or PV eq null)&$orderby=ORCAMENTO desc&$top=10&$expand=VENDEDOR,CLIENTE,ItensOrcamento/PRODUTO/FORNECEDOR,ItensOrcamento/PRODUTO/FABRICANTE,ItensOrcamento,ItensOrcamento/PRODUTO&$inlinecount=allpages`;

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

  const result: iDataResultTable<iOrcamento> = {
    Qtd_Registros: response.body!['@xdata.count'],
    value: response.body!.value,
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

export async function GetOrcamento(
  OrcamentoNumber: string | number,
): Promise<ResponseType<iOrcamento>> {
  const tokenCookie = await getCookie('token');

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

  const result: iOrcamento = response.body!;

  if (response.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(response.status),
        message: String(response.statusText),
      },
    };
  }

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

export async function NewOrcamento(orcamento: iOrcamento) {
  const tokenCookie = await getCookie('token');
  const VendedorLocal: string = await getCookie('user');
  const ItensOrcamento: iItemInserir[] = [];

  orcamento.ItensOrcamento?.map((item) => {
    const ItemInsert: iItemInserir = {
      pIdOrcamento: 0,
      pItemOrcamento: {
        CodigoProduto: item.PRODUTO ? item.PRODUTO.PRODUTO : '',
        Qtd: item.QTD,
        SubTotal: item.SUBTOTAL,
        Tabela: item.TABELA ? item.TABELA : 'SISTEMA',
        Total: item.TOTAL,
        Valor: item.VALOR,
        Frete: 0,
        Desconto: 0,
      },
    };
    ItensOrcamento.push(ItemInsert);
  });

  const OrcamentoInsert: iOrcamentoInserir = {
    CodigoCliente: orcamento.CLIENTE.CLIENTE,
    CodigoVendedor1: Number(VendedorLocal),
    Total: orcamento.TOTAL,
    SubTotal: orcamento.TOTAL,
    Itens: ItensOrcamento,
  };

  const responseInsert = await CustomFetch<iApiResult<iOrcamento>>(
    ROUTE_SAVE_ORCAMENTO,
    {
      body: JSON.stringify(OrcamentoInsert),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  if (responseInsert.body!.StatusCode !== 200) {
    return {
      value: undefined,
      error: {
        code: String(responseInsert.body!.StatusCode),
        message: String(responseInsert.body!.StatusMessage),
      },
    };
  }

  const response = await GetOrcamento(responseInsert.body!.Data.ORCAMENTO);

  if (response.error !== undefined) {
    return {
      value: undefined,
      error: {
        code: response.error.code,
        message: response.error.message,
      },
    };
  }

  return {
    value: response.value,
    error: undefined,
  };
}

export async function UpdateOrcamento(orcamento: iOrcamento) {
  const tokenCookie = await getCookie('token');
  const VendedorLocal: string = await getCookie('user');

  const itens = orcamento.ItensOrcamento.map((i) => {
    return { ...i, ORCAMENTO: String(i.ORCAMENTO) };
  });

  const responseInsert = await CustomFetch<iOrcamento>(
    `/Orcamento(${orcamento.ORCAMENTO})`,
    {
      body: JSON.stringify({
        OBS1: orcamento.OBS1,
        OBS2: orcamento.OBS2,
        PV: orcamento.PV,
      }),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );
  if (responseInsert.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(responseInsert.status),
        message: String(responseInsert.statusText),
      },
    };
  }

  const response = await GetOrcamento(responseInsert.body!.ORCAMENTO);

  if (response.error !== undefined) {
    return {
      value: undefined,
      error: {
        code: response.error.code,
        message: response.error.message,
      },
    };
  }

  return {
    value: response.value,
    error: undefined,
  };
}

export async function RemoverOrcamento(orcamento: iOrcamento) {
  const tokenCookie = await getCookie('token');
  // 1. Remove todos os itens SEQUENCIALMENTE (garantindo ordem e tratamento de erro)
  for (const item of orcamento.ItensOrcamento) {
    const result = await removeItem({
      pIdOrcamento: orcamento.ORCAMENTO,
      pProduto: item.PRODUTO.PRODUTO,
    });

    // 2. Se ANY item falhar, interrompe e retorna o erro
    if (result.error) {
      return {
        value: undefined,
        error: result.error,
      };
    }
  }

  // 3. Só chega aqui se TODOS os itens foram removidos com sucesso
  const responseRemove = await CustomFetch<any>(
    `/Orcamento(${orcamento.ORCAMENTO})`,
    {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  // 4. Trata erro na remoção do orçamento
  if (responseRemove.status !== 204) {
    return {
      value: undefined,
      error: {
        code: String(responseRemove.status),
        message: String(responseRemove.statusText),
      },
    };
  }

  return {
    value: 'Orçamento excluído com sucesso!',
    error: undefined,
  };
}

export async function removeItem(
  itemOrcamento: iItemRemove,
): Promise<ResponseType<iOrcamento>> {
  const tokenCookie = await getCookie('token');

  const data = await CustomFetch<iApiResult<iOrcamento>>(
    ROUTE_REMOVE_ITEM_ORCAMENTO,
    {
      body: JSON.stringify({
        pIdOrcamento: itemOrcamento.pIdOrcamento,
        pProduto: itemOrcamento.pProduto,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  const response = await GetOrcamento(itemOrcamento.pIdOrcamento);

  if (response.error !== undefined) {
    return {
      value: undefined,
      error: {
        code: response.error.code,
        message: response.error.message,
      },
    };
  }

  if (data.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(data.status),
        message: String(data.statusText),
      },
    };
  }
  return {
    value: response.value,
    error: undefined,
  };
}

export async function addItem(itemOrcamento: iItemInserir) {
  const tokenCookie = await getCookie('token');
  const res = await CustomFetch<iApiResult<iOrcamento>>(
    ROUTE_SAVE_ITEM_ORCAMENTO,
    {
      body: JSON.stringify(itemOrcamento),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  if (res.body!.StatusCode !== 200) {
    return {
      value: undefined,
      error: {
        code: String(res.body!.StatusCode),
        message: String(res.body!.StatusMessage),
      },
    };
  }

  const response = await GetOrcamento(itemOrcamento.pIdOrcamento);

  if (response.error !== undefined) {
    return {
      value: undefined,
      error: {
        code: response.error.code,
        message: response.error.message,
      },
    };
  }

  return {
    value: response.value,
    error: undefined,
  };
}

export async function updateItem(itemOrcamento: iItemInserir) {
  const tokenCookie = await getCookie('token');

  const removeResult = await CustomFetch<iApiResult<iOrcamento>>(
    ROUTE_REMOVE_ITEM_ORCAMENTO,
    {
      body: JSON.stringify({
        pIdOrcamento: itemOrcamento.pIdOrcamento,
        pProduto: itemOrcamento.pItemOrcamento.CodigoProduto,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  if (removeResult.body!.StatusCode !== 200) {
    return {
      value: undefined,
      error: {
        code: String(removeResult.body!.StatusCode),
        message: String(removeResult.body!.StatusMessage),
      },
    };
  }

  const resultSave = await CustomFetch<iApiResult<iOrcamento>>(
    ROUTE_SAVE_ITEM_ORCAMENTO,
    {
      body: JSON.stringify(itemOrcamento),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  if (resultSave.body!.StatusCode !== 200) {
    return {
      value: undefined,
      error: {
        code: String(resultSave.body!.StatusCode),
        message: String(resultSave.body!.StatusMessage),
      },
    };
  }

  const response = await GetOrcamento(itemOrcamento.pIdOrcamento);

  if (response.error !== undefined) {
    return {
      value: undefined,
      error: {
        code: response.error.code,
        message: response.error.message,
      },
    };
  }

  return {
    value: response.value,
    error: undefined,
  };
}

