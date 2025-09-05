import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {PeersNavParamList} from '../types/navigation';
import Peers from '../screens/bottomTab/Peers';
import PeerRequest from '../screens/peers/PeerRequest';
import PeerListScreen from '../screens/peers/PeerListScreen';

const Stack = createNativeStackNavigator<PeersNavParamList>();

export default function PeersNav() {
  return (
    <Stack.Navigator
      initialRouteName={'Peers'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={'Peers'} component={Peers} />
      <Stack.Screen name={'PeerRequest'} component={PeerRequest} />
      <Stack.Screen name={'PeerListScreen'} component={PeerListScreen} />
    </Stack.Navigator>
  );
}
