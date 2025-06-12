import { ImageSourcePropType } from 'react-native';

export interface VerificationMessage {
  id: string;
  user: { id: string; nickname: string; avatar: string };
  text: string;
  createdAt: string;
}

export interface VerificationFeedItem {
  id: string;
  user: {
    id: string;
    nickname: string;
    avatar: string | ImageSourcePropType;
    level: number;
    badge?: string;
  };
  quest: {
    id: string;
    title: string;
    category: string;
    streak: number;
  };
  records: RecordItem[];
  content: {
    text: string;
    images: string[];
    tags: string[];
    location?: string;
  };
  reactions: {
    support: number;
    amazing: number;
    together: number;
    perfect: number;
  };
  comments: any[];
  quality_score: number;
  timestamp: string;
}

export interface RecordItem {
  id: string;
  text: string;
  images: string[];
  createdAt: string;
  userId: string;
  verifications?: VerificationMessage[];
}

export interface VerificationFeedCardProps {
  item: VerificationFeedItem;
}

export interface VerificationFeedScreenNavigationProp {
  navigate: (screen: string, params?: { questId: string }) => void;
}
