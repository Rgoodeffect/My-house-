import { I18nManager } from 'react-native';
import { registerRootComponent } from 'expo';

import App from './App';

// The app is Arabic-only, so RTL is forced. This takes full effect after the
// next native reload — on a fresh install that's the very first launch; if
// you notice a stale LTR layout while iterating in Expo Go, fully close and
// reopen the app once.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
