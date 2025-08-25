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
export type HomeProps = BottomTabNavigationProp<
  BottomTabParamList,
  ['Feed', 'MyPage']
>;
export type FeedProps = BottomTabNavigationProp<BottomTabParamList, 'Feed'>;
export type MyPageProps = BottomTabNavigationProp<
  BottomTabParamList,
  ['Home', 'Feed']
>;

export type HomeNavParamList = {
  Home: undefined;
  QuestFeed: {quest: Quest};
  CharacterSelection;
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
  PeerRequest: {
    peers: Array<User>;
  };
};

type NavigationProp = DrawerNavigationProp<any> &
  NativeStackNavigationProp<PeersNavParamList>;

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
