'use server';
import { iApiResult, ResponseType } from '@/@types';
import { iItemInserir, iItemRemove, iOrcamento } from '@/@types/Orcamento';
import { CustomFetch } from '@/services/api';
import { requireAuth } from '..';
import {
  ROUTE_REMOVE_ITEM_ORCAMENTO,
  ROUTE_SAVE_ITEM_ORCAMENTO,
} from './constants';
import { GetOrcamento } from './query';

export async function removeItem(
  itemOrcamento: iItemRemove,
): Promise<ResponseType<iOrcamento>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

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

export async function addItem(
  itemOrcamento: iItemInserir,
): Promise<ResponseType<iOrcamento>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;
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

export async function updateItem(
  itemOrcamento: iItemInserir,
): Promise<ResponseType<iOrcamento>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;

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
