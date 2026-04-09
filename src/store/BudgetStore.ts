import { iOrcamento } from '@/@types/Orcamento';
import { create } from 'zustand';

type BudgetStore = {
  current: iOrcamento;
  setCurrent: (user: iOrcamento) => void;
};

const useBudget = create<BudgetStore>((set) => ({
  current: {} as iOrcamento,
  setCurrent: (user: iOrcamento) => {
    set((state) => ({
      current: user,
    }));
  },
}));

export default useBudget;

