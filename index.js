import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';

// 🚨 핵심: 'Global' 이름으로 명시적으로 등록
AppRegistry.registerComponent('Global', () => App);

// 📌 Expo 환경 등록 ('main'으로 등록됨)
registerRootComponent(App);
