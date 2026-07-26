import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14 },
});
