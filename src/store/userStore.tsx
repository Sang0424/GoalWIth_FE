import {create} from 'zustand';
import {decodeJwt} from '../utils/jwtUtils';
import {tokenStore} from './tokenStore';

interface UserStore {
  user: any;
  loadUser: () => Promise<void>;
  setUser: (user: any) => void;
}

export const userStore = create<UserStore>((set, get) => ({
  user: null,

  loadUser: () => {
    return get().user;
  },
  setUser: user => set(() => ({user})),
}));
