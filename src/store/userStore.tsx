import {create} from 'zustand';
import {decodeJwt} from '../utils/jwtUtils';
import {tokenStore} from './tokenStore';

interface UserStore {
  user: {
    id: number;
    nickname: string;
    eamil: string;
    level: number;
    actionPoints: number;
    exp: number;
    userType: string;
    character: string; // url,
    badge: string; //url
  };
  loadUser: () => UserStore['user'];
  setUser: (user: UserStore['user']) => void;
}

export const userStore = create<UserStore>((set, get) => ({
  user: {
    id: 0,
    nickname: '',
    eamil: '',
    level: 0,
    actionPoints: 0,
    exp: 0,
    userType: '',
    character: '',
    badge: '',
  },

  loadUser: () => get().user,
  setUser: user => set(() => ({user})),
}));
