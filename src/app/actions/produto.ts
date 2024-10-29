'use server';

import { iApiResult, ResponseType } from '@/@types';
import { iFilter } from '@/@types/Filter';
import { iProduto, iTabelaVenda } from '@/@types/Produto';
import { iDataResultTable } from '@/@types/Table';
import { CustomFetch } from '@/services/api';
import { getCookie } from '.';
import axios from 'axios';

interface iReqSuperBusca {
  Palavras: string;
  PularRegistros?: number;
  QuantidadeRegistros?: number;
}

const SQL_MWM =
  "select TRIM(T.TABELA) AS TABELA, CAST((E.fab_bruto - ((E.fab_bruto*T.PERCENTUAL)/100)) AS NUMERIC(10,2)) AS NOVO_PRECO, T.bloqueada AS BLOQUEADO from tabela_mwm T, EST E WHERE E.PRODUTO=:PRODUTO AND TRIM(T.TABELA) <> '%%'";
const SQL_NORMAL =
  'select T.TABELA, CAST((E.PRECO + ((E.PRECO*T.PERCENTUAL)/100)) AS NUMERIC(10,2)) AS PRECO, T.BLOQUEADO from TAB T, EST E ' +
  'WHERE E.PRODUTO = :PRODUTO AND (((SELECT COUNT(*) FROM fab_tab F WHERE F.fabricante = E.fabricante)=0) OR ( T.TABELA IN (SELECT' +
  ' F.TABELA FROM FAB_TAB F WHERE E.fabricante = F.fabricante AND F.tabela = T.tabela)))';
const SQL_2D =
  "SELECT 'TAB01' AS TABELA, fab_liquido1 AS NOVO_PRECO  FROM EST E  WHERE E.PRODUTO = :PRODUTO AND E.fab_liquido1 > 0 UNION  SELECT 'TAB02' AS TABELA, fab_liquido2 AS NOVO_PRECO FROM EST E  WHERE E.PRODUTO = :PRODUTO AND E.fab_st > 0";
const ROUTE_SUPER_BUSCA = '/ServiceProdutos/SuperBusca';
const ROUTE_SELECT_SQL = '/ServiceSistema/SelectSQL';
const ROUTE_ESTOQUE_LOJAS = '/EstoqueFiliais';

const ROUTE_GET_ALL_PRODUTO = '/Produto';

export async function SuperFindProducts(
  filter: iFilter<iProduto>
): Promise<ResponseType<iDataResultTable<iProduto>>> {
  const tokenCookie = await getCookie('token');
  const bodyReq: iReqSuperBusca = {
    Palavras: filter?.filter ? String(filter.filter[0].value) : '',
    PularRegistros: filter?.skip ? filter.skip : 0,
    QuantidadeRegistros: filter?.top ? filter.top : 15,
  };

  const res = await CustomFetch<iApiResult<iProduto[]>>(
    `${ROUTE_SUPER_BUSCA}?$expand=FABRICANTE,FORNECEDOR,GRUPO,ListaChaves`,
    {
      method: 'POST',
      body: JSON.stringify(bodyReq),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    }
  );

  if (res.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(res.status),
        message: String(res.statusText),
      },
    };
  }
  return {
    value: {
      value: res.body.Data,
      Qtd_Registros: res.body.RecordCount,
    },
    error: undefined,
  };
}

export async function TableFromProduct(
  product: iProduto
): Promise<ResponseType<iTabelaVenda[]>> {
  const tokenCookie = await getCookie('token');
  let tabelas: iTabelaVenda[] = [];

  let sql: string = SQL_NORMAL;

  if (product.FAB_BRUTO > 0 && product.FABRICANTE?.NOME === 'MWM')
    sql = SQL_MWM;
  if (product.FAB_BRUTO > 0 && product.FABRICANTE?.NOME !== 'MWM') sql = SQL_2D;

  const body: string = JSON.stringify({
    pSQL: sql,
    pPar: [
      {
        ParamName: 'PRODUTO',
        ParamType: 'ftString',
        ParamValues: [product.PRODUTO],
      },
    ],
  });

  const res = await CustomFetch<any>(`${ROUTE_SELECT_SQL}`, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });

  if (res.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(res.status),
        message: String(res.statusText),
      },
    };
  }

  const newTables: iTabelaVenda[] = [];

  res.body.Data.map((tb: iTabelaVenda) => {
    if ('NOVO_PRECO' in tb) {
      newTables.push({
        BLOQUEADO: tb.BLOQUEADO,
        PRECO: Number(tb.NOVO_PRECO),
        TABELA: tb.TABELA,
      });
    } else {
      newTables.push(tb);
    }
  });

  tabelas = [...tabelas, ...newTables];

  return {
    value: newTables,
    error: undefined,
  };
}

// export async function SetProduct(CodeProduct: string) {
//   try {
//     const product: iProduto = (
//       await api.get<iProduto>(
//         `${ROUTE_GET_ALL_PRODUTO}(${CodeProduct})?$expand=FABRICANTE,FORNECEDOR,GRUPO,ListaChaves,ListaOfertaProduto,ListaSimilares,ListaVendaCasada,NCM,TIPO_ITEM,UNIDADE`
//       )
//     ).data;

//     let tabelas: iTabelaVenda[] = [];

//     let sql: string = SQL_NORMAL;

//     if (product.FAB_BRUTO > 0 && product.FABRICANTE?.NOME === 'MWM')
//       sql = SQL_MWM;
//     if (product.FAB_BRUTO > 0 && product.FABRICANTE?.NOME !== 'MWM')
//       sql = SQL_2D;

//     const tablesResult: iApiResult<any[]> = (
//       await api.post<iApiResult<any[]>>(`${ROUTE_SELECT_SQL}`, {
//         pSQL: sql,
//         pPar: [
//           {
//             ParamName: 'PRODUTO',
//             ParamType: 'ftString',
//             ParamValues: [product.PRODUTO],
//           },
//         ],
//       })
//     ).data;

//     const estoqueResult: iApiData<iEstoqueLoja> = (
//       await api.get<iApiData<iEstoqueLoja>>(
//         `${ROUTE_ESTOQUE_LOJAS}?$filter=PRODUTO eq '${product.PRODUTO}'`
//       )
//     ).data;

//     const { Data, StatusCode, StatusMessage } = tablesResult;

//     if (StatusCode !== 200) {
//       return thunkAPI.rejectWithValue(`error: ${StatusMessage}`);
//     }
//     const newTables: iTabelaVenda[] = [];

//     Data.map((tb) => {
//       if ('NOVO_PRECO' in tb) {
//         newTables.push({
//           BLOQUEADO: tb.BLOQUEADO,
//           PRECO: tb.NOVO_PRECO,
//           TABELA: tb.TABELA,
//         });
//       } else {
//         newTables.push(tb);
//       }
//     });
//     tabelas = [...tabelas, ...newTables];

//     const result: iProdutoWithTables = {
//       produto: product,
//       tables: tabelas,
//       estoque_lojas: estoqueResult.value,
//     };

//     return result;
//   } catch (error: unknown) {
//     if (typeof error === 'string')
//       return thunkAPI.rejectWithValue(`error: ${error}`);
//     if (error instanceof Error)
//       return thunkAPI.rejectWithValue(`error: ${error.message}`);
//   }
// }

