/**
 * @format
 */
import './gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.log('▶ Index Loaded');

AppRegistry.registerComponent(appName, () => App);
