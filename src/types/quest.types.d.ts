export interface Quest {
  id: number;
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
  id: number;
  text?: string;
  images?: Asset[];
  questId: number;
  createdAt: Date;
  user: User;
}

export interface QuestVerification {
  id: number;
  username: string;
  text: string;
  character: string;
  createdAt: Date;
}

export interface RouteParams {
  questId: number;
  isMain?: boolean;
}

export type ReactionType = 'support' | 'amazing' | 'together' | 'perfect';

export interface Reaction {
  id: number;
  questId: number;
  user: User;
  reactionType: ReactionType;
  createdAt: Date;
}
