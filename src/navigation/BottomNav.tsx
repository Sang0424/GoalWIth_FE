import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeNav from './HomeNav';
import FeedNav from './FeedNav';
import AddFeedNav from './AddFeedNav';
import PeersNav from './PeersNav';
import PeersDrawer from './PeersDrawer';
import MyPage from '../screens/bottomTab/MyPage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { BottomTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomNav() {
  return (
    <Tab.Navigator
      initialRouteName={'HomeNav'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#d9d9d9',
        tabBarShowLabel: true,
        animation: 'shift',
        tabBarStyle:
          (route.name === 'FeedNav' &&
            getFocusedRouteNameFromRoute(route) === 'PostDetail') ||
          (route.name === 'HomeNav' &&
            getFocusedRouteNameFromRoute(route) === 'PostDetail') ||
          getFocusedRouteNameFromRoute(route) === 'AddFeedNav'
            ? { display: 'none' }
            : undefined,
      })}
    >
      <Tab.Screen
        name={'HomeNav'}
        component={HomeNav}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name={'FeedNav'}
        component={FeedNav}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="newspaper" color={color} size={size} />
          ),
          tabBarLabel: '피드',
        }}
      />
      <Tab.Screen
        name={'AddFeedNav'}
        component={AddFeedNav}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="add" color={color} size={size} />
          ),
          tabBarStyle: {
            display: 'none',
          },
          tabBarLabel: '기록 추가',
        }}
      />
      <Tab.Screen
        name={'Peers'}
        component={PeersDrawer}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" color={color} size={size} />
          ),
          tabBarLabel: '동료',
        }}
      />
      <Tab.Screen
        name={'MyPage'}
        component={MyPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            // <Icon name="account-circle" color={color} size={size} />
            <Icon name="notifications" color={color} size={size} />
          ),
          tabBarLabel: '알림',
        }}
      />
    </Tab.Navigator>
  );
}
