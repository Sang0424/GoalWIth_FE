if (__DEV__) {
  require('./ReactotronConfig');
}

import React from 'react';
import OnBoardingNav from './src/navigation/OnBoardingNav';
import BottomNav from './src/navigation/BottomNav';
import {useState, useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {tokenStore} from './src/store/tokenStore';
import {userStore} from './src/store/userStore';
import instance from './src/utils/axiosInterceptor';
import SplashScreen from 'react-native-splash-screen';
import {decodeJwt} from './src/utils/jwtUtils';
import {API_URL} from '@env';

const queryClient = new QueryClient();

const App = () => {
  console.log(API_URL);
  if (API_URL == '') {
    const accessToken = 'abc';
    return (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <SafeAreaProvider>
            <GestureHandlerRootView>
              {accessToken !== null ? <BottomNav /> : <OnBoardingNav />}
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </NavigationContainer>
      </QueryClientProvider>
    );
  } else {
    const accessToken = tokenStore(state => state.accessToken);
    // useEffect(() => {
    //   const initializeApp = async () => {
    //     try {
    //       const refreshToken = await AsyncStorage.getItem('refreshToken');
    //       console.log('refreshToken: ', refreshToken);
    //       //AsyncStorage.clear();
    //       //console.log(refreshToken);
    //       if (refreshToken) {
    //         const decoded = decodeJwt(refreshToken);
    //         console.log(decoded);
    //         if (decoded && decoded.exp && decoded.exp < Date.now() / 1000) {
    //           await AsyncStorage.removeItem('refreshToken');
    //           tokenStore.getState().actions.setAccessToken(null);
    //         }
    //         if (
    //           decoded &&
    //           decoded.exp &&
    //           decoded.exp - Date.now() / 1000 < 7 * 24 * 60 * 60 &&
    //           decoded.exp > Date.now() / 1000
    //         ) {
    //           const {data} = await instance.post('/user/refresh/refresh', {
    //             refreshToken: refreshToken,
    //           });
    //           await AsyncStorage.setItem('refreshToken', data.refreshToken);
    //         }
    //         if (accessToken == null) {
    //           const {data} = await instance.post('/user/refresh/access', {
    //             refreshToken: refreshToken,
    //           });
    //           tokenStore.getState().actions.setAccessToken(data.accessToken);
    //           await userStore.getState().loadUser();
    //         }
    //         await userStore.getState().loadUser();
    //       }
    //     } catch (error) {
    //       console.error('Failed to initialize app:', error);
    //     } finally {
    //       // SplashScreen.hide();
    //     }
    //   };

    //   initializeApp();
    // }, [accessToken]);
    return (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <SafeAreaProvider>
            <GestureHandlerRootView>
              {accessToken !== null ? <BottomNav /> : <OnBoardingNav />}
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </NavigationContainer>
      </QueryClientProvider>
    );
  }
};

export default App;
