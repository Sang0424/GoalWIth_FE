import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeNav from './HomeNav';
import PeersDrawer from './PeersDrawer';
import MyPageNav from './MyPageNav';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type {BottomTabParamList} from '../types/navigation';
import VerificationNav from '../navigation/VerificationNav';
import TeamNav from '../navigation/TeamNav';
import {rewardStore} from '../store/rewardStore';
import {StyleSheet, View} from 'react-native';
import QuestVerification from '../screens/verification/QuestVerification';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomNav() {
  const hasNewCharacter = rewardStore(state => state.hasNewCharacter);
  const hasNewBadge = rewardStore(state => state.hasNewBadge);

  console.log('hasNewBage', hasNewBadge);
  console.log('hasNewCharacter', hasNewCharacter);

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
            <View>
              <Icon name="home" color={color} size={size} />
              {hasNewCharacter && <View style={styles.redDot} />}
            </View>
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
        name={'PeersDrawer'}
        component={PeersDrawer}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="person" color={color} size={size} />
          ),
          tabBarLabel: '동료',
        }}
      />
      {/* <Tab.Screen
        name={'TeamNav'}
        component={TeamNav}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="groups" color={color} size={size} />
          ),
          tabBarLabel: '팀',
        }}
      /> */}
      <Tab.Screen
        name={'MyPageNav'}
        component={MyPageNav}
        options={{
          tabBarIcon: ({color, size}) => (
            // <Icon name="account-circle" color={color} size={size} />
            <View>
              <Icon name="more-horiz" color={color} size={size} />
              {hasNewBadge && <View style={styles.redDot} />}
            </View>
          ),
          tabBarLabel: '더보기',
        }}
      />
      {/* <Tab.Screen
        name={'QuestVerification'}
        component={QuestVerification}
        options={{
          tabBarButton: () => null,
        }}
      /> */}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  redDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: 'red',
  },
});
