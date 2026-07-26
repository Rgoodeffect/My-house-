import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';

export function RootNavigator() {
  const { user, isBootstrapping } = useAuth();
  const theme = useTheme();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return <NavigationContainer>{user ? <MainTabs /> : <AuthNavigator />}</NavigationContainer>;
}
