// src/store/mockData.ts
import {create} from 'zustand';
import {Quest, QuestRecord, ReactionType} from '../types/quest.types';
import {Team, TeamPost, TeamComment, TeamReaction} from '../types/team.types';
import {User} from '../types/user.types';

export const initialUser: User[] = [
  {
    id: 'user1',
    name: 'User 1',
    email: 'user1@example.com',
    nickname: 'User 1',
    userType: 'student',
    level: 1,
    exp: 0,
    maxExp: 100,
    actionPoints: 0,
    avatar: require('../assets/character/pico_complete.png'),
  },
  {
    id: 'user2',
    name: 'User 2',
    email: 'user2@example.com',
    nickname: 'User 2',
    userType: 'student',
    level: 1,
    exp: 0,
    maxExp: 100,
    actionPoints: 0,
    avatar: require('../assets/character/pico_rest.png'),
  },
  {
    id: 'user3',
    name: 'User 3',
    email: 'user3@example.com',
    nickname: 'User 3',
    userType: 'student',
    level: 1,
    exp: 0,
    maxExp: 100,
    actionPoints: 0,
    avatar: require('../assets/character/pico_start.png'),
  },
  {
    id: 'user4',
    name: 'User 4',
    email: 'user4@example.com',
    nickname: 'User 4',
    userType: 'student',
    level: 1,
    exp: 0,
    maxExp: 100,
    actionPoints: 0,
    avatar: require('../assets/character/pico_question.png'),
  },
];
// 초기 mock 데이터
const initialQuests: Quest[] = [
  {
    id: '1',
    title: '매일 30분 독서하기',
    description: '하루에 최소 30분 이상 책 읽기',
    isMain: true,
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-12-31'),
    verificationRequired: true,
    verificationCount: 5,
    requiredVerifications: 30,
    records: [],
    procedure: 'progress',
    reactions: [],
  },
  {
    id: '2',
    title: '일주일 3회 운동하기',
    description: '주 3회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerifications: 12,
    records: [],
    procedure: 'progress',
  },
  {
    id: '3',
    title: '일주일 5회 운동하기',
    description: '주 5회 이상 헬스장 가기',
    isMain: false,
    startDate: new Date('2025-06-28'),
    endDate: new Date('2025-07-28'),
    verificationRequired: true,
    verificationCount: 1,
    requiredVerifications: 12,
    records: [
      {
        id: '1',
        questId: '3',
        date: '2025-06-28',
        text: 'dkfjdakfjad',
        createdAt: new Date('2025-06-28'),
        userId: 'user1',
        images: ['https://via.placeholder.com/150'],
      },
    ],
    procedure: 'verify',
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
  addVerification: (questId: string) => void;
  getQuestById: (id: string) => Quest | undefined;
  getMainQuest: () => Quest | undefined;
  getSubQuests: () => Quest[];
  getVerificationFeed: () => Quest[];
}

// 랜덤 아이디 값
const randomId = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Zustand 스토어 생성
export const useQuestStore = create<QuestStore>((set, get) => ({
  quests: initialQuests,

  // 퀘스트 추가
  addQuest: quest =>
    set(state => ({
      quests: [...state.quests, {...quest, id: randomId(), records: []}],
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
    questId: string,
    record: Omit<QuestRecord, 'id' | 'createdAt'>,
  ) => {
    const newRecord: QuestRecord = {
      ...record,
      id: randomId(), // or your preferred ID generation method
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

// Mock data for teams
export const mockTeams: Team[] = [
  {
    id: 'team1',
    name: '피트니스 마스터',
    description:
      '함께 운동 목표를 달성하는 팀입니다. 주 3회 이상 운동 인증을 목표로 합니다!',
    members: ['user1', 'user2', 'user3'],
    leaderId: 'user1',
    isPublic: true,
    quest: {
      // Required TeamQuest properties
      title: '피트니스 마스터 도전',
      procedure: 'progress',
      startDate: '2025-07-01',
      endDate: '2025-12-31',
    },
    feed: [
      {
        id: 'post1',
        userId: 'user1',
        content: '오늘도 열심히 운동했어요! 다들 화이팅입니다 💪',
        reactions: [
          {
            userId: 'user2',
            reactionType: 'amazing',
            createdAt: new Date('2025-07-09T10:20:00Z'),
          },
          {
            userId: 'user3',
            reactionType: 'support',
            createdAt: new Date('2025-07-09T10:21:00Z'),
          },
        ],
        comments: [
          {
            id: 'comment1',
            userId: 'user2',
            content: '대단하세요!',
            reactions: [],
            createdAt: '2025-07-09T10:30:00Z',
          },
        ],
        createdAt: '2025-07-09T10:15:00Z',
      },
    ],
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'team2',
    name: '독서 모임',
    description: '매주 한 권씩 책을 읽고 서로 의견을 나누는 모임입니다.',
    members: ['user4', 'user5', 'user6'],
    leaderId: 'user4',
    isPublic: true,
    quest: {
      // Required TeamQuest properties
      title: '독서 모임 도전',
      procedure: 'progress',
      startDate: '2025-07-01',
      endDate: '2025-12-31',
    },
    feed: [],
    createdAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'team3',
    name: '코딩 스터디',
    description: '주 3일 알고리즘 문제 풀이 및 코드 리뷰를 진행합니다.',
    members: ['user7', 'user8'],
    leaderId: 'user7',
    isPublic: false,
    quest: {
      // Required TeamQuest properties
      title: '코딩 스터디 도전',
      procedure: 'progress',
      startDate: '2025-07-01',
      endDate: '2025-12-31',
    },
    feed: [],
    createdAt: '2025-07-01T00:00:00Z',
  },
];

// Team Store Type
interface TeamStore {
  teams: Team[];
  createTeam: (
    team: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'feed' | 'members'>,
  ) => Team;
  getTeamById: (id: string) => Team | undefined;
  addTeamMember: (teamId: string, userId: string) => void;
  removeTeamMember: (teamId: string, userId: string) => void;
  createTeamPost: (
    teamId: string,
    post: Omit<
      TeamPost,
      'id' | 'createdAt' | 'updatedAt' | 'reactions' | 'comments'
    >,
  ) => TeamPost;
  updateTeamPost: (
    teamId: string,
    postId: string,
    updates: Partial<Omit<TeamPost, 'id' | 'userId' | 'createdAt'>>,
  ) => void;
  deleteTeamPost: (teamId: string, postId: string) => void;
  // addReaction: (
  //   teamId: string,
  //   postId: string,
  //   commentId: string | null,
  //   userId: string,
  //   reactionType: TeamReaction,
  // ) => void;
  // removeReaction: (
  //   teamId: string,
  //   postId: string,
  //   commentId: string | null,
  //   userId: string,
  // ) => void;
  addComment: (
    teamId: string,
    postId: string,
    comment: Omit<TeamComment, 'id' | 'createdAt' | 'updatedAt' | 'reactions'>,
  ) => TeamComment;
  updateComment: (
    teamId: string,
    postId: string,
    commentId: string,
    updates: Partial<Omit<TeamComment, 'id' | 'userId' | 'createdAt'>>,
  ) => void;
  deleteComment: (teamId: string, postId: string, commentId: string) => void;
}

// Zustand store for teams
export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: mockTeams,

  createTeam: team => {
    const newTeam: Team = {
      ...team,
      id: `team${Date.now()}`,
      members: [team.leaderId],
      feed: [],
      createdAt: new Date().toISOString(),
    };
    set(state => ({
      teams: [...state.teams, newTeam],
    }));
    return newTeam;
  },

  getTeamById: id => {
    return get().teams.find(team => team.id === id);
  },

  addTeamMember: (teamId, userId) => {
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

  removeTeamMember: (teamId, userId) => {
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

  createTeamPost: (teamId, post) => {
    const newPost: TeamPost = {
      ...post,
      id: `post${Date.now()}`,
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      teams: state.teams.map(team =>
        team.id === teamId
          ? {
              ...team,
              feed: [newPost, ...team.feed],
              updatedAt: new Date().toISOString(),
            }
          : team,
      ),
    }));

    return newPost;
  },

  updateTeamPost: (teamId, postId, updates) => {
    set(state => ({
      teams: state.teams.map(team => {
        if (team.id !== teamId) return team;

        return {
          ...team,
          feed: team.feed.map(post =>
            post.id === postId
              ? {
                  ...post,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : post,
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  deleteTeamPost: (teamId, postId) => {
    set(state => ({
      teams: state.teams.map(team =>
        team.id === teamId
          ? {
              ...team,
              feed: team.feed.filter(post => post.id !== postId),
              updatedAt: new Date().toISOString(),
            }
          : team,
      ),
    }));
  },

  // addReaction: (teamId, postId, commentId, userId, reactionType) => {
  //   set(state => ({
  //     teams: state.teams.map(team => {
  //       if (team.id !== teamId) return team;

  //       const newReaction = {
  //         userId,
  //         type: reactionType,
  //         createdAt: new Date().toISOString(),
  //       };

  //       return {
  //         ...team,
  //         feed: team.feed.map(post => {
  //           if (post.id !== postId) return post;

  //           // If it's a comment reaction
  //           if (commentId) {
  //             return {
  //               ...post,
  //               comments: post.comments.map(comment => {
  //                 if (comment.id !== commentId) return comment;

  //                 // Remove existing reaction from this user if exists
  //                 const filteredReactions = comment.reactions.filter(
  //                   r => r.userId !== userId,
  //                 );
  //                 return {
  //                   ...comment,
  //                   reactions: [...filteredReactions, newReaction],
  //                   updatedAt: new Date().toISOString(),
  //                 };
  //               }),
  //               updatedAt: new Date().toISOString(),
  //             };
  //           }

  //           // It's a post reaction
  //           // Remove existing reaction from this user if exists
  //           const filteredReactions = post.reactions.filter(
  //             r => r.userId !== userId,
  //           );
  //           return {
  //             ...post,
  //             reactions: [...filteredReactions, newReaction],
  //             updatedAt: new Date().toISOString(),
  //           };
  //         }),
  //         updatedAt: new Date().toISOString(),
  //       };
  //     }),
  //   }));
  // },

  // removeReaction: (teamId, postId, commentId, userId) => {
  //   set(state => ({
  //     teams: state.teams.map(team => {
  //       if (team.id !== teamId) return team;

  //       return {
  //         ...team,
  //         feed: team.feed.map(post => {
  //           if (post.id !== postId) return post;

  //           // If it's a comment reaction
  //           if (commentId) {
  //             return {
  //               ...post,
  //               comments: post.comments.map(comment => {
  //                 if (comment.id !== commentId) return comment;

  //                 return {
  //                   ...comment,
  //                   reactions: comment.reactions.filter(
  //                     r => r.userId !== userId,
  //                   ),
  //                   updatedAt: new Date().toISOString(),
  //                 };
  //               }),
  //               updatedAt: new Date().toISOString(),
  //             };
  //           }

  //           // It's a post reaction
  //           return {
  //             ...post,
  //             reactions: post.reactions.filter(r => r.userId !== userId),
  //             updatedAt: new Date().toISOString(),
  //           };
  //         }),
  //         updatedAt: new Date().toISOString(),
  //       };
  //     }),
  //   }));
  // },

  addComment: (teamId, postId, comment) => {
    const newComment: TeamComment = {
      ...comment,
      id: `comment${Date.now()}`,
      reactions: [],
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      teams: state.teams.map(team => {
        if (team.id !== teamId) return team;

        return {
          ...team,
          feed: team.feed.map(post => {
            if (post.id !== postId) return post;

            return {
              ...post,
              comments: [...post.comments, newComment],
              updatedAt: new Date().toISOString(),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    return newComment;
  },

  updateComment: (teamId, postId, commentId, updates) => {
    set(state => ({
      teams: state.teams.map(team => {
        if (team.id !== teamId) return team;

        return {
          ...team,
          feed: team.feed.map(post => {
            if (post.id !== postId) return post;

            return {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId
                  ? {
                      ...comment,
                      ...updates,
                      updatedAt: new Date().toISOString(),
                    }
                  : comment,
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  deleteComment: (teamId, postId, commentId) => {
    set(state => ({
      teams: state.teams.map(team => {
        if (team.id !== teamId) return team;

        return {
          ...team,
          feed: team.feed.map(post => {
            if (post.id !== postId) return post;

            return {
              ...post,
              comments: post.comments.filter(
                comment => comment.id !== commentId,
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },
}));
