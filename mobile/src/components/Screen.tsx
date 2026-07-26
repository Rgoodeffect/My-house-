import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function Screen({ children, scroll = true, style, refreshing, onRefresh }: ScreenProps) {
  const theme = useTheme();
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={['bottom']}>
        <View style={[styles.flex, style]}>{children}</View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, style]}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 24 },
});
