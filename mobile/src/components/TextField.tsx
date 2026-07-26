import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../theme/theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, ...props }: TextFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.group}>
      {label ? <Text style={[styles.label, { color: theme.text2 }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.text3}
        style={[
          styles.input,
          { backgroundColor: theme.surface2, borderColor: theme.borderStrong, color: theme.text },
          style,
        ]}
        {...props}
      />
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
    paddingVertical: 11,
    fontSize: 15,
    textAlign: 'right',
  },
});
