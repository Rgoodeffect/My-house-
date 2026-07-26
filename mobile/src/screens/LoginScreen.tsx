import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import { ApiError } from '../api/client';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('خطأ', e instanceof ApiError ? e.message : 'تعذر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={[styles.title, { color: theme.text }]}>🏠 مصروفات البيت</Text>
        <Text style={[styles.subtitle, { color: theme.text2 }]}>تسجيل الدخول لمتابعة مصروفاتك</Text>

        <View style={styles.form}>
          <TextField
            label="البريد الإلكتروني"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextField
            label="كلمة المرور"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <Button title="تسجيل الدخول" variant="primary" onPress={onSubmit} loading={loading} />
          <Button title="ليس لدي حساب — إنشاء حساب جديد" onPress={() => navigation.navigate('Register')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 60, gap: 8 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 30 },
  form: { gap: 14 },
});
