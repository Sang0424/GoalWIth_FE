import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserStore {
  user: {
    id: number;
    nickname: string;
    email: string;
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

interface BlcoekdUserStore {
  blockedUsers: number[]; // 차단한 유저 ID 목록 (숫자라 가정)
  blockUser: (userId: number) => void;
  unblockUser: (userId: number) => void;
}

export const userStore = create<UserStore>((set, get) => ({
  user: {
    id: -1,
    nickname: '',
    email: '',
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

export const useBlockStore = create(
  persist<BlcoekdUserStore>(
    set => ({
      blockedUsers: [],

      // 차단하기
      blockUser: userId =>
        set(state => ({
          // 중복 방지하며 추가
          blockedUsers: state.blockedUsers.includes(userId)
            ? state.blockedUsers
            : [...state.blockedUsers, userId],
        })),

      // 차단 해제 (설정 메뉴용)
      unblockUser: userId =>
        set(state => ({
          blockedUsers: state.blockedUsers.filter(id => id !== userId),
        })),
    }),
    {
      name: 'block-storage', // AsyncStorage에 저장될 키 이름
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
