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
  exp:number;
  maxExp:number;
}

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
  nickname?: string;
  userType?: 'student' | 'mentor';
}
