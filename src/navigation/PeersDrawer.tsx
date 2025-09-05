// import {createDrawerNavigator} from '@react-navigation/drawer';
// import PeersNav from './PeersNav';
// import CustomDrawerContent from '../screens/peers/CustomDrawerContent';
// import {PeersDrawerParamList} from '../types/navigation';

// const Drawer = createDrawerNavigator<PeersDrawerParamList>();

// export default function PeersDrawer() {
//   return (
//     <Drawer.Navigator
//       screenOptions={{
//         headerShown: false,
//         drawerType: 'front',
//         drawerStyle: {
//           width: '80%',
//         },
//         overlayColor: 'transparent',
//       }}
//       drawerContent={props => <CustomDrawerContent {...props} />}>
//       <Drawer.Screen
//         name="PeersNav"
//         component={PeersNav}
//         options={{drawerItemStyle: {display: 'none'}}}
//       />
//     </Drawer.Navigator>
//   );
// }
import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CustomDrawerContent from '../screens/peers/CustomDrawerContent';
import PeersNav from './PeersNav'; // PeersNav import 경로가 올바른지 확인

// types/navigation 파일에서 타입을 정확히 import 했는지 확인
import {PeersDrawerParamList} from '../types/navigation';

const Drawer = createDrawerNavigator<PeersDrawerParamList>();

export default function PeersDrawer() {
  return (
    <Drawer.Navigator
      // CustomDrawerContent에 props를 올바르게 전달하고 있는지 확인
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: '80%',
        },
        overlayColor: 'transparent',
      }}>
      {/*
        ‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️
        이 부분의 name이 'PeersNav'가 맞는지 다시 한번 확인해주세요.
        다른 모든 것이 정상이라면, 이 이름이 문제의 원인일 수밖에 없습니다.
        아래 코드를 그대로 복사해서 붙여넣어 보세요.
        ‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️
      */}
      <Drawer.Screen
        name="PeersNav"
        component={PeersNav}
        options={{drawerItemStyle: {display: 'none'}}}
      />
    </Drawer.Navigator>
  );
}
