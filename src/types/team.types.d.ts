export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[];
  leaderId: string;
  isPublic?: boolean;
  feed: TeamPost[];
  createdAt?: string;
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

export interface TeamScreenNavigationProp {
  navigate: (screen: string, params?: { teamId: string }) => void;
}
