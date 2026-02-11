import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {Todo} from './todos';

export type MainNavParamList = {
  BottomNav: undefined;
  QuestVerification: {id: number};
};

export type OnBoardingStackParamList = {
  OnBoarding1: any;
  OnBoarding2: undefined;
  OnBoarding3: {
    registerForm?: {
      name: string;
      email: string;
      password?: string; // 소셜 로그인의 경우 비밀번호가 없음
    };
    isSocial?: boolean; // 소셜 로그인 여부 플래그
    accessToken?: string;
    refreshToken?: string;
    isGoogle?: boolean;
    isKakao?: boolean;
    isApple?: boolean;
  };
  Login: undefined;
  MainNav: undefined;
};

export type OnBoarding3Props = NativeStackScreenProps<
  OnBoardingStackParamList,
  'OnBoarding3'
>;
export type BottomTabParamList = {
  HomeNav: undefined;
  VerificationNav: undefined;
  MyPageNav: undefined;
  TeamNav: undefined;
  PeersDrawer: undefined;
  // QuestVerification: {id: number};
};

export type HomeNavParamList = {
  Home: undefined;
  QuestFeed: {quest: Quest};
  CharacterSelection: {currentCharacter: string};
  QuestVerification: {id: number; authorId: number; quest?: Quest};
};

export type QuestFeedProps = NativeStackNavigationProp<
  HomeNavParamList,
  'QuestFeed'
>;

export type VerificationNavParamList = {
  Verification: undefined;
  QuestVerification: {id: number; authorId: number};
};

export type QuestVerificationProps = NativeStackNavigationProp<
  VerificationNavParamList,
  'QuestVerification'
>;

export type BottomNavParamList = {
  BottomNav: {
    screen: string;
    params: {screen: string; params: {feed_id: number}};
  };
};

export type PeersNavParamList = {
  Peers: undefined;
  PeerRequest: undefined;
  PeerListScreen: {type: string};
  QuestVerification: {id: number; authorId: number};
};

export type PeersDrawerParamList = {
  PeersNav: NavigatorScreenParams<PeersNavParamList>;
  QuestVerification: {id: number};
};

export type PeerListProps = NativeStackNavigationProp<
  PeersNavParamList,
  'PeerListScreen'
>;

export type TeamNavParamList = {
  TeamScreen: undefined;
  TeamCreate: {teamToEdit?: Team};
  TeamFeedScreen: {teamId: number; teamName: string; teamQuest: string};
  TeamQuestCreateScreen: {teamName: string; data: string | number};
};
export type TeamProps = NativeStackNavigationProp<
  TeamNavParamList,
  'TeamScreen'
>;
export type TeamFeedProps = NativeStackNavigationProp<
  TeamNavParamList,
  'TeamFeedScreen'
>;

export type MyPageNavParamList = {
  MyPage: undefined;
  EditProfile: undefined;
  AppInfoPage: undefined;
  HelpPage: undefined;
  MarketScreen: undefined;
  MyVerification: undefined;
  MyReaction: undefined;
  MyBookmark: undefined;
  QuestVerification: {quest: Quest};
  InquiryPage: undefined;
  CharacterSelection: {currentCharacter: string};
};

export type RootStackParamList = {
  VerificationNav: NavigatorScreenParams<VerificationNavParamList>;
  PeersNav: NavigatorScreenParams<PeersNavParamList>;
  QuestVerification: {id: number; authorId: number};
  PeersDrawer: NavigatorScreenParams<PeersDrawerParamList>;
};
