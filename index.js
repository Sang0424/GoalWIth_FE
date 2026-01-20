/**
 * @format
 */
import './gesture-handler';
// import {AppRegistry} from 'react-native';
import {registerRootComponent} from 'expo';
import App from './App';
// import {name as appName} from './app.json';
import {startNetworkLogging} from 'react-native-network-logger';

startNetworkLogging();
export default registerRootComponent(App);
