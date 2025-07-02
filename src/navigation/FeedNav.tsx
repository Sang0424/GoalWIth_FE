import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PostDetail from '../screens/feed/PostDetail';
import Feed from '../screens/bottomTab/Feed';
import MyFeed from '../screens/home/QuestFeed';
import type {FeedNavParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<FeedNavParamList>();

export default function FeedNav() {
  return (
    <Stack.Navigator
      initialRouteName={'Feed'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={'Feed'} component={Feed} />
      <Stack.Screen name={'PostDetail'} component={PostDetail} />
    </Stack.Navigator>
  );
}
