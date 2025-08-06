import type {Reaction, Quest} from './quest.types';

interface TeamReaction extends Omit<Reaction, 'questId'> {}

interface TeamQuest
  extends Omit<
    Quest,
    | 'id'
    | 'verificationRequired'
    | 'verificationCount'
    | 'requiredVerifications'
    | 'verifications'
    | 'description'
    | 'isMain'
    | 'records'
    | 'user'
    | 'reactions'
    | 'verifications'
  > {
  records: TeamPost[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: User[];
  leaderId: User;
  isPublic?: boolean;
  createdAt?: Date;
  quest: TeamQuest;
}

export interface TeamPost {
  id: string;
  user: User;
  text: string;
  images?: Asset[];
  reactions: TeamReaction[];
  verifications: QuestVerification[];
  createdAt: Date;
}

export interface TeamComment {
  id: string;
  user: User;
  content: string;
  reactions: TeamReaction[];
  createdAt: Date;
}

export interface TeamScreenNavigationProp {
  navigate: (screen: string, params?: {teamId: string}) => void;
}
