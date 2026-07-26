import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { MonthProvider } from './src/context/MonthContext';
import { CategoriesProvider } from './src/context/CategoriesContext';
import { ConfirmProvider } from './src/context/ConfirmContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CategoriesProvider>
            <MonthProvider>
              <ConfirmProvider>
                <StatusBar style="auto" />
                <RootNavigator />
              </ConfirmProvider>
            </MonthProvider>
          </CategoriesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
