import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {Todo} from './todos';

export type OnBoardingStackParamList = {
  OnBoarding1: any;
  OnBoarding2: undefined;
  OnBoarding3: {
    registerForm: {
      name: string;
      email: string;
      password: string;
    };
  };
  Login: undefined;
  BottomNav: undefined;
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
};

export type HomeNavParamList = {
  Home: undefined;
  QuestFeed: {quest: Quest};
  CharacterSelection: {currentCharacter: string};
};

export type QuestFeedProps = NativeStackNavigationProp<
  HomeNavParamList,
  'QuestFeed'
>;

export type VerificationNavParamList = {
  Verification: undefined;
  QuestVerification: {quest: Quest};
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
};

export type PeersDrawerParamList = {
  PeersNav: NavigatorScreenParams<PeersNavParamList>;
};

export type PeerListProps = NativeStackNavigationProp<
  PeersNavParamList,
  'PeerListScreen'
>;

export type TeamNavParamList = {
  TeamScreen: undefined;
  TeamCreate: {teamToEdit?: Team};
  TeamFeedScreen: {teamId: string; teamName: string; teamQuest: string};
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
};
