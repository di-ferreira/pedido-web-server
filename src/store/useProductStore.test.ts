import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/actions/produto', () => ({
  GetNewPriceFromTable: vi.fn(),
  GetProductPromotion: vi.fn(),
  GetProducts: vi.fn(),
  GetSaleHistory: vi.fn(),
  GetSimilares: vi.fn(),
}));

vi.mock('@/components/ToastNotify', () => ({
  default: vi.fn(),
}));

import {
  GetNewPriceFromTable,
  GetProductPromotion,
  GetSaleHistory,
  GetSimilares,
} from '@/app/actions/produto';
import ToastNotify from '@/components/ToastNotify';
import useProductStore from '@/store/useProductStore';

const mockedPromotion = GetProductPromotion as unknown as ReturnType<
  typeof vi.fn
>;
const mockedPrice = GetNewPriceFromTable as unknown as ReturnType<
  typeof vi.fn
>;
const mockedHistory = GetSaleHistory as unknown as ReturnType<typeof vi.fn>;
const mockedSimilares = GetSimilares as unknown as ReturnType<typeof vi.fn>;
const mockedToast = ToastNotify as unknown as ReturnType<typeof vi.fn>;

const prod = { PRODUTO: 'YN12/1034', PRECO: 10 } as any;
const cliente = { CLIENTE: 'C1', Tabela: 'T1' } as any;

describe('useProductStore.selectProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProductStore.setState({
      isLoading: false,
      productSelected: null,
      currentPrice: null,
      cacheDetails: {},
    });
  });

  it('reseta isLoading quando as ações de detalhe rejeitam (não trava a UI)', async () => {
    mockedPromotion.mockRejectedValue(new Error('boom'));
    mockedPrice.mockResolvedValue({ value: 10 });

    await useProductStore.getState().selectProduct(prod, cliente);

    expect(useProductStore.getState().isLoading).toBe(false);
    expect(useProductStore.getState().productSelected).toBe(prod);
    expect(mockedToast).toHaveBeenCalled();
  });

  it('carrega produto e reseta isLoading no caminho feliz', async () => {
    mockedPromotion.mockResolvedValue({ value: undefined });
    mockedPrice.mockResolvedValue({ value: 12 });
    mockedHistory.mockResolvedValue({ value: [] });
    mockedSimilares.mockResolvedValue({ value: [] });

    await useProductStore.getState().selectProduct(prod, cliente);

    expect(useProductStore.getState().isLoading).toBe(false);
    expect(useProductStore.getState().currentPrice).toBe(12);
    expect(mockedToast).not.toHaveBeenCalled();
  });

  it('não quebra quando um similar tem EXTERNO null (defesa no filter)', async () => {
    mockedPromotion.mockResolvedValue({ value: undefined });
    mockedPrice.mockResolvedValue({ value: 12 });
    mockedHistory.mockResolvedValue({ value: [] });
    mockedSimilares.mockResolvedValue({
      value: [
        { EXTERNO: null },
        { EXTERNO: { ATIVO: 'S', VENDA: 'S', TRANCAR: 'N', PRODUTO: 'X' } },
      ],
    });

    await useProductStore.getState().selectProduct(prod, cliente);

    expect(useProductStore.getState().isLoading).toBe(false);
    expect(useProductStore.getState().currentPrice).toBe(12);
    expect(useProductStore.getState().similares).toHaveLength(1);
    expect(mockedToast).not.toHaveBeenCalled();
  });
});

describe('useProductStore.selectProduct — lógica de preço', () => {
  const prodTabela = { PRODUTO: 'EU50012K', PRECO: 400 } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    useProductStore.setState({
      isLoading: false,
      productSelected: null,
      currentPrice: null,
      cacheDetails: {},
    });
    mockedHistory.mockResolvedValue({ value: [] });
    mockedSimilares.mockResolvedValue({ value: [] });
  });

  it('usa o preço da tabela quando ela existe (nome "10" é só comparação)', async () => {
    mockedPromotion.mockResolvedValue({ value: undefined });
    mockedPrice.mockResolvedValue({ value: 372.6 });

    await useProductStore.getState().selectProduct(
      prodTabela,
      { ...cliente, Tabela: '10' },
    );

    expect(mockedPrice).toHaveBeenCalledWith(prodTabela, '10');
    expect(useProductStore.getState().currentPrice).toBe(372.6);
  });

  it('usa o preço da tabela mesmo se o nome dela for numérico com sinal', async () => {
    mockedPromotion.mockResolvedValue({ value: undefined });
    mockedPrice.mockResolvedValue({ value: 349.2 });

    await useProductStore.getState().selectProduct(
      prodTabela,
      { ...cliente, Tabela: '-12,70' },
    );

    expect(useProductStore.getState().currentPrice).toBe(349.2);
  });

  it('retorna a promoção quando ela é menor que o preço da tabela', async () => {
    mockedPromotion.mockResolvedValue({ value: { OFERTA: 300 } });
    mockedPrice.mockResolvedValue({ value: 400 });

    await useProductStore.getState().selectProduct(
      prodTabela,
      { ...cliente, Tabela: 'VAREJO' },
    );

    expect(useProductStore.getState().currentPrice).toBe(300);
    expect(useProductStore.getState().isOferta).toBe(true);
  });

  it('retorna o preço da tabela quando ela é menor que a promoção', async () => {
    mockedPromotion.mockResolvedValue({ value: { OFERTA: 500 } });
    mockedPrice.mockResolvedValue({ value: 400 });

    await useProductStore.getState().selectProduct(
      prodTabela,
      { ...cliente, Tabela: 'VAREJO' },
    );

    expect(useProductStore.getState().currentPrice).toBe(400);
  });

  it('retorna a promoção quando não há tabela', async () => {
    mockedPromotion.mockResolvedValue({ value: { OFERTA: 300 } });
    mockedPrice.mockResolvedValue({ value: undefined });

    await useProductStore.getState().selectProduct(
      prodTabela,
      { ...cliente, Tabela: '10' },
    );

    expect(useProductStore.getState().currentPrice).toBe(300);
  });

  it('retorna o preço bruto quando não há promoção nem tabela', async () => {
    mockedPromotion.mockResolvedValue({ value: undefined });
    mockedPrice.mockResolvedValue({ value: undefined });

    await useProductStore.getState().selectProduct(
      prodTabela,
      { ...cliente, Tabela: '10' },
    );

    expect(useProductStore.getState().currentPrice).toBe(400);
  });
});
