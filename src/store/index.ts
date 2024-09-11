import { iVendedor } from '@/@types';
import { create } from 'zustand';

type UserStore = {
  current: iVendedor;
  setCurrent: (user: iVendedor) => void;
};

const useUser = create<UserStore>((set) => ({
  current: {} as iVendedor,
  setCurrent: (user: iVendedor) => {
    set((state) => ({
      current: user,
    }));
  },
}));

export default useUser;

