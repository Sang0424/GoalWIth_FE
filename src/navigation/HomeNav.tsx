import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyFeed from '../screens/home/MyFeed';
import Home from '../screens/bottomTab/Home';
// import FeedNav from './FeedNav';
import PostDetail from '../screens/feed/PostDetail';
import AddFeedNav from './AddFeedNav';
import AddFeed from '../screens/bottomTab/AddFeed';
import type { HomeNavParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<HomeNavParamList>();

export default function HomeNav() {
  return (
    <Stack.Navigator
      initialRouteName={'Home'}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={'Home'} component={Home} />
      <Stack.Screen name={'MyFeed'} component={MyFeed} />
      <Stack.Screen name={'PostDetail'} component={PostDetail} />
      <Stack.Screen name={'AddFeedNav'} component={AddFeedNav} />
    </Stack.Navigator>
  );
}
