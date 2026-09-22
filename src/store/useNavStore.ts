import { create } from 'zustand';

interface iNavStore {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const useNavStore = create<iNavStore>((set) => ({
  isOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  close: () => set({ isOpen: false }),
}));
