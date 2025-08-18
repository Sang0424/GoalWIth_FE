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
  teamQuest: TeamQuest;
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

type TeamPayload = {
  name: string;
  description?: string;
  isPublic: boolean;
};

// API 응답 데이터의 타입을 정의합니다.
// 실제 응답 구조에 맞게 수정해주세요.
type TeamCreationResponse = {
  data: {
    teamId: number | string;
  };
};
