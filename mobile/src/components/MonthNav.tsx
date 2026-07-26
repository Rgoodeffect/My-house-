import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMonth } from '../context/MonthContext';
import { useTheme } from '../theme/theme';
import { monthLabelOf } from '../utils/format';

export function MonthNav() {
  const theme = useTheme();
  const { selectedMonth, isCurrentMonth, shiftMonth, goToCurrentMonth } = useMonth();

  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Pressable
        onPress={() => shiftMonth(-1)}
        style={[styles.btn, { borderColor: theme.borderStrong, backgroundColor: theme.surface2 }]}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>‹</Text>
      </Pressable>
      <Text style={[styles.label, { color: theme.text }]}>{monthLabelOf(selectedMonth)}</Text>
      <Pressable
        onPress={() => shiftMonth(1)}
        style={[styles.btn, { borderColor: theme.borderStrong, backgroundColor: theme.surface2 }]}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>›</Text>
      </Pressable>
      {!isCurrentMonth && (
        <Pressable onPress={goToCurrentMonth} style={[styles.today, { backgroundColor: theme.accentBg }]}>
          <Text style={{ color: theme.accent, fontSize: 11 }}>اليوم</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  btn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '700' },
  today: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
});
