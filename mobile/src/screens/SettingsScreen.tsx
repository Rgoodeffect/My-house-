import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CategoryModal } from '../components/CategoryModal';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoriesContext';
import { useConfirm } from '../context/ConfirmContext';
import { useTheme } from '../theme/theme';
import { DataApi } from '../api/endpoints';

export function SettingsScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { categories, addCategory, removeCategory, refresh } = useCategories();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onDeleteCategory = async (id: string, name: string) => {
    if (categories.length <= 1) { Alert.alert('تنبيه', 'يجب أن تبقى فئة واحدة على الأقل'); return; }
    const ok = await confirm(`حذف فئة "${name}"؟`);
    if (!ok) return;
    try {
      await removeCategory(id);
    } catch {
      Alert.alert('خطأ', 'تعذر حذف الفئة');
    }
  };

  const exportJson = async () => {
    setBusy(true);
    try {
      const data = await DataApi.export();
      const file = new File(Paths.cache, `household-expenses-${Date.now()}.json`);
      file.write(JSON.stringify(data, null, 2));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
      } else {
        Alert.alert('تم', 'تم إنشاء الملف في: ' + file.uri);
      }
    } catch {
      Alert.alert('خطأ', 'تعذر تصدير البيانات');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    setBusy(true);
    try {
      const data = await DataApi.export();
      const rows = [['الاسم', 'المبلغ', 'الفئة', 'التاريخ', 'طريقة الدفع', 'ملاحظات']];
      data.expenses.forEach((e) => rows.push([e.name, String(e.amount), e.category, e.date, e.pay || '', e.note || '']));
      const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const file = new File(Paths.cache, `household-expenses-${Date.now()}.csv`);
      file.write(csv);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'text/csv' });
      } else {
        Alert.alert('تم', 'تم إنشاء الملف في: ' + file.uri);
      }
    } catch {
      Alert.alert('خطأ', 'تعذر تصدير البيانات');
    } finally {
      setBusy(false);
    }
  };

  const importJson = async () => {
    const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (picked.canceled || !picked.assets?.length) return;
    setBusy(true);
    try {
      const file = new File(picked.assets[0].uri);
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.expenses)) { Alert.alert('خطأ', 'ملف غير صالح'); return; }
      const ok = await confirm(`استيراد ${data.expenses.length} مصروف؟ سيتم استبدال كل بياناتك الحالية.`);
      if (!ok) return;
      await DataApi.import(data);
      await refresh();
      Alert.alert('تم', 'تم الاستيراد بنجاح ✓');
    } catch {
      Alert.alert('خطأ', 'تعذر قراءة الملف');
    } finally {
      setBusy(false);
    }
  };

  const clearAll = async () => {
    const ok = await confirm('مسح جميع البيانات نهائياً؟');
    if (!ok) return;
    const ok2 = await confirm('تأكيد أخير — لا يمكن التراجع.');
    if (!ok2) return;
    setBusy(true);
    try {
      await DataApi.clear();
      await refresh();
      Alert.alert('تم', 'تم مسح البيانات');
    } catch {
      Alert.alert('خطأ', 'تعذر مسح البيانات');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>👤 الحساب</Text>
        <Text style={{ color: theme.text2, textAlign: 'right' }}>{user?.name}</Text>
        <Text style={{ color: theme.text3, textAlign: 'right', marginBottom: 12 }}>{user?.email}</Text>
        <Button title="تسجيل الخروج" variant="danger" onPress={logout} />
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>🏷️ إدارة الفئات</Text>
        <View style={styles.catGrid}>
          {categories.map((c) => (
            <View key={c.id} style={[styles.catChip, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Pressable onPress={() => onDeleteCategory(c.id, c.name)} style={[styles.delBtn, { backgroundColor: theme.dangerBg }]}>
                <Ionicons name="close" size={12} color={theme.danger} />
              </Pressable>
              <Text style={{ fontSize: 22 }}>{c.icon}</Text>
              <Text style={{ fontSize: 11, color: theme.text2 }}>{c.name}</Text>
            </View>
          ))}
        </View>
        <Button title="✚ إضافة فئة جديدة" variant="primary" small onPress={() => setModalOpen(true)} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>📤 تصدير البيانات</Text>
        <Text style={[styles.desc, { color: theme.text2 }]}>احفظ نسخة احتياطية — استخدمها لنقل البيانات بين الأجهزة.</Text>
        <View style={styles.row}>
          <Button title="⬇️ JSON" variant="primary" onPress={exportJson} loading={busy} />
          <Button title="📊 CSV" onPress={exportCsv} loading={busy} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>📥 استيراد البيانات</Text>
        <Text style={[styles.desc, { color: theme.text2 }]}>استعد بياناتك من ملف JSON سبق تصديره.</Text>
        <Button title="📂 اختر ملف JSON" onPress={importJson} loading={busy} style={{ alignSelf: 'flex-start' }} />
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>🗑️ مسح البيانات</Text>
        <Button title="مسح كل البيانات" variant="danger" onPress={clearAll} loading={busy} />
      </Card>

      <CategoryModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={async (name, icon) => {
          await addCategory(name, icon);
          setModalOpen(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { margin: 14, marginBottom: 0, marginTop: 14 },
  title: { fontSize: 13, fontWeight: '700', marginBottom: 10, textAlign: 'right' },
  desc: { fontSize: 13, lineHeight: 20, marginBottom: 12, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', gap: 8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { width: '22%', alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: 16, borderWidth: 1, position: 'relative' },
  delBtn: { position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});
