import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {MyPageNavParamList} from '../types/navigation';
import MyPage from '../screens/bottomTab/MyPage';
import EditProfile from '../screens/MyPage/EditProfile';
import AppInfoPage from '../screens/MyPage/AppInfoPage';
import HelpPage from '../screens/MyPage/HelpPage';
import MarketScreen from '../screens/MyPage/MarketScreen';
import MyVerification from '../screens/MyPage/MyVerification';
import MyReaction from '../screens/MyPage/MyReaction';
import MyBookmark from '../screens/MyPage/MyBookmark';
import QuestVerification from '../screens/verification/QuestVerification';
import InquiryPage from '../screens/MyPage/InquiryPage';

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
      <Stack.Screen name={'MyVerification'} component={MyVerification} />
      <Stack.Screen name={'MyReaction'} component={MyReaction} />
      <Stack.Screen name={'MyBookmark'} component={MyBookmark} />
      <Stack.Screen name={'QuestVerification'} component={QuestVerification} />
      <Stack.Screen name={'InquiryPage'} component={InquiryPage} />
    </Stack.Navigator>
  );
}
