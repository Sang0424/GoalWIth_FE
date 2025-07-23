import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnBoarding1 from '../screens/onboarding/OnBoarding1';
import OnBoarding2 from '../screens/onboarding/OnBoarding2';
import OnBoarding3 from '../screens/onboarding/OnBoarding3';
import BottomNav from './BottomNav';
import Login from '../screens/onboarding/Login';
import type {OnBoardingStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<OnBoardingStackParamList>();

export default function OnBoardingNav() {
  return (
    <Stack.Navigator
      initialRouteName="OnBoarding1"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="OnBoarding1" component={OnBoarding1} />
      <Stack.Screen name="OnBoarding2" component={OnBoarding2} />
      <Stack.Screen name="OnBoarding3" component={OnBoarding3} />
      <Stack.Screen name="BottomNav" component={BottomNav} />
    </Stack.Navigator>
  );
}
