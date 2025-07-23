export interface Quest {
  id: string;
  title: string;
  description?: string;
  isMain: boolean;
  startDate: string | Date;
  endDate: string | Date;
  procedure: 'progress' | 'complete' | 'failed' | 'verify';
  verificationRequired: boolean;
  verificationCount?: number;
  requiredVerifications?: number;
  records: QuestRecord[];
  verifications?: QuestVerification[];
  reactions?: Reaction[];
}

export interface QuestRecord {
  id: string;
  date?: string;
  text?: string;
  images?: string[];
  questId: string;
  createdAt: Date;
  userId: string;
}

export interface QuestVerification {
  userId: string;
  comment: string;
}

export interface RouteParams {
  questId: string;
  isMain?: boolean;
}

export type ReactionType = 'support' | 'amazing' | 'together' | 'perfect';

export interface Reaction {
  id: string;
  questId: string;
  userId: string;
  reactionType: ReactionType;
  createdAt: Date;
}
