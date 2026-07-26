import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { BalanceScreen } from '../screens/BalanceScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AppHeader } from '../components/AppHeader';
import { useTheme } from '../theme/theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Add: 'add-circle',
  Budget: 'pie-chart',
  Balance: 'wallet',
  Reports: 'bar-chart',
  Settings: 'settings',
};

const LABELS: Record<keyof MainTabParamList, string> = {
  Home: 'الرئيسية',
  Add: 'إضافة',
  Budget: 'الميزانية',
  Balance: 'الرصيد',
  Reports: 'التقارير',
  Settings: 'الإعدادات',
};

export function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.text3,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabel: LABELS[route.name as keyof MainTabParamList],
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof MainTabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ header: () => <AppHeader showMonthNav /> }} />
      <Tab.Screen name="Add" component={AddExpenseScreen} options={{ header: () => <AppHeader /> }} />
      <Tab.Screen name="Budget" component={BudgetScreen} options={{ header: () => <AppHeader showMonthNav /> }} />
      <Tab.Screen name="Balance" component={BalanceScreen} options={{ header: () => <AppHeader showMonthNav /> }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ header: () => <AppHeader showMonthNav /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ header: () => <AppHeader /> }} />
    </Tab.Navigator>
  );
}
