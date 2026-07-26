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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const theme = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert('تنبيه', 'يرجى إدخال الاسم والبريد الإلكتروني وكلمة مرور لا تقل عن 6 أحرف');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
    } catch (e) {
      Alert.alert('خطأ', e instanceof ApiError ? e.message : 'تعذر إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={[styles.title, { color: theme.text }]}>حساب جديد</Text>
        <Text style={[styles.subtitle, { color: theme.text2 }]}>لمزامنة بياناتك بين أجهزتك</Text>

        <View style={styles.form}>
          <TextField label="الاسم" value={name} onChangeText={setName} placeholder="اسمك" />
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
            placeholder="6 أحرف على الأقل"
          />
          <Button title="إنشاء الحساب" variant="primary" onPress={onSubmit} loading={loading} />
          <Button title="لدي حساب مسبقاً — تسجيل الدخول" onPress={() => navigation.navigate('Login')} />
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
