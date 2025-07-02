// src/store/mockData.ts
import {create} from 'zustand';
import {Quest, QuestRecord} from '../types/quest.types';

// 초기 mock 데이터
const initialQuests: Quest[] = [
  {
    id: '1',
    title: '매일 30분 독서하기',
    description: '하루에 최소 30분 이상 책 읽기',
    isMain: true,
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-12-31'),
    completed: false,
    verificationRequired: true,
    verificationCount: 5,
    requiredVerifications: 30,
    records: [],
    category: 'self_improvement',
  },
  {
    id: '2',
    title: '일주일 3회 운동하기',
    description: '주 3회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    completed: false,
    verificationRequired: true,
    verificationCount: 1,
    requiredVerifications: 12,
    records: [],
    category: 'health',
  },
];

// Zustand 스토어 타입 정의
interface QuestStore {
  quests: Quest[];
  addQuest: (quest: Omit<Quest, 'id' | 'records'>) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  addQuestRecord: (questId: string, record: any) => void;
  addVerification: (questId: string, record: any) => void; // record 타입은 실제 구현에 맞게 수정
  getQuestById: (id: string) => Quest | undefined;
  getMainQuest: () => Quest | undefined;
  getSubQuests: () => Quest[];
}

// Zustand 스토어 생성
export const useQuestStore = create<QuestStore>((set, get) => ({
  quests: initialQuests,

  // 퀘스트 추가
  addQuest: quest =>
    set(state => ({
      quests: [...state.quests, {...quest, id: '3', records: []}],
    })),

  // 퀘스트 업데이트
  updateQuest: (id, updates) =>
    set(state => ({
      quests: state.quests.map(quest =>
        quest.id === id ? {...quest, ...updates} : quest,
      ),
    })),

  // 퀘스트 삭제
  deleteQuest: id =>
    set(state => ({
      quests: state.quests.filter(quest => quest.id !== id),
    })),

  // 퀘스트 완료
  completeQuest: id =>
    set(state => ({
      quests: state.quests.map(quest =>
        quest.id === id ? {...quest, completed: true} : quest,
      ),
    })),

  addQuestRecord: (
    questId: string,
    record: Omit<QuestRecord, 'id' | 'createdAt'>,
  ) => {
    const newRecord: QuestRecord = {
      ...record,
      id: '3', // or your preferred ID generation method
      createdAt: new Date().toISOString(),
    };

    // Update the quest's records array
    const questIndex = get().quests.findIndex(q => q.id === questId);
    if (questIndex !== -1) {
      set(state => ({
        quests: state.quests.map(quest =>
          quest.id === questId
            ? {...quest, records: [...(quest.records || []), newRecord]}
            : quest,
        ),
      }));
    }

    // If you're using React state or a state management solution,
    // make sure to update the state here
    // Example: setQuests([...quests]);

    return newRecord;
  },
  // 인증 추가
  addVerification: (questId, record) =>
    set(state => ({
      quests: state.quests.map(quest =>
        quest.id === questId
          ? {
              ...quest,
              verificationCount:
                quest.verificationCount && quest.verificationCount + 1,
              records: [...(quest.records || []), record],
            }
          : quest,
      ),
    })),

  // ID로 퀘스트 조회
  getQuestById: id => {
    const {quests} = get();
    return quests.find(quest => quest.id === id);
  },

  // 메인 퀘스트 조회
  getMainQuest: () => {
    const {quests} = get();
    return quests.find(quest => quest.isMain);
  },

  // 서브 퀘스트 조회
  getSubQuests: () => {
    const {quests} = get();
    return quests.filter(quest => !quest.isMain);
  },
}));

// React Query와 함께 사용할 때를 위한 훅
export const useQuestQueries = () => {
  const {
    quests,
    addQuest,
    updateQuest,
    deleteQuest,
    completeQuest,
    addVerification,
    getQuestById,
    getMainQuest,
    getSubQuests,
  } = useQuestStore();

  return {
    // 쿼리
    useQuests: () => ({data: quests, isLoading: false, error: null}),
    useQuest: (id: string) => ({
      data: getQuestById(id),
      isLoading: false,
      error: null,
    }),
    useMainQuest: () => ({
      data: getMainQuest(),
      isLoading: false,
      error: null,
    }),
    useSubQuests: () => ({
      data: getSubQuests(),
      isLoading: false,
      error: null,
    }),

    // 뮤테이션
    useAddQuest: () => ({
      mutate: addQuest,
      isLoading: false,
      error: null,
    }),
    useUpdateQuest: () => ({
      mutate: updateQuest,
      isLoading: false,
      error: null,
    }),
    useDeleteQuest: () => ({
      mutate: deleteQuest,
      isLoading: false,
      error: null,
    }),
    useCompleteQuest: () => ({
      mutate: completeQuest,
      isLoading: false,
      error: null,
    }),
    useAddVerification: () => ({
      mutate: addVerification,
      isLoading: false,
      error: null,
    }),
  };
};
