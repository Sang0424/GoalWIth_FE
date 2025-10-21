/**
 * @format
 */
console.log('앱 실행');
import './gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.log('--- Step 2: App 컴포넌트 등록 시도 ---'); // ✅ AppRegistry 위에 추가

AppRegistry.registerComponent(appName, () => App);
