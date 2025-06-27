import { createDrawerNavigator } from '@react-navigation/drawer';
import PeersNav from './PeersNav';
import CustomDrawerContent from '../screens/peers/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function PeersDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={props => <CustomDrawerContent props={props} />}
    >
      <Drawer.Screen name="Peers" component={PeersNav} />
    </Drawer.Navigator>
  );
}
