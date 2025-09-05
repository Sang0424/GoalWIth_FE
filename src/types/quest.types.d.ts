export interface Quest {
  id: string;
  title: string;
  description?: string;
  isMain: boolean;
  startDate: Date;
  endDate: Date;
  procedure: 'progress' | 'complete' | 'failed' | 'verify';
  verificationRequired: boolean;
  verificationCount?: number;
  requiredVerification?: number;
  records: QuestRecord[];
  verifications?: QuestVerification[];
  reactions?: Reaction[];
  user?: User;
  team?: Team;
}

export interface QuestRecord {
  id: string;
  text?: string;
  images?: Asset[];
  questId: string;
  createdAt: Date;
  user: User;
}

export interface QuestVerification {
  id: string;
  user: User;
  comment: string;
  createdAt: Date;
}

export interface RouteParams {
  questId: string;
  isMain?: boolean;
}

export type ReactionType = 'support' | 'amazing' | 'together' | 'perfect';

export interface Reaction {
  id: string;
  questId: string;
  user: User;
  reactionType: ReactionType;
  createdAt: Date;
}
