'use server';
import { iApiResult, ResponseType } from '@/@types';
import {
  iItemInserir,
  iItemRemove,
  iOrcamento,
  iOrcamentoInserir,
} from '@/@types/Orcamento';
import { CustomFetch } from '@/services/api';
import { getBloqueios } from '@/lib/bloqueios';
import { decidirLiberacao } from '@/lib/liberacao';
import { GetCliente, GetFinanceiroCliente } from '@/app/actions/cliente';
import {
  MarcarLiberacaoComoUsada,
  SolicitarLiberacao,
  ValidarLiberacao,
} from '@/app/actions/liberacoes';
import { getCookie, requireAuth } from '..';
import {
  ROUTE_REMOVE_ITEM_ORCAMENTO,
  ROUTE_SAVE_ORCAMENTO,
} from './constants';
import { GetOrcamento } from './query';

export async function NewOrcamento(
  orcamento: iOrcamento,
): Promise<ResponseType<iOrcamento>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;
  const VendedorLocal: string = await getCookie('user');

  const clienteId: number =
    typeof orcamento.CLIENTE === 'number'
      ? orcamento.CLIENTE
      : orcamento.CLIENTE.CLIENTE;

  let bloqueado: string;
  if (typeof orcamento.CLIENTE === 'object') {
    bloqueado = orcamento.CLIENTE.BLOQUEADO;
  } else {
    const clienteResult = await GetCliente(clienteId);
    if (clienteResult.error) return { error: clienteResult.error };
    bloqueado = clienteResult.value?.BLOQUEADO ?? 'N';
  }

  const financeiroResult = await GetFinanceiroCliente(clienteId);
  if (financeiroResult.error) return { error: financeiroResult.error };
  const financeiro = financeiroResult.value!;

  const bloqueios = getBloqueios({
    contasAtrazadas: financeiro.ContasAtrazadas,
    usaLimite: financeiro.UsaLimite,
    saldoCompra: financeiro.SaldoCompra,
    bloqueado,
  });

  for (const codigo of bloqueios) {
    const liberacaoResult = await ValidarLiberacao(clienteId, codigo);
    if (liberacaoResult.error) return { error: liberacaoResult.error };

    const decisao = decidirLiberacao(liberacaoResult.value);

    if (decisao.action === 'solicitar') {
      await SolicitarLiberacao({
        ID: 0,
        NOME: 'CLIENTE',
        CODIGO: codigo,
        CHAVE: clienteId,
        DATA_HORA: '',
        QUEM: '',
        USADO: 'N',
        ONDE: 'PRÉ-VENDA',
        ID_ONDE: 9999,
        OBS: '',
        MOVIMENTO: 0,
      });
      return {
        value: undefined,
        error: {
          code: 'SOLICITADO',
          message: `Solicitação enviada para ${codigo}.`,
        },
      };
    }

    if (decisao.action === 'aguardar') {
      return {
        value: undefined,
        error: {
          code: 'AGUARDANDO_ERP',
          message: `Aguardando liberação do ERP (${codigo}).`,
        },
      };
    }

    if (decisao.action === 'consumir') {
      await MarcarLiberacaoComoUsada(liberacaoResult.value!);
    }
  }

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
    CodigoCliente:
      typeof orcamento.CLIENTE === 'number'
        ? orcamento.CLIENTE
        : orcamento.CLIENTE.CLIENTE,
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

export async function UpdateOrcamento(
  orcamento: iOrcamento,
): Promise<ResponseType<iOrcamento>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

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

async function removeItemOnly(
  itemOrcamento: iItemRemove,
  tokenCookie: string,
): Promise<ResponseType<void>> {
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

  if (data.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(data.status),
        message: String(data.statusText),
      },
    };
  }
  return { value: undefined, error: undefined };
}

export async function RemoverOrcamento(
  orcamento: iOrcamento,
): Promise<ResponseType<string>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

  const results = await Promise.all(
    orcamento.ItensOrcamento.map((item) =>
      removeItemOnly(
        {
          pIdOrcamento: orcamento.ORCAMENTO,
          pProduto: item.PRODUTO.PRODUTO,
        },
        tokenCookie,
      ),
    ),
  );

  const firstError = results.find((r) => r.error);
  if (firstError) {
    return {
      value: undefined,
      error: firstError.error,
    };
  }

  const responseRemove = await CustomFetch<unknown>(
    `/Orcamento(${orcamento.ORCAMENTO})`,
    {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        Authorization: `bearer ${tokenCookie}`,
      },
    },
  );

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
