import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Verification from '../screens/bottomTab/Verification';
import QuestVerification from '../screens/verification/QuestVerification';
import type {VerificationNavParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<VerificationNavParamList>();

export default function VerificationNav() {
  return (
    <Stack.Navigator
      initialRouteName={'Verification'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={'Verification'} component={Verification} />
      <Stack.Screen name={'QuestVerification'} component={QuestVerification} />
    </Stack.Navigator>
  );
}
