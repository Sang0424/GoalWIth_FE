import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AppNavigatorParamList = {
  Home: undefined;
  TeamTab: undefined;
  Profile: undefined;
  RecordAdd: undefined;
  QuestDetail: { questId: string };
  TeamScreen: { teamId: string };
  QuestVerification: { questId: string; recordId: string };
};

export type AppNavigatorScreenProps = CompositeNavigationProp<
  BottomTabNavigationProp<AppNavigatorParamList>,
  NativeStackNavigationProp<AppNavigatorParamList>
>;
