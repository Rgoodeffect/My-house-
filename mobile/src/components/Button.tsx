import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'outline';
  small?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'outline', small, loading, disabled, style }: ButtonProps) {
  const theme = useTheme();
  const bg = variant === 'primary' ? theme.accent : variant === 'success' ? theme.success : 'transparent';
  const borderColor = variant === 'danger' ? theme.danger : variant === 'outline' ? theme.borderStrong : bg;
  const textColor = variant === 'primary' || variant === 'success' ? '#fff' : variant === 'danger' ? theme.danger : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        { backgroundColor: bg, borderColor },
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.text, { color: textColor }, small && styles.smallText]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { minHeight: 36, paddingHorizontal: 12 },
  text: { fontSize: 14, fontWeight: '600' },
  smallText: { fontSize: 12 },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.5 },
});
