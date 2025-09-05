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
import {MenuProvider} from 'react-native-popup-menu';
import axios from 'axios';

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const setAccessToken = tokenStore(state => state.actions.setAccessToken);
  const accessToken = tokenStore(state => state.accessToken);

  if (API_URL == '') {
    const accessToken = 'abc';
    return (
      <QueryClientProvider client={queryClient}>
        <MenuProvider>
          <NavigationContainer>
            <SafeAreaProvider>
              <GestureHandlerRootView>
                {accessToken !== null ? <BottomNav /> : <OnBoardingNav />}
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </NavigationContainer>
        </MenuProvider>
      </QueryClientProvider>
    );
  } else {
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          console.log('refreshToken', refreshToken);

          if (!refreshToken) {
            setIsAuthenticated(false);
            return;
          }

          const decoded = decodeJwt(refreshToken);
          const currentTime = Date.now() / 1000;

          // If refresh token is expired
          if (decoded?.exp && decoded.exp < currentTime) {
            await AsyncStorage.removeItem('refreshToken');
            setAccessToken(null);
            setIsAuthenticated(false);
            return;
          }

          // If we have a valid refresh token but no access token
          if (!accessToken) {
            try {
              const response = await axios.post(`${API_URL}/user/refresh`, {
                refreshToken,
              });
              const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              } = response.data;
              setAccessToken(newAccessToken);
              await AsyncStorage.setItem('refreshToken', newRefreshToken);
              setIsAuthenticated(true);
            } catch (error) {
              console.error('Token refresh failed:', error);
              //await AsyncStorage.removeItem('refreshToken');
              setAccessToken(null);
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [accessToken, setAccessToken]);
    // if (isLoading) {
    //   return <SplashScreen />;
    // }
    return (
      <QueryClientProvider client={queryClient}>
        <MenuProvider>
          <NavigationContainer>
            <SafeAreaProvider>
              <GestureHandlerRootView>
                {accessToken !== null ? <BottomNav /> : <OnBoardingNav />}
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </NavigationContainer>
        </MenuProvider>
      </QueryClientProvider>
    );
  }
};

export default App;
