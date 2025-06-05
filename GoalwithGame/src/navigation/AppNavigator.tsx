import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen.tsx';
import QuestCreateScreen from '../screens/QuestCreateScreen.tsx';
import QuestDetailScreen from '../screens/QuestDetailScreen.tsx';
import TeamScreen from '../screens/TeamScreen.tsx';
import TeamCreateScreen from '../screens/TeamCreateScreen.tsx';
import TeamFeedScreen from '../screens/TeamFeedScreen.tsx';
import ProfileScreen from '../screens/ProfileScreen.tsx';
import VerificationFeedScreen from '../screens/VerificationFeedScreen';
import QuestVerificationScreen from '../screens/QuestVerificationScreen';
import RecordAddScreen from '../screens/RecordAddScreen';
import { useAppContext } from '../contexts/AppContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
const MainTabs = () => {
  const { user } = useAppContext();
  
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
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          tabBarLabel: '팀',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Verification" 
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
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: '프로필',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f5f5f5',
          },
          headerTintColor: '#806a5b',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="QuestCreate" 
          component={QuestCreateScreen} 
          options={{ title: '퀘스트 생성' }}
        />
        <Stack.Screen 
          name="QuestDetail" 
          component={QuestDetailScreen} 
          options={{ title: '퀘스트 상세' }}
        />
        <Stack.Screen 
          name="TeamCreate" 
          component={TeamCreateScreen} 
          options={{ title: '팀 생성' }}
        />
        <Stack.Screen 
          name="TeamFeed" 
          component={TeamFeedScreen} 
          options={{ title: '팀 피드' }}
        />
        <Stack.Screen 
          name="QuestVerification" 
          component={QuestVerificationScreen} 
          options={{ title: '퀘스트 인증' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
