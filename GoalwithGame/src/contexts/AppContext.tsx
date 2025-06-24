import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types/user.types';
import { Quest, QuestRecord } from '../types/quest.types';
import { Team, TeamPost, TeamComment } from '../types/team.types';
// User type is now imported from shared types

interface AppContextType {
  user: User;
  quests: Quest[];
  teams: Team[];
  addQuest: (quest: Omit<Quest, 'id' | 'records'>) => void;
  addQuestRecord: (questId: string, record: QuestRecord) => void;
  createTeam: (name: string, description?: string, isPublic?: boolean) => void;
  addTeamPost: (teamId: string, post: Omit<TeamPost, 'id' | 'likes' | 'comments' | 'createdAt'>) => void;
  likeTeamPost: (teamId: string, postId: string, userId: string) => void;
  addCommentToPost: (teamId: string, postId: string, comment: Omit<TeamComment, 'id' | 'createdAt'>) => void;
  completeQuest: (questId: string) => void;
  updateActionPoints: (points: number) => void;
  verifyQuest: (questId: string, recordId: string, userId: string) => Promise<boolean>;
  getVerificationFeed: () => QuestRecord[];
  submitQuestForVerification: (questId: string, record: QuestRecord) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: '사용자',
    level: 1,
    exp: 0,
    maxExp: 100,
    actionPoints: 50,
    avatar: '',
    nickname: '사용자',
    userType: 'student',
    email: 'user@example.com',
  });

  const [quests, setQuests] = useState<Quest[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const addQuest = (quest: Omit<Quest, 'id' | 'records'>) => {
    const newQuest: Quest = {
      ...quest,
      id: Date.now().toString(),
      records: [],
    };
    
    setQuests(prev => {
      // If adding a main quest, mark other main quests as not main
      if (quest.isMain) {
        return [
          newQuest,
          ...prev.map(q => ({
            ...q,
            isMain: false
          }))
        ];
      }
      return [...prev, newQuest];
    });
  };

  const addQuestRecord = (questId: string, record: QuestRecord) => {
    setQuests(prev => 
      prev.map(quest => 
        quest.id === questId 
          ? { 
              ...quest, 
              records: [
                ...quest.records, 
                { 
                  ...record, 
                  id: Date.now().toString(),
                  verifications: [],
                  isVerified: false,
                  questId: questId,
                  tags: record.tags || [],
                  createdAt: new Date().toISOString(),
                  userId: user?.id || '',
                  date: record.date || new Date().toISOString()
                } as QuestRecord
              ] 
            } 
          : quest
      )
    );
  };

  const createTeam = (name: string, description?: string, isPublic?: boolean) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      description,
      isPublic: isPublic || false,
      leaderId: user.id,
      members: [user.id],
      feed: [],
      createdAt: new Date().toISOString(),
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const addTeamPost = (
    teamId: string,
    post: Omit<TeamPost, 'id' | 'likes' | 'comments' | 'createdAt'>
  ) => {
    setTeams(prev =>
      prev.map(team =>
        team.id === teamId
          ? {
              ...team,
              feed: [
                {
                  ...post,
                  id: Date.now().toString(),
                  likes: [],
                  comments: [],
                  createdAt: new Date().toISOString(),
                },
                ...team.feed,
              ],
            }
          : team
      )
    );
  };

  const likeTeamPost = (teamId: string, postId: string, userId: string) => {
    setTeams(prev =>
      prev.map(team =>
        team.id === teamId
          ? {
              ...team,
              feed: team.feed.map(post =>
                post.id === postId
                  ? {
                      ...post,
                      likes: post.likes.includes(userId)
                        ? post.likes.filter(id => id !== userId)
                        : [...post.likes, userId],
                    }
                  : post
              ),
            }
          : team
      )
    );
  };

  const addCommentToPost = (
    teamId: string,
    postId: string,
    comment: Omit<TeamComment, 'id' | 'createdAt'>
  ) => {
    setTeams(prev =>
      prev.map(team =>
        team.id === teamId
          ? {
              ...team,
              feed: team.feed.map(post =>
                post.id === postId
                  ? {
                      ...post,
                      comments: [
                        {
                          ...comment,
                          id: Date.now().toString(),
                          createdAt: new Date().toISOString(),
                        },
                        ...post.comments,
                      ],
                    }
                  : post
              ),
            }
          : team
      )
    );
  };

  const completeQuest = (questId: string) => {
    setQuests(prev =>
      prev.map(quest =>
        quest.id === questId ? { ...quest, completed: true } : quest
      )
    );
    // Add action points when completing a quest
    updateActionPoints(10);
  };

  const updateActionPoints = (points: number) => {
    setUser((prev:any) => ({
      ...prev,
      actionPoints: Math.max(0, prev.actionPoints + points)
    }));
  };

  const verifyQuest = async (questId: string, recordId: string, userId: string): Promise<boolean> => {
    try {
      setQuests(prev => 
        prev.map(quest => {
          if (quest.id === questId) {
            const updatedRecords = quest.records?.map(record => {
              if (record.id === recordId) {
                const alreadyVerified = record.verifications.some(v => v.userId === userId);
                if (alreadyVerified) return record;
                
                const newVerification = {
                  userId,
                  verifiedAt: new Date().toISOString()
                };
                
                const verifications = [...record.verifications, newVerification];
                const isVerified = verifications.length >= (quest.requiredVerifications || 5);
                
                return {
                  ...record,
                  verifications,
                  isVerified
                };
              }
              return record;
            });
            
            // Update verification count
            const verificationCount = updatedRecords?.reduce(
              (count, record) => count + record.verifications.length, 
              0
            );
            
            return {
              ...quest,
              records: updatedRecords,
              verificationCount,
              completed: verificationCount ? verificationCount >= (quest.requiredVerifications || 5) : false
            };
          }
          return quest;
        })
      );
      return true;
    } catch (error) {
      console.error('Error verifying quest:', error);
      return false;
    }
  };

  const getVerificationFeed = (): QuestRecord[] => {
    const verificationFeed: QuestRecord[] = [];
    
    quests.forEach(quest => {
      if (quest.verificationRequired && quest.records && quest.records.length > 0) {
        const latestRecord = quest.records[quest.records.length - 1];
        if (!latestRecord.isVerified) {
          const record: QuestRecord = {
            id: latestRecord.id,
            date: latestRecord.date,
            text: latestRecord.text || '',
            verifications: latestRecord.verifications || [],
            isVerified: false,
            questId: quest.id,
            tags: latestRecord.tags || [],
            createdAt: latestRecord.createdAt,
            userId: latestRecord.userId,
            images: latestRecord.images || [],
            ...(latestRecord.images?.[0] && { image: latestRecord.images[0] })
          };
          verificationFeed.push(record);
        }
      }
    });
    
    return verificationFeed;
  };

  const addRecord = (record: { id: string; questId: string; createdAt: string | Date; text: string; images?: string[] }) => {
    const questIndex = quests.findIndex(q => q.id === record.questId);
    if (questIndex === -1) return;

    const newQuest = {
      ...quests[questIndex],
      records: [
        ...(quests[questIndex].records || []), 
        {
          id: record.id,
          date: typeof record.createdAt === 'string' ? record.createdAt : record.createdAt.toISOString(),
          text: record.text,
          images: record.images || [],
          image: record.images?.[0], // Keep for backward compatibility
          verifications: [],
          isVerified: false,
          questId: record.questId,
          userId: user.id, // Assuming you have access to the current user
          tags: [], // Add empty tags array as per the interface
          createdAt: typeof record.createdAt === 'string' ? record.createdAt : record.createdAt.toISOString() // Add createdAt field
        }
      ],
    };

    setQuests(prevQuests => [
      ...prevQuests.slice(0, questIndex), 
      newQuest, 
      ...prevQuests.slice(questIndex + 1)
    ]);
  };

  const submitQuestForVerification = (
    questId: string, 
    record: QuestRecord
  ) => {
    if (!record.text) {
      console.warn('Cannot submit quest for verification: text is required');
      return;
    }
    if (!record.images) {
      console.warn('Cannot submit quest for verification: images is required');
      return;
    }
    setQuests(prev => 
      prev.map(quest => {
        if (quest.id === questId) {
          const newRecord: QuestRecord = {
            ...record,
            id: Date.now().toString(),
            verifications: [],
            isVerified: false,
            questId: questId,
            tags: record.tags || [],
            createdAt: new Date().toISOString(),
            userId: user?.id || '',
            date: record.date || new Date().toISOString()
          };
          
          return {
            ...quest,
            records: [...(quest.records), newRecord]
          };
        }
        return quest;
      })
    );
  };;

  return (
    <AppContext.Provider 
      value={{
        user,
        quests,
        teams,
        addQuest,
        addQuestRecord,
        createTeam,
        addTeamPost,
        likeTeamPost,
        addCommentToPost,
        completeQuest,
        updateActionPoints,
        verifyQuest,
        getVerificationFeed,
        submitQuestForVerification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
