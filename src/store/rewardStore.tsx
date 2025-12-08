import type {Avatar, Badge} from '@/types/user.types';
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RewardStore {
  charCount: number;
  badgeCount: number;
  lastSeenCharacterCount: number;
  lastSeenBadgeCount: number;
  hasNewCharacter: boolean;
  hasNewBadge: boolean;
  setCharCount(charCount: number): void;
  setBadgeCount(badgeCount: number): void;
  setServerCounts(charCount: number, badgeCount: number): void;
  markCharacterSeen(): void;
  markBadgeSeen(): void;
}

export const rewardStore = create<RewardStore>()(
  persist(
    (set, get) => ({
      charCount: 0,
      badgeCount: 0,
      lastSeenCharacterCount: 0,
      lastSeenBadgeCount: 0,
      hasNewCharacter: false,
      hasNewBadge: false,

      setCharCount: charCount =>
        set(state => ({
          charCount,
          hasNewCharacter: charCount > state.lastSeenCharacterCount,
        })),

      setBadgeCount: badgeCount =>
        set(state => ({
          badgeCount,
          hasNewBadge: badgeCount > state.lastSeenBadgeCount,
        })),

      setServerCounts: (charCount, badgeCount) => {
        set({charCount, badgeCount});
      },

      markCharacterSeen: () =>
        set(state => ({
          lastSeenCharacterCount: state.charCount,
          hasNewCharacter: false,
        })),

      markBadgeSeen: () =>
        set(state => ({
          lastSeenBadgeCount: state.badgeCount,
          hasNewBadge: false,
        })),
    }),
    {
      name: 'reward-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        lastSeenCharacterCount: state.lastSeenCharacterCount,
        lastSeenBadgeCount: state.lastSeenBadgeCount,
      }),
    },
  ),
);
