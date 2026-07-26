import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/theme';
import { fmtDate } from '../utils/format';

interface DateFieldProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'dismissed') return;
    if (date) onChange(date.toISOString().split('T')[0]);
  };

  return (
    <View style={styles.group}>
      {label ? <Text style={[styles.label, { color: theme.text2 }]}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.input, { backgroundColor: theme.surface2, borderColor: theme.borderStrong }]}
      >
        <Text style={{ color: theme.text, fontSize: 15 }}>{value ? fmtDate(value) : '—'}</Text>
      </Pressable>

      {open && (
        <View>
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setOpen(false)} style={[styles.done, { backgroundColor: theme.accent }]}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>تم</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 12, fontWeight: '500', textAlign: 'right' },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  done: { marginTop: 8, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
});
