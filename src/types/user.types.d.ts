import {ImageSourcePropType} from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  userType: string;
  level: number;
  actionPoints: number;
  character: string;
  badge?: Badge;
  exp: number;
  maxExp: number;
}

export interface RequestUser {
  requestser_id: string;
  requester_nickname: string;
  requester_userType: string;
  requester_level: number;
  requester_character: string;
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
