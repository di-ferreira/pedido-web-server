import { iItensOrcamento, iOrcamento } from '@/@types/Orcamento';
import { NewOrcamento, UpdateOrcamento } from '@/app/actions/orcamento';
import { getErrorMessage } from '@/lib/utils';
import { create } from 'zustand';

type BudgetStore = {
  current: iOrcamento;
  isLoading: boolean;
  error: string | null;
  setCurrent: (budget: iOrcamento) => void;
  newBudget: (budget: iOrcamento) => Promise<void>;
  updateBudget: (budget: iOrcamento) => Promise<void>;
  addItem: (item: iItensOrcamento) => void;
  removeItem: (item: iItensOrcamento) => void;
  updateItem: (item: iItensOrcamento) => void;
};

const useBudget = create<BudgetStore>((set) => ({
  current: { ItensOrcamento: [] } as unknown as iOrcamento,
  isLoading: false,
  error: null,

  setCurrent: (budget) => set({ current: budget }),
  newBudget: async (budgetData: iOrcamento) => {
    set({ isLoading: true, error: null });
    try {
      const result = await NewOrcamento(budgetData);
      if (result.error) {
        throw new Error(result.error.message);
      }
      set({ current: result.value, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
      throw err;
    }
  },
  updateBudget: async (budgetData: iOrcamento) => {
    set({ isLoading: true, error: null });
    try {
      const result = await UpdateOrcamento(budgetData);
      if (result.error) {
        throw new Error(result.error.message);
      }
      set({ current: result.value, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
      throw err;
    }
  },
  addItem: (item: iItensOrcamento) => {
    set((state) => {
      const itens = [...state.current.ItensOrcamento, item];
      return {
        current: {
          ...state.current,
          ItensOrcamento: itens,
          TOTAL: itens.reduce((sum, i) => sum + i.TOTAL, 0),
        },
      };
    });
  },
  removeItem: (item: iItensOrcamento) => {
    set((state) => {
      const itens = state.current.ItensOrcamento.filter(
        (i) => i.PRODUTO.PRODUTO !== item.PRODUTO.PRODUTO,
      );
      return {
        current: {
          ...state.current,
          ItensOrcamento: itens,
          TOTAL: itens.reduce((sum, i) => sum + i.TOTAL, 0),
        },
      };
    });
  },
  updateItem: (item: iItensOrcamento) => {
    set((state) => {
      const itens = state.current.ItensOrcamento.map((i) =>
        i.PRODUTO.PRODUTO === item.PRODUTO.PRODUTO ? item : i,
      );
      return {
        current: {
          ...state.current,
          ItensOrcamento: itens,
          TOTAL: itens.reduce((sum, i) => sum + i.TOTAL, 0),
        },
      };
    });
  },
}));

export default useBudget;

