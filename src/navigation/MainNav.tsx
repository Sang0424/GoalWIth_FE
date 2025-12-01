import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {MainNavParamList} from '../types/navigation';

// 기존 컴포넌트들 import
import BottomNav from './BottomNav';
import QuestVerification from '../screens/verification/QuestVerification';

const Stack = createNativeStackNavigator<MainNavParamList>();

export default function MainNav() {
  return (
    <Stack.Navigator
      initialRouteName={'BottomNav'}
      screenOptions={{headerShown: false}}>
      {/* 1. 기본적으로 보여줄 메인 화면 (바텀 탭) */}
      <Stack.Screen name="BottomNav" component={BottomNav} />
      {/* 2. 탭 위에 덮어씌울 공통 상세 화면들 */}
      <Stack.Screen name="QuestVerification" component={QuestVerification} />
    </Stack.Navigator>
  );
}
