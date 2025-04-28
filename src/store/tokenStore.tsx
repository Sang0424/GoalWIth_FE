import { create } from 'zustand';
import instance from '../utils/axiosInterceptor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userStore } from './userStore';
import axios from 'axios';
import { API_URL } from '@env';

interface TokenState {
  accessToken: string | null;
  actions: {
    setAccessToken: (token: string | null) => void;
    // refreshAccessToken: () => Promise<void>;
    clearAccessToken: () => void;
  };
}

export const tokenStore = create<TokenState>(set => ({
  accessToken: null,
  actions: {
    setAccessToken: token => set({ accessToken: token }),
    clearAccessToken: () => set({ accessToken: null }),
  },
}));
