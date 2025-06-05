import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Record } from '../types';

// User type is now imported from shared types

interface Quest {
  id: string;
  title: string;
  isMain: boolean;
  startDate: string;
  endDate: string;
  completed: boolean;
  verificationRequired: boolean;
  verificationCount: number;
  requiredVerifications: number;
  records: QuestRecord[];
}

interface QuestVerification {
  userId: string;
  verifiedAt: string;
}

interface BaseQuestRecord {
  id: string;
  date: string;
  text: string;
  image?: string;
}

interface QuestRecord extends BaseQuestRecord {
  verifications: QuestVerification[];
  isVerified: boolean;
}

interface Team {
  id: string;
  name: string;
  leaderId: string;
  members: string[];
  feed: TeamPost[];
}

export interface TeamPost {
  id: string;
  userId: string;
  content: string;
  image?: string;
  likes: string[];
  comments: TeamComment[];
  createdAt: string;
}

export interface TeamComment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface AppContextType {
  user: User;
  quests: Quest[];
  teams: Team[];
  addQuest: (quest: Omit<Quest, 'id' | 'records'>) => void;
  addQuestRecord: (questId: string, record: Omit<QuestRecord, 'id' | 'verifications' | 'isVerified'>) => void;
  addRecord: (record: Record) => void;
  createTeam: (name: string) => void;
  addTeamPost: (teamId: string, post: Omit<TeamPost, 'id' | 'likes' | 'comments' | 'createdAt'>) => void;
  likeTeamPost: (teamId: string, postId: string, userId: string) => void;
  addCommentToPost: (teamId: string, postId: string, comment: Omit<TeamComment, 'id' | 'createdAt'>) => void;
  completeQuest: (questId: string) => void;
  updateActionPoints: (points: number) => void;
  verifyQuest: (questId: string, recordId: string, userId: string) => Promise<boolean>;
  getVerificationFeed: () => QuestRecord[];
  submitQuestForVerification: (questId: string, record: Omit<QuestRecord, 'id' | 'verifications' | 'isVerified'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: '사용자',
    level: 1,
    experience: 0,
    maxExperience: 100,
    actionPoints: 50,
    reputation: 0,
    character: '👤',
    stats: {
      strength: 1,
      intelligence: 1,
      agility: 1,
      vitality: 1
    },
    currentExp: 0,
    maxExp: 100
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

  const addQuestRecord = (questId: string, record: Omit<BaseQuestRecord, 'id'>) => {
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
                  isVerified: false 
                } as QuestRecord
              ] 
            } 
          : quest
      )
    );
  };

  const createTeam = (name: string) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      leaderId: user.id,
      members: [user.id],
      feed: [],
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
    setUser(prev => ({
      ...prev,
      actionPoints: Math.max(0, prev.actionPoints + points)
    }));
  };

  const verifyQuest = async (questId: string, recordId: string, userId: string): Promise<boolean> => {
    try {
      setQuests(prev => 
        prev.map(quest => {
          if (quest.id === questId) {
            const updatedRecords = quest.records.map(record => {
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
            const verificationCount = updatedRecords.reduce(
              (count, record) => count + record.verifications.length, 
              0
            );
            
            return {
              ...quest,
              records: updatedRecords,
              verificationCount,
              completed: verificationCount >= (quest.requiredVerifications || 5)
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
      if (quest.verificationRequired && quest.records.length > 0) {
        const latestRecord = quest.records[quest.records.length - 1];
        if (!latestRecord.isVerified) {
          verificationFeed.push({
            ...latestRecord,
            questTitle: quest.title,
            questId: quest.id
          } as QuestRecord);
        }
      }
    });
    
    return verificationFeed;
  };

  const addRecord = (record: Record) => {
    const questIndex = quests.findIndex(q => q.id === record.questId);
    if (questIndex === -1) return;

    const newQuest = {
      ...quests[questIndex],
      records: [...quests[questIndex].records, {
        id: record.id,
        date: record.createdAt.toString(),
        text: record.text,
        image: record.images[0], // Only show first image in quest record
        verifications: [],
        isVerified: false,
      }],
    };

    setQuests([...quests.slice(0, questIndex), newQuest, ...quests.slice(questIndex + 1)]);
  };

  const submitQuestForVerification = (
    questId: string, 
    record: Omit<QuestRecord, 'id' | 'verifications' | 'isVerified'>
  ) => {
    setQuests(prev => 
      prev.map(quest => {
        if (quest.id === questId) {
          const newRecord: QuestRecord = {
            ...record,
            id: Date.now().toString(),
            verifications: [],
            isVerified: false
          };
          
          return {
            ...quest,
            records: [...quest.records, newRecord]
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
        addRecord,
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
