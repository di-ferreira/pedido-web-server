'use server';
import { iApiResult, ResponseType } from '@/@types';
import { iFilter, iFilterQuery } from '@/@types/Filter';
import { iLiberacoes } from '@/@types/Liberacoes';
import { iDataResultTable } from '@/@types/Table';
import { CustomFetch } from '@/services/api';
import dayjs from 'dayjs';
import { getCookie } from '.';
import { getVendedorAction } from './user';

const ROUTE_GET_ALL_LIBERACOES = '/Liberacoes';

function ReturnFilterQuery(typeSearch: iFilterQuery<iLiberacoes>): string {
  // Tratamento especial para valores nulos
  if (typeSearch.value === null) {
    return typeSearch.typeSearch === 'ne'
      ? `${typeSearch.key} ne null`
      : `${typeSearch.key} eq null`;
  }

  // Tratamento para operações numéricas
  if (['CHAVE', 'ID_ONDE'].includes(String(typeSearch.key))) {
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

async function CreateQueryParams(
  filter: iFilter<iLiberacoes>,
): Promise<string> {
  // 1. Separação dos filtros por campo
  const groupedFilters: { [key: string]: iFilterQuery<iLiberacoes>[] } = {};

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
    const groupOperator = items[0].groupOperator; // || (key === 'ONDE' ? 'or' : 'and');

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
  dateFilter = `DATA_HORA ge ${dayjs()
    .subtract(1, 'day')
    .format('YYYY-MM-DD HH:mm')}`;
  conditions.push(dateFilter);

  // Filtro do vendedor (sempre presente)
  conditions.unshift(`QUEM eq ${VendedorLocal}`);

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
  return `?${filterString}${ResultTop}${ResultSkip}${ResultOrderBy}&$inlinecount=allpages`;
}

export async function CreateLiberacao(
  liberacao: iLiberacoes,
): Promise<ResponseType<iLiberacoes>> {
  const tokenCookie = await getCookie('token');

  const response = await CustomFetch<iApiResult<iLiberacoes>>(
    `${ROUTE_GET_ALL_LIBERACOES}`,
    {
      method: 'POST',
      body: JSON.stringify(liberacao),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

  if (response.status !== 201) {
    return {
      value: undefined,
      error: {
        code: String(response.status),
        message: String(response.statusText),
      },
    };
  }

  return {
    value: response.body?.Data,
    error: undefined,
  };
}

export async function UpdateLiberacao(
  liberacao: iLiberacoes,
): Promise<ResponseType<iLiberacoes>> {
  const tokenCookie = await getCookie('token');

  const response = await CustomFetch<iApiResult<iLiberacoes>>(
    `${ROUTE_GET_ALL_LIBERACOES}(${liberacao.ID})`,
    {
      method: 'PUT',
      body: JSON.stringify(liberacao),
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
    value: response.body?.Data,
    error: undefined,
  };
}

export async function LoadLiberacao(
  filter?: iFilter<iLiberacoes> | null | undefined,
): Promise<ResponseType<iDataResultTable<iLiberacoes>>> {
  const tokenCookie = await getCookie('token');
  const VendedorLocal: string = await getCookie('user');

  const FILTER = filter
    ? await CreateQueryParams(filter)
    : `?$filter=USADO eq 'N' and QUEM eq ${VendedorLocal} and DATA_HORA ge ${dayjs()
        .subtract(1, 'day')
        .format(
          'YYYY-MM-DD HH:mm',
        )}&$orderby=iddesc&$top=50&$inlinecount=allpages`;

  const response = await CustomFetch<{
    '@xdata.count': number;
    value: iLiberacoes[];
  }>(`${ROUTE_GET_ALL_LIBERACOES}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });

  const result: iDataResultTable<iLiberacoes> = {
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

export async function LoadLiberacaoCliente(
  cliente: number,
): Promise<ResponseType<iLiberacoes>> {
  const tokenCookie = await getCookie('token');

  const URL = `?$filter=USADO eq 'N' and ID_ONDE ne '9999' and CHAVE eq ${cliente}&$top=1`;

  const response = await CustomFetch<{
    '@xdata.count': number;
    value: iLiberacoes[];
  }>(`${ROUTE_GET_ALL_LIBERACOES}${URL}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });

  let result: iLiberacoes = response.body?.value[0]!;

  if (response.status !== 200 && response.body?.value[0]) {
    return {
      value: undefined,
      error: {
        code: String(response.status),
        message: String(response.statusText),
      },
    };
  } else
    return {
      value: result,
      error: undefined,
    };
}

export async function Liberacoes(
  param: iLiberacoes,
): Promise<ResponseType<iLiberacoes>> {
  const agora = dayjs();
  const vendedor = await getVendedorAction();

  // dataLimite.setDate(dataLimite.getDate() - 1); // DataServidor - 1 dia

  // Busca por critérios
  const liberacao = (await LoadLiberacaoCliente(param.CHAVE)).value!;

  if (!liberacao) {
    // Cria nova liberação
    const novaLiberacao = CreateLiberacao({
      ID: 0,
      NOME: param.NOME,
      CODIGO: param.CODIGO,
      CHAVE: param.CHAVE,
      DATA_HORA: agora.format('YYYY-MM-DD'),
      QUEM: ('Ven:' + vendedor.value!.NOME).substring(0, 10),
      ONDE: 'PRÉ-VENDA',
      MOVIMENTO: param.MOVIMENTO,
      ID_ONDE: 9999,
      USADO: 'N',
      OBS: param.OBS,
    });

    return novaLiberacao;
  } else {
    if (liberacao.ID_ONDE !== 9999) {
      // Atualiza como usada
      const novaLiberacao = UpdateLiberacao({
        ...liberacao,
        ONDE: param.ONDE,
        ID_ONDE: param.ID_ONDE,
        USADO: 'S',
      });

      return novaLiberacao;
    } else {
      // Renova a liberação
      const novaLiberacao = UpdateLiberacao({
        ...liberacao,
        DATA_HORA: agora.format('YYYY-MM-DD'),
        OBS: param.OBS,
      });

      return novaLiberacao;
    }
  }
}

