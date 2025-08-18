import {ImageSourcePropType} from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  userType: string;
  level: number;
  actionPoints: number;
  avatar?: Avatar;
  badge?: Badge;
  exp: number;
  maxExp: number;
}

export interface Avatar {
  id: string;
  name: string;
  image: string;
}

export interface Badge {
  id: string;
  name: string;
  image: string;
}
