import type {Reaction, Quest, QuestVerification} from './quest.types';

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
  id: number;
  name: string;
  description?: string;
  members: User[];
  leaderId: User;
  isPublic?: boolean;
  createdAt?: Date;
  teamQuest: TeamQuest;
}

export interface TeamPost {
  id: number;
  user: User;
  text: string;
  images?: Asset[];
  reactions: TeamReaction[];
  verifications: QuestVerification[];
  createdAt: Date;
}

export interface TeamComment {
  id: number;
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

interface TeamPostResponse {
  id: number;
  text: string;
  images: string[];
  createdAt: string;
  reactions: any[]; // Replace with proper reaction type
  comments: TeamComment[];
  verifications: QuestVerification[];
  user: User;
  // Add other fields that come from the API
}

interface TeamFeedResponse {
  content: TeamPost[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

interface ApiDataReturnType {
  data?: any;
  team?: Team;
  pages: {
    records: TeamPost[];
    nextPage?: number;
  }[];
  pageParams: number[] | unknown[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  isLoading: boolean;
  // addTeamPost: (
  //   postData: Omit<TeamPost, 'id' | 'createdAt' | 'updatedAt' | 'reactions'>,
  // ) => void;
  // Add other methods that useApiData returns
  handleAddRecord: () => void;
  handleAddComment: (
    postId: number,
    commentData: Omit<
      QuestVerification,
      'id' | 'createdAt' | 'updatedAt' | 'user'
    >,
  ) => void;
  handleUpdatePost: (postId: number, updates: Partial<TeamPost>) => void;
  handleUpdateComment: (commentId: number, comment: string) => void;
  handleDeletePost: (postId: number) => void;
  handleDeleteComment: (commentId: number) => void;
  loadMore: () => void;
}
