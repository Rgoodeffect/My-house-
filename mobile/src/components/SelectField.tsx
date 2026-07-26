import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/theme';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SelectField({ label, value, options, onChange, placeholder }: SelectFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View style={styles.group}>
      {label ? <Text style={[styles.label, { color: theme.text2 }]}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.input, { backgroundColor: theme.surface2, borderColor: theme.borderStrong }]}
      >
        <Text style={{ color: current ? theme.text : theme.text3, fontSize: 15 }}>
          {current ? current.label : placeholder || 'اختر...'}
        </Text>
        <Text style={{ color: theme.text3 }}>﹀</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
            {label ? <Text style={[styles.sheetTitle, { color: theme.text }]}>{label}</Text> : null}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[styles.option, { borderColor: theme.border }, item.value === value && { backgroundColor: theme.accentBg }]}
                >
                  <Text style={{ color: theme.text, fontSize: 15, textAlign: 'right' }}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 12, fontWeight: '500', textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, paddingBottom: 32 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, textAlign: 'right' },
  option: { paddingVertical: 14, borderBottomWidth: 1, borderRadius: 8, paddingHorizontal: 8 },
});
