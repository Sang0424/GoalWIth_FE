import {createNativeStackNavigator} from '@react-navigation/native-stack';
import QuestFeed from '../screens/home/QuestFeed';
import Home from '../screens/bottomTab/Home';
import type {HomeNavParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<HomeNavParamList>();

export default function HomeNav() {
  return (
    <Stack.Navigator
      initialRouteName={'Home'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={'Home'} component={Home} />
      <Stack.Screen name={'QuestFeed'} component={QuestFeed} />
    </Stack.Navigator>
  );
}
