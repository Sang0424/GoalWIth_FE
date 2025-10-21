// src/store/mockData.ts
import {create} from 'zustand';
import {
  Quest,
  QuestRecord,
  QuestVerification,
  ReactionType,
} from '../types/quest.types';
import {Team, TeamPost, TeamComment, TeamReaction} from '../types/team.types';
import {User} from '../types/user.types';

export const initialUser: User[] = [
  {
    id: 1,
    name: 'User 1',
    email: 'user1@example.com',
    nickname: 'User 1',
    userType: 'student',
    level: 1,
    exp: 0,
    maxExp: 100,
    actionPoints: 0,
    character: '/assets/character/pico_complete.png',
  },
  {
    id: 2,
    name: 'User 2',
    email: 'user2@example.com',
    nickname: 'User 2',
    userType: 'student',
    level: 1,
    exp: 0,
    maxExp: 100,
    actionPoints: 0,
    character: '/assets/character/pico_rest.png',
  },
  {
    id: 3,
    name: 'User 3',
    email: 'user3@example.com',
    nickname: 'User 3',
    userType: 'student',
    level: 1,
    exp: 0,
    maxExp: 100,
    actionPoints: 0,
    character: '/assets/character/pico_start.png',
  },
  {
    id: 4,
    name: 'User 4',
    email: 'user4@example.com',
    nickname: 'User 4',
    userType: 'student',
    level: 1,
    exp: 0,
    maxExp: 100,
    actionPoints: 0,
    character: '/assets/character/pico_question.png',
  },
];
// 초기 mock 데이터
const initialQuests: Quest[] = [
  {
    id: 1,
    title: '매일 30분 독서하기',
    description: '하루에 최소 30분 이상 책 읽기',
    isMain: true,
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-12-31'),
    verificationRequired: true,
    verificationCount: 5,
    requiredVerification: 30,
    records: [],
    procedure: 'progress',
    reactions: [],
    user: initialUser[0],
  },
  {
    id: 2,
    title: '일주일 3회 운동하기',
    description: '주 3회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [],
    procedure: 'progress',
    reactions: [],
    user: initialUser[1],
  },
  {
    id: 3,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 4,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 5,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 6,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 7,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 8,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 9,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 10,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 11,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 12,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
  {
    id: 13,
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerification: 12,
    records: [
      {
        id: 1,
        questId: 3,
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        user: initialUser[0],
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
    reactions: [],
    user: initialUser[2],
  },
];

// Zustand 스토어 타입 정의
interface QuestStore {
  quests: Quest[];
  addQuest: (quest: Omit<Quest, 'id' | 'records'>) => void;
  updateQuest: (id: number, updates: Partial<Quest>) => void;
  deleteQuest: (id: number) => void;
  completeQuest: (id: number) => void;
  addQuestRecord: (questId: number, record: any) => void;
  addVerification: (questId: number) => void;
  getQuestById: (id: number) => Quest | undefined;
  getMainQuest: () => Quest | undefined;
  getSubQuests: () => Quest[];
  getVerificationFeed: () => Quest[];
}

// Zustand 스토어 생성
export const useQuestStore = create<QuestStore>((set, get) => ({
  quests: initialQuests,

  // 퀘스트 추가
  addQuest: quest =>
    set(state => ({
      quests: [
        ...state.quests,
        {...quest, id: state.quests.length + 1, records: []},
      ],
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
        quest.id === id
          ? quest.verificationRequired
            ? {...quest, procedure: 'verify'}
            : {...quest, procedure: 'complete'}
          : quest,
      ),
    })),

  addQuestRecord: (
    questId: number,
    record: Omit<QuestRecord, 'id' | 'createdAt'>,
  ) => {
    const newRecord: QuestRecord = {
      ...record,
      id: get().quests.length + 1,
      createdAt: new Date(),
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
  addVerification: questId =>
    set(state => ({
      quests: state.quests.map(quest =>
        quest.id === questId
          ? {
              ...quest,
              verificationCount:
                quest.verificationCount && quest.verificationCount + 1,
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
  getVerificationFeed: () => {
    return get().quests.filter(
      quest => quest.verificationRequired && quest.procedure === 'verify',
    );
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
    useQuest: (id: number) => ({
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

// Mock data for teams
export const mockTeams: Team[] = [
  {
    id: 1,
    name: '피트니스 마스터',
    description:
      '함께 운동 목표를 달성하는 팀입니다. 주 3회 이상 운동 인증을 목표로 합니다!',
    members: ['user1', 'user2', 'user3'],
    leaderId: 'user1',
    isPublic: true,
    teamQuest: {
      // Required TeamQuest properties
      title: '피트니스 마스터 도전',
      procedure: 'progress',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-12-31'),
      records: [
        {
          id: 1,
          user: initialUser[0],
          text: '오늘도 열심히 운동했어요! 다들 화이팅입니다 💪',
          reactions: [
            {
              id: 1,
              user: initialUser[1],
              reactionType: 'amazing',
              createdAt: new Date('2025-07-09T10:20:00Z'),
            },
            {
              id: 2,
              user: initialUser[2],
              reactionType: 'support',
              createdAt: new Date('2025-07-09T10:21:00Z'),
            },
          ],
          verifications: [
            {
              id: 1,
              user: initialUser[1],
              comment: '대단하세요!',
              createdAt: new Date('2025-07-09T10:30:00Z'),
            },
          ],
          createdAt: new Date('2025-07-09T10:15:00Z'),
        },
      ],
    },
  },
  {
    id: 2,
    name: '독서 모임',
    description: '매주 한 권씩 책을 읽고 서로 의견을 나누는 모임입니다.',
    members: ['user4', 'user5', 'user6'],
    leaderId: 'user4',
    isPublic: true,
    teamQuest: {
      // Required TeamQuest properties
      title: '독서 모임 도전',
      procedure: 'progress',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-12-31'),
      records: [],
    },
    createdAt: new Date('2025-06-15T00:00:00Z'),
  },
  {
    id: 3,
    name: '코딩 스터디',
    description: '주 3일 알고리즘 문제 풀이 및 코드 리뷰를 진행합니다.',
    members: ['user7', 'user8'],
    leaderId: 'user7',
    isPublic: false,
    teamQuest: {
      // Required TeamQuest properties
      title: '코딩 스터디 도전',
      procedure: 'progress',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-12-31'),
      records: [],
    },
    createdAt: new Date('2025-07-01T00:00:00Z'),
  },
];

// Team Store Type
interface TeamStore {
  teams: Team[];
  createTeam: (
    team: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'feed' | 'members'>,
  ) => Team;
  deleteTeam: (teamId: number) => void;
  updateTeam: (teamId: number, team: Partial<Team>) => void;
  getTeamById: (id: number) => Team | undefined;
  addTeamMember: (teamId: number, userId: string) => void;
  removeTeamMember: (teamId: number, userId: string) => void;
  createTeamPost: (
    teamId: number,
    post: Omit<
      TeamPost,
      'id' | 'createdAt' | 'updatedAt' | 'reactions' | 'comments'
    >,
  ) => TeamPost;
  updateTeamPost: (
    teamId: number,
    postId: number,
    updates: Partial<Omit<TeamPost, 'id' | 'userId' | 'createdAt'>>,
  ) => void;
  deleteTeamPost: (teamId: number, postId: number) => void;
  addReaction: (postId: number, user: User, reactionType: ReactionType) => void;
  removeReaction: (
    postId: number,
    user: User,
    reactionType: ReactionType,
  ) => void;
  addComment: (
    postId: number,
    comment: Omit<QuestVerification, 'id' | 'createdAt' | 'updatedAt' | 'user'>,
  ) => QuestVerification;
  updateComment: (
    commentId: number,
    updates: Partial<Omit<QuestVerification, 'id' | 'user' | 'createdAt'>>,
  ) => void;
  deleteComment: (commentId: number) => void;
}

// Zustand store for teams
export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: mockTeams,

  createTeam: team => {
    const newTeam: Team = {
      ...team,
      id: get().teams.length + 1,
      members: [team.leaderId],
      createdAt: new Date(),
    };
    set(state => ({
      teams: [...state.teams, newTeam],
    }));
    return newTeam;
  },

  deleteTeam: teamId => {
    set(state => ({
      teams: state.teams.filter(team => team.id !== teamId),
    }));
  },
  updateTeam: (teamId: number, updates: Partial<Team>) => {
    set(state => ({
      teams: state.teams.map(team =>
        team.id === teamId
          ? {...team, ...updates, updatedAt: new Date()}
          : team,
      ),
    }));
  },
  getTeamById: id => {
    return get().teams.find(team => team.id === id);
  },

  addTeamMember: (teamId: number, userId: string) => {
    set(state => ({
      teams: state.teams.map(team =>
        team.id === teamId && !team.members.includes(userId)
          ? {
              ...team,
              members: [...team.members, userId],
              updatedAt: new Date().toISOString(),
            }
          : team,
      ),
    }));
  },

  removeTeamMember: (teamId: number, userId: string) => {
    set(state => ({
      teams: state.teams.map(team =>
        team.id === teamId
          ? {
              ...team,
              members: team.members.filter(id => id !== userId),
              updatedAt: new Date().toISOString(),
            }
          : team,
      ),
    }));
  },

  createTeamPost: (
    teamId: number,
    post: Omit<
      TeamPost,
      'id' | 'createdAt' | 'updatedAt' | 'reactions' | 'comments'
    >,
  ) => {
    const newPost: TeamPost = {
      ...post,
      id: get().teams.length + 1,
      reactions: [],
      verifications: [],
      createdAt: new Date(),
    };

    set(state => ({
      teams: state.teams.map(team =>
        team.id === teamId
          ? {
              ...team,
              teamQuest: {
                ...team.teamQuest,
                records: [newPost, ...team.teamQuest.records],
              },
              updatedAt: new Date().toISOString(),
            }
          : team,
      ),
    }));

    return newPost;
  },

  updateTeamPost: (
    teamId: number,
    postId: number,
    updates: Partial<Omit<TeamPost, 'id' | 'userId' | 'createdAt'>>,
  ) => {
    set(state => ({
      teams: state.teams.map(team => {
        if (team.id !== teamId) return team;

        return {
          ...team,
          teamQuest: {
            ...team.teamQuest,
            records: team.teamQuest.records.map(post =>
              post.id === postId
                ? {
                    ...post,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                  }
                : post,
            ),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  deleteTeamPost: (teamId: number, postId: number) => {
    set(state => ({
      teams: state.teams.map(team =>
        team.id === teamId
          ? {
              ...team,
              teamQuest: {
                ...team.teamQuest,
                records: team.teamQuest.records.filter(
                  post => post.id !== postId,
                ),
              },
              updatedAt: new Date().toISOString(),
            }
          : team,
      ),
    }));
  },

  addReaction: (postId: number, user: User, reactionType: ReactionType) => {
    set(state => ({
      teams: state.teams.map(team => ({
        ...team,
        teamQuest: {
          ...team.teamQuest,
          records: team.teamQuest.records.map(post => {
            if (post.id !== postId) return post;

            // Remove user's existing reaction if exists
            const filteredReactions = post.reactions.filter(
              r => r.user.id !== user.id,
            );

            return {
              ...post,
              reactions: [
                ...filteredReactions,
                {
                  id: get().teams.length + 1,
                  user,
                  reactionType,
                  createdAt: new Date(),
                },
              ],
              updatedAt: new Date(),
            };
          }),
        },
      })),
    }));
  },

  removeReaction: (postId: number, user: User) => {
    set(state => ({
      teams: state.teams.map(team => ({
        ...team,
        teamQuest: {
          ...team.teamQuest,
          records: team.teamQuest.records.map(post => {
            if (post.id !== postId) return post;

            // Remove user's reaction
            const filteredReactions = post.reactions.filter(
              r => r.user.id !== user.id,
            );

            return {
              ...post,
              reactions: filteredReactions,
              updatedAt: new Date(),
            };
          }),
        },
      })),
    }));
  },
  addComment: (
    postId: number,
    comment: Omit<QuestVerification, 'id' | 'createdAt' | 'updatedAt' | 'user'>,
  ) => {
    const newComment: QuestVerification = {
      ...comment,
      id: get().teams.length + 1,
      createdAt: new Date(),
      user: initialUser[1],
    };

    set(state => ({
      teams: state.teams.map(team => ({
        ...team,
        teamQuest: {
          ...team.teamQuest,
          records: team.teamQuest.records.map(post => {
            if (post.id !== postId) return post;

            return {
              ...post,
              verifications: [...(post.verifications || []), newComment],
              updatedAt: new Date(),
            };
          }),
        },
      })),
    }));

    return newComment;
  },

  updateComment: (
    commentId: number,
    updates: Partial<Omit<QuestVerification, 'id' | 'createdAt' | 'user'>>,
  ) => {
    set(state => ({
      teams: state.teams.map(team => {
        return {
          ...team,
          teamQuest: {
            ...team.teamQuest,
            records: team.teamQuest.records.map(post => {
              return {
                ...post,
                verifications: post.verifications.map(comment =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        ...updates,
                        updatedAt: new Date(),
                      }
                    : comment,
                ),
              };
            }),
          },
        };
      }),
    }));
  },

  deleteComment: (commentId: number) => {
    set(state => ({
      teams: state.teams.map(team => {
        return {
          ...team,
          teamQuest: {
            ...team.teamQuest,
            records: team.teamQuest.records.map(post => {
              return {
                ...post,
                verifications: post.verifications.filter(
                  comment => comment.id !== commentId,
                ),
              };
            }),
          },
        };
      }),
    }));
  },
}));
