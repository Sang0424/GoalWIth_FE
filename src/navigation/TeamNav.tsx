import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TeamScreen from '../screens/bottomTab/Team';
import type {TeamNavParamList} from '../types/navigation';
import TeamCreate from '../screens/team/TeamCreate';
import TeamFeedScreen from '../screens/team/TeamFeed';
import TeamQuestCreateScreen from '../screens/team/TeamQuestCreate';

const Stack = createNativeStackNavigator<TeamNavParamList>();

export default function PeersNav() {
  return (
    <Stack.Navigator
      initialRouteName={'TeamScreen'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={'TeamScreen'} component={TeamScreen} />
      <Stack.Screen name={'TeamCreate'} component={TeamCreate} />
      <Stack.Screen name={'TeamFeedScreen'} component={TeamFeedScreen} />
      <Stack.Screen
        name={'TeamQuestCreateScreen'}
        component={TeamQuestCreateScreen}
      />
    </Stack.Navigator>
  );
}
