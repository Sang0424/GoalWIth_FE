import {ImageSourcePropType} from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  userType: string;
  level: number;
  actionPoints: number;
  avatar?: string | ImageSourcePropType;
  badge?: string;
  exp: number;
  maxExp: number;
}
