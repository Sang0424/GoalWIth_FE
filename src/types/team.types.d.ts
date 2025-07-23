import type {Reaction, Quest} from './quest.types';

interface TeamReaction extends Omit<Reaction, 'questId' | 'id'> {}

interface TeamQuest
  extends Omit<
    Quest,
    | 'id'
    | 'verificationRequired'
    | 'verificationCount'
    | 'requiredVerifications'
    | 'records'
    | 'verifications'
    | 'description'
    | 'isMain'
  > {}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[];
  leaderId: string;
  isPublic?: boolean;
  feed: TeamPost[];
  createdAt?: string;
  quest: TeamQuest;
}

export interface TeamPost {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  reactions: TeamReaction[];
  comments: TeamComment[];
  createdAt: string;
}

export interface TeamComment {
  id: string;
  userId: string;
  content: string;
  reactions: TeamReaction[];
  createdAt: string;
}

export interface TeamScreenNavigationProp {
  navigate: (screen: string, params?: {teamId: string}) => void;
}
