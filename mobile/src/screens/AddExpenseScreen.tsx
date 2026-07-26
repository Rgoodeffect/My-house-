import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { SelectField } from '../components/SelectField';
import { DateField } from '../components/DateField';
import { Button } from '../components/Button';
import { useCategories } from '../context/CategoriesContext';
import { useMonth } from '../context/MonthContext';
import { useTheme } from '../theme/theme';
import { ExpensesApi } from '../api/endpoints';
import { PAY_METHODS } from '../utils/constants';
import { todayISODate } from '../utils/format';
import type { MainTabParamList } from '../navigation/types';

type AddRoute = RouteProp<MainTabParamList, 'Add'>;

const PAY_OPTIONS = PAY_METHODS.map((p) => ({ label: p === 'نقداً' ? '💵 نقداً' : p === 'بطاقة' ? '💳 بطاقة' : '📲 تحويل', value: p }));

export function AddExpenseScreen() {
  const theme = useTheme();
  const { categories } = useCategories();
  const { goToCurrentMonth, selectedMonth } = useMonth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute<AddRoute>();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayISODate());
  const [pay, setPay] = useState<string>('نقداً');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setName('');
    setAmount('');
    setNote('');
    setPay('نقداً');
    setDate(todayISODate());
    setCategory(categories[0]?.name || '');
  }, [categories]);

  useFocusEffect(
    useCallback(() => {
      const editing = route.params?.editing;
      if (editing) {
        setEditingId(editing.id);
        setName(editing.name);
        setAmount(String(editing.amount));
        setCategory(editing.category);
        setDate(editing.date);
        setPay(editing.pay || 'نقداً');
        setNote(editing.note || '');
        navigation.setParams({ editing: undefined });
      } else if (!editingId && !category && categories.length) {
        setCategory(categories[0].name);
      }
    }, [route.params?.editing, categories, editingId, category, navigation])
  );

  const onSubmit = async () => {
    const amountNum = parseFloat(amount);
    if (!name.trim() || isNaN(amountNum) || amountNum <= 0 || !date || !category) {
      Alert.alert('تنبيه', 'يرجى ملء الاسم والمبلغ والتاريخ والفئة');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), amount: amountNum, category, date, pay, note: note.trim() || null };
      if (editingId) {
        await ExpensesApi.update(editingId, payload);
      } else {
        await ExpensesApi.create(payload);
      }
      resetForm();
      if (date.slice(0, 7) !== selectedMonth) goToCurrentMonth();
      navigation.navigate('Home');
    } catch {
      Alert.alert('خطأ', 'تعذر حفظ المصروف');
    } finally {
      setSaving(false);
    }
  };

  const catOptions = categories.map((c) => ({ label: `${c.icon} ${c.name}`, value: c.name }));

  return (
    <Screen>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>{editingId ? 'تعديل مصروف' : 'مصروف جديد'}</Text>

        <View style={styles.form}>
          <TextField label="اسم المصروف" value={name} onChangeText={setName} placeholder="مثال: فاتورة كهرباء" />
          <TextField
            label="المبلغ (د.ل)"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <SelectField label="الفئة" value={category} options={catOptions} onChange={setCategory} />
          <DateField label="التاريخ" value={date} onChange={setDate} />
          <SelectField label="طريقة الدفع" value={pay} options={PAY_OPTIONS} onChange={setPay} />
          <TextField
            label="ملاحظات (اختياري)"
            value={note}
            onChangeText={setNote}
            placeholder="تفاصيل إضافية..."
            multiline
            numberOfLines={3}
            style={{ height: 70, textAlignVertical: 'top' }}
          />
        </View>

        <View style={styles.row}>
          <Button title={editingId ? '💾 تحديث' : '✚ إضافة'} variant="primary" onPress={onSubmit} loading={saving} style={{ flex: 1 }} />
          <Button title="مسح" onPress={resetForm} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { margin: 14 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 14, textAlign: 'right' },
  form: { gap: 12 },
  row: { flexDirection: 'row-reverse', gap: 8, marginTop: 14 },
});
