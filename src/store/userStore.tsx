import {create} from 'zustand';
import {decodeJwt} from '../utils/jwtUtils';
import {tokenStore} from './tokenStore';

interface UserStore {
  user: any;
  loadUser: () => Promise<void>;
}

export const userStore = create<UserStore>(set => ({
  user: null,

  loadUser: async () => {
    const token = tokenStore.getState().accessToken;
    if (token) {
      const decodedUser = decodeJwt(token);
      set(() => ({user: decodedUser}));
    }
  },
}));
