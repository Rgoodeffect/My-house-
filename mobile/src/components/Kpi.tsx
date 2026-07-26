import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/theme';

interface KpiProps {
  label: string;
  value: string;
  unit?: string;
  tone?: 'danger' | 'success' | 'default';
  valueSize?: number;
}

export function Kpi({ label, value, unit, tone = 'default', valueSize = 18 }: KpiProps) {
  const theme = useTheme();
  const color = tone === 'danger' ? theme.danger : tone === 'success' ? theme.success : theme.text;
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.text3 }]}>{label}</Text>
      <Text style={[styles.value, { color, fontSize: valueSize }]}>{value}</Text>
      {unit ? <Text style={[styles.unit, { color: theme.text3 }]}>{unit}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'flex-end' },
  label: { fontSize: 11, marginBottom: 6, textAlign: 'right' },
  value: { fontWeight: '700' },
  unit: { fontSize: 10, marginTop: 4, textAlign: 'right' },
});
