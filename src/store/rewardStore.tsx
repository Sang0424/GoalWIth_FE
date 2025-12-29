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
  markCharacterSeen(): void;
  markBadgeSeen(): void;
  reset(): void;
}

const initialState = {
  charCount: 1,
  badgeCount: 1,
  lastSeenCharacterCount: 1,
  lastSeenBadgeCount: 1,
  hasNewCharacter: false,
  hasNewBadge: false,
};

export const rewardStore = create<RewardStore>()(
  persist(
    set => ({
      ...initialState,
      setCharCount: charCount =>
        set(state => {
          const effectiveLastSeen =
            charCount < state.lastSeenCharacterCount
              ? charCount
              : state.lastSeenCharacterCount;
          return {
            charCount,
            lastSeenCharacterCount: effectiveLastSeen,
            hasNewCharacter: charCount > effectiveLastSeen,
          };
        }),

      setBadgeCount: badgeCount =>
        set(state => {
          const effectiveLastSeen =
            badgeCount < state.lastSeenBadgeCount
              ? badgeCount
              : state.lastSeenBadgeCount;
          return {
            badgeCount,
            lastSeenBadgeCount: effectiveLastSeen,
            hasNewBadge: badgeCount > effectiveLastSeen,
          };
        }),

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
      reset: () => set(initialState),
    }),
    {
      name: 'reward-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        charCount: state.charCount,
        badgeCount: state.badgeCount,
        lastSeenCharacterCount: state.lastSeenCharacterCount,
        lastSeenBadgeCount: state.lastSeenBadgeCount,
      }),
    },
  ),
);
