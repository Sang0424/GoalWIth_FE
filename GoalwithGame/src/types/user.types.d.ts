import { ImageSourcePropType } from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  userType: 'student' | 'mentor';
  level: number;
  actionPoints: number;
  avatar?: string | ImageSourcePropType;
  badge?: string;
  bio?: string;
  joinedAt?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
  nickname?: string;
  userType?: 'student' | 'mentor';
}
