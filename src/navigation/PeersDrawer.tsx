import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CustomDrawerContent from '../screens/peers/CustomDrawerContent';
import PeersNav from './PeersNav';
import QuestVerification from '../screens/verification/QuestVerification';
import {PeersDrawerParamList} from '../types/navigation';

const Drawer = createDrawerNavigator<PeersDrawerParamList>();

export default function PeersDrawer() {
  return (
    <Drawer.Navigator
      // CustomDrawerContent에 props를 올바르게 전달하고 있는지 확인
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        swipeEnabled: false,
        drawerStyle: {
          width: '80%',
          backgroundColor: '#FFFFFF',
        },
        overlayColor: 'rgba(0,0,0,0.5)',
      }}>
      <Drawer.Screen
        name="PeersNav"
        component={PeersNav}
        options={{drawerItemStyle: {display: 'none'}}}
      />
    </Drawer.Navigator>
  );
}
