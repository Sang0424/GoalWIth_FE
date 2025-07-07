import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import HomeNav from './HomeNav';
import PeersDrawer from './PeersDrawer';
import MyPage from '../screens/bottomTab/MyPage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type {BottomTabParamList} from '../types/navigation';
import VerificationNav from '../navigation/VerificationNav';
import TeamNav from '../navigation/TeamNav';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomNav() {
  return (
    <Tab.Navigator
      initialRouteName={'HomeNav'}
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#d9d9d9',
        tabBarShowLabel: true,
        animation: 'shift',
      })}>
      <Tab.Screen
        name={'HomeNav'}
        component={HomeNav}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="home" color={color} size={size} />
          ),
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name={'VerificationNav'}
        component={VerificationNav}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="check-circle-outline" color={color} size={size} />
          ),
          tabBarLabel: '인증',
        }}
      />
      <Tab.Screen
        name={'Peers'}
        component={PeersDrawer}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="person" color={color} size={size} />
          ),
          tabBarLabel: '동료',
        }}
      />
      <Tab.Screen
        name={'TeamNav'}
        component={TeamNav}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="groups" color={color} size={size} />
          ),
          tabBarLabel: '팀',
        }}
      />
      <Tab.Screen
        name={'MyPage'}
        component={MyPage}
        options={{
          tabBarIcon: ({color, size}) => (
            // <Icon name="account-circle" color={color} size={size} />
            <Icon name="menu" color={color} size={size} />
          ),
          tabBarLabel: '더보기',
        }}
      />
    </Tab.Navigator>
  );
}
