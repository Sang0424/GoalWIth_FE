import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import QuestDetailScreen from '../screens/QuestDetailScreen';
import TeamScreen from '../screens/TeamScreen';
import TeamFeedScreen from '../screens/TeamFeedScreen';
import TeamCreateScreen from '../screens/TeamCreateScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VerificationFeedScreen from '../screens/VerificationFeedScreen';
import QuestVerificationScreen from '../screens/QuestVerificationScreen';
import RecordAddScreen from '../screens/RecordAddScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Context
import { useAuth } from '../contexts/AuthContext';
import { AppNavigatorParamList, AuthStackParamList, MainTabParamList } from './types';

// Create navigators
const Stack = createNativeStackNavigator<AppNavigatorParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Loading screen component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#806a5b" />
  </View>
);

// Auth stack navigator
const AuthStackNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

// Main tab navigator
const MainTabs = () => {
  const { user } = useAuth();
  
  // Get the first team ID for the user (you might want to handle this differently based on your app's requirements)
  const teamId = user?.teams?.[0]?.id;

  // if (!teamId) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <Text>No team found. Please join or create a team first.</Text>
  //     </View>
  //   );
  // }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'help';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TeamTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#806a5b',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: '홈' }} 
      />
      <Tab.Screen 
        name="VerificationFeed" 
        component={VerificationFeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
          tabBarLabel: '인증',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="RecordAdd" 
        component={RecordAddScreen} 
        options={{ 
          title: '기록 추가',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="TeamTab" 
        component={TeamScreen} 
        initialParams={{ teamId }}
        options={{ title: '팀' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: '프로필' }} 
      />
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated user flow
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="QuestDetail" component={QuestDetailScreen} />
            <Stack.Screen name="TeamScreen" component={TeamScreen} />
            <Stack.Screen name="TeamCreate" component={TeamCreateScreen} />
            <Stack.Screen name="QuestVerification" component={QuestVerificationScreen} />
            <Stack.Screen name="RecordAdd" component={RecordAddScreen} />
            <Stack.Screen name="VerificationFeed" component={VerificationFeedScreen} />
          </>
        ) : (
          // Unauthenticated user flow
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
