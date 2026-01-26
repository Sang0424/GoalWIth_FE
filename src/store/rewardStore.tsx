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
          console.log(
            `[Store] Char Update - Server: ${charCount}, LastSeen: ${state.lastSeenCharacterCount}`,
          );
          const effectiveLastSeen =
            charCount < state.lastSeenCharacterCount
              ? charCount
              : state.lastSeenCharacterCount;

          const isNew = charCount > effectiveLastSeen;

          if (isNew) {
            console.log('🔥 [Store] New Character Detected! Red Dot ON');
          }
          return {
            charCount,
            lastSeenCharacterCount: effectiveLastSeen,
            hasNewCharacter: isNew,
          };
        }),

      setBadgeCount: badgeCount =>
        set(state => {
          console.log(
            `[Store] Badge Update - Server: ${badgeCount}, LastSeen: ${state.lastSeenBadgeCount}`,
          );
          const effectiveLastSeen =
            badgeCount < state.lastSeenBadgeCount
              ? badgeCount
              : state.lastSeenBadgeCount;

          const isNew = badgeCount > effectiveLastSeen;
          if (isNew) {
            console.log('🔥 [Store] New Badge Detected! Red Dot ON');
          }
          return {
            badgeCount,
            lastSeenBadgeCount: effectiveLastSeen,
            hasNewBadge: isNew,
          };
        }),

      markCharacterSeen: () => {
        console.log('✅ [Store] Character Seen - Red Dot OFF');
        set(state => ({
          lastSeenCharacterCount: state.charCount,
          hasNewCharacter: false,
        }));
      },

      markBadgeSeen: () => {
        console.log('✅ [Store] Badge Seen - Red Dot OFF');
        set(state => ({
          lastSeenBadgeCount: state.badgeCount,
          hasNewBadge: false,
        }));
      },
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
        hasNewCharacter: state.hasNewCharacter,
        hasNewBadge: state.hasNewBadge,
      }),
    },
  ),
);
