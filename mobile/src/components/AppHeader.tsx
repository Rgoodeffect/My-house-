import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { MonthNav } from './MonthNav';

interface AppHeaderProps {
  showMonthNav?: boolean;
}

function todayLabel(): string {
  const d = new Date();
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

export function AppHeader({ showMonthNav }: AppHeaderProps) {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.surface }}>
      <View style={[styles.topBar, { borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>🏠 مصروفات البيت</Text>
        <View style={[styles.badge, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          <Text style={{ color: theme.text3, fontSize: 12 }}>{todayLabel()}</Text>
        </View>
      </View>
      {showMonthNav ? <MonthNav /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '700' },
  badge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4 },
});
