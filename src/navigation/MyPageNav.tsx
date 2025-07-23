import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {MyPageNavParamList} from '../types/navigation';
import MyPage from '../screens/bottomTab/MyPage';
import EditProfile from '../screens/MyPage/EditProfile';
import AppInfoPage from '../screens/MyPage/AppInfoPage';
import HelpPage from '../screens/MyPage/HelpPage';
import MarketScreen from '../screens/MyPage/MarketScreen';

const Stack = createNativeStackNavigator<MyPageNavParamList>();

export default function MyPageNav() {
  return (
    <Stack.Navigator
      initialRouteName={'MyPage'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={'MyPage'} component={MyPage} />
      <Stack.Screen name={'EditProfile'} component={EditProfile} />
      <Stack.Screen name={'AppInfoPage'} component={AppInfoPage} />
      <Stack.Screen name={'HelpPage'} component={HelpPage} />
      <Stack.Screen name={'MarketScreen'} component={MarketScreen} />
    </Stack.Navigator>
  );
}
