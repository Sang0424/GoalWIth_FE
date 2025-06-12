import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Main App Navigator Types
export type AppNavigatorParamList = {
  MainTabs: undefined;
  Onboarding: undefined;
  Auth: undefined;
  QuestDetail: { questId: string };
  TeamScreen: { teamId: string };
  TeamCreate: undefined;
  QuestVerification: { questId: string; recordId: string };
  RecordAdd: undefined;
  VerificationFeed: undefined;
};

// Auth Stack Types
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
};

// Tab Navigator Types
export type MainTabParamList = {
  Home: undefined;
  TeamTab: { teamId: string };
  Profile: undefined;
  VerificationFeed: undefined;
  RecordAdd: undefined;
};

// Navigation Props
export type AppNavigatorScreenProps = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<AppNavigatorParamList>
>;

export type AuthScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// Screen Props
export type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
};

export type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
};

// Route Props
export type QuestDetailScreenRouteProp = RouteProp<AppNavigatorParamList, 'QuestDetail'>;
export type TeamScreenRouteProp = RouteProp<AppNavigatorParamList, 'TeamScreen'>;
export type QuestVerificationRouteProp = RouteProp<AppNavigatorParamList, 'QuestVerification'>;
