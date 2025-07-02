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
  FeedNav: undefined;
  MyPage: undefined;
  AddFeedNav: undefined;
  Peers: undefined;
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
  QuestFeed: {questId: string};
  PostDetail: {feed_id: number | undefined};
  AddFeedNav: {
    screen: string;
    params: {
      feed: {
        id?: number;
        todo?: string;
        tag?: string;
        content?: stirng;
        images?: Image[];
      };
    };
  };
};

export type QuestFeedProps = NativeStackNavigationProp<
  HomeNavParamList,
  'QuestFeed'
>;

export type FeedNavParamList = {
  Feed: undefined;
  PostDetail: {feed_id: number; index?: number};
};

export type AddFeedNavParmList = {
  AddFeed: {
    feed: {
      id?: number;
      todo?: string;
      tag?: string;
      content?: stirng;
      images?: Image[];
    };
  };
  SelectTodo: {
    feed: {todo?: string; tag?: string; content?: stirng};
    setFeed: React.Dispatch<
      React.SetStateAction<{
        todo: string;
        tag: string;
        content: string;
      }>
    >;
  };
  SelectTag: {
    feed: {
      feed_id?: number;
      todo?: string;
      tag?: string;
      content?: stirng;
      images?: string[];
    };
    setFeed: React.Dispatch<
      React.SetStateAction<{
        todo: string;
        tag: string;
        content: string;
      }>
    >;
  };
  BottomNav: {
    screen: string;
    params: {screen: string; params: {feed_id: number}};
  };
};
export type AddFeedProps = NativeStackNavigationProp<
  AddFeedNavParmList,
  'AddFeedNav'
>;

export type PostDetailProps = RouteProp<BottomTabNavigationProp, 'PostDetail'>;

export type PeersNavParamList = {
  Peers: undefined;
  PeerRequest: {
    peers: Array<User>;
  };
};

type NavigationProp = DrawerNavigationProp<any> &
  NativeStackNavigationProp<PeersNavParamList>;
