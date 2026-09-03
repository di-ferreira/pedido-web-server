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
});
