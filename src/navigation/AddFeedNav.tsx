import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddFeed from '../screens/bottomTab/AddFeed';
import SelectTodo from '../screens/addFeed/SelectTodo';
import SelectTag from '../screens/addFeed/SelectTag';
import type { AddFeedNavParmList } from '../types/navigation';
import BottomNav from './BottomNav';

const Stack = createNativeStackNavigator<AddFeedNavParmList>();

export default function AddFeedNav() {
  return (
    <Stack.Navigator
      initialRouteName={'AddFeed'}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name={'AddFeed'}
        component={AddFeed}
        initialParams={{ feed: { todo: '', tag: '', content: '' } }}
      />
      <Stack.Screen name={'SelectTodo'} component={SelectTodo} />
      <Stack.Screen name={'SelectTag'} component={SelectTag} />
      <Stack.Screen name={'BottomNav'} component={BottomNav} />
    </Stack.Navigator>
  );
}
