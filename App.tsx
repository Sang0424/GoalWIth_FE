// if (__DEV__) {
//   require('./ReactotronConfig');
// }

import React from 'react';
import OnBoardingNav from './src/navigation/OnBoardingNav';
import BottomNav from './src/navigation/BottomNav';
import { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStore } from './src/store/tokenStore';
import { userStore } from './src/store/userStore';
import instance from './src/utils/axiosInterceptor';
import SplashScreen from 'react-native-splash-screen';
import { decodeJwt } from './src/utils/jwtUtils';

const queryClient = new QueryClient();

const App = () => {
  const user = userStore(state => state.user);
  const accessToken = tokenStore(state => state.accessToken);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');

        // AsyncStorage.clear();
        // console.log(refreshToken);
        if (refreshToken) {
          const decoded = decodeJwt(refreshToken);
          console.log(decoded);
          if (decoded && decoded.exp && decoded.exp < Date.now() / 1000) {
            await AsyncStorage.removeItem('refresh_token');
            tokenStore.getState().actions.setAccessToken(null);
          }
          if (
            decoded &&
            decoded.exp &&
            decoded.exp - Date.now() / 1000 < 7 * 24 * 60 * 60 &&
            decoded.exp > Date.now() / 1000
          ) {
            const { data } = await instance.post('/users/refresh/refresh', {
              refreshToken: refreshToken,
            });
            await AsyncStorage.setItem('refresh_token', data.refresh_token);
          }
          if (accessToken == null) {
            const { data } = await instance.post('/users/refresh/access', {
              refreshToken: refreshToken,
            });
            tokenStore.getState().actions.setAccessToken(data.access_token);
            await userStore.getState().loadUser();
          }
          await userStore.getState().loadUser();
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        // SplashScreen.hide();
      }
    };

    initializeApp();
  }, [accessToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <SafeAreaProvider>
          <GestureHandlerRootView>
            {user !== null ? <BottomNav /> : <OnBoardingNav />}
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

export default App;
