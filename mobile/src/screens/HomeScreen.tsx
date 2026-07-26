import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Screen } from '../components/Screen';
import { Kpi } from '../components/Kpi';
import { SelectField } from '../components/SelectField';
import { TextField } from '../components/TextField';
import { ExpenseListItem } from '../components/ExpenseListItem';
import { useMonth } from '../context/MonthContext';
import { useCategories } from '../context/CategoriesContext';
import { useConfirm } from '../context/ConfirmContext';
import { useTheme } from '../theme/theme';
import { BudgetsApi, ExpensesApi } from '../api/endpoints';
import { Expense } from '../api/types';
import { fmt } from '../utils/format';
import type { MainTabParamList } from '../navigation/types';

export function HomeScreen() {
  const theme = useTheme();
  const { selectedMonth } = useMonth();
  const { categories } = useCategories();
  const confirm = useConfirm();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ expenses: list }, { budget }] = await Promise.all([
        ExpensesApi.listByMonth(selectedMonth),
        BudgetsApi.get(selectedMonth),
      ]);
      setExpenses(list);
      setBudgetTotal(budget.total || 0);
    } catch {
      Alert.alert('خطأ', 'تعذر تحميل بيانات الشهر');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const total = expenses.reduce((a, e) => a + e.amount, 0);
  const rem = budgetTotal - total;

  const filtered = expenses.filter((e) => {
    const q = query.trim().toLowerCase();
    if (catFilter && e.category !== catFilter) return false;
    if (q && !e.name.toLowerCase().includes(q) && !(e.note || '').toLowerCase().includes(q)) return false;
    return true;
  });

  const onDelete = async (expense: Expense) => {
    const ok = await confirm('حذف هذا المصروف؟');
    if (!ok) return;
    try {
      await ExpensesApi.remove(expense.id);
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
    } catch {
      Alert.alert('خطأ', 'تعذر حذف المصروف');
    }
  };

  const onEdit = (expense: Expense) => navigation.navigate('Add', { editing: expense });

  const catOptions = [{ label: 'كل الفئات', value: '' }, ...categories.map((c) => ({ label: `${c.icon} ${c.name}`, value: c.name }))];

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.kpiRow}>
        <Kpi label="إجمالي الشهر" value={fmt(total)} unit="دينار ليبي" />
        <Kpi
          label="المتبقي"
          value={budgetTotal > 0 ? fmt(Math.abs(rem)) : '—'}
          unit="من الميزانية"
          tone={budgetTotal > 0 ? (rem < 0 ? 'danger' : 'success') : 'default'}
        />
        <Kpi label="عدد العمليات" value={String(expenses.length)} unit="هذا الشهر" />
      </View>

      {budgetTotal > 0 && total >= budgetTotal && (
        <View style={[styles.alert, { backgroundColor: theme.dangerBg }]}>
          <Text style={{ color: theme.danger, fontSize: 13 }}>⚠️ تجاوزت الميزانية بـ {fmt(total - budgetTotal)} د.ل!</Text>
        </View>
      )}
      {budgetTotal > 0 && total < budgetTotal && total >= budgetTotal * 0.85 && (
        <View style={[styles.alert, { backgroundColor: theme.warningBg }]}>
          <Text style={{ color: theme.warning, fontSize: 13 }}>🔔 اقتربت من الميزانية — تبقى {fmt(budgetTotal - total)} د.ل</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text2 }]}>المصروفات الأخيرة</Text>
        <View style={styles.filterRow}>
          <View style={{ flex: 1 }}>
            <SelectField value={catFilter} options={catOptions} onChange={setCatFilter} placeholder="كل الفئات" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField value={query} onChangeText={setQuery} placeholder="بحث..." />
          </View>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
            <Text style={{ color: theme.text3 }}>لا توجد مصروفات</Text>
          </View>
        ) : (
          <View style={{ gap: 6 }}>
            {filtered.map((e) => (
              <ExpenseListItem key={e.id} expense={e} onEdit={() => onEdit(e)} onDelete={() => onDelete(e)} />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: 8, padding: 14 },
  alert: { marginHorizontal: 14, marginBottom: 6, padding: 12, borderRadius: 10 },
  section: { paddingHorizontal: 14, gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textAlign: 'right' },
  filterRow: { flexDirection: 'row', gap: 8 },
  empty: { alignItems: 'center', paddingVertical: 40 },
});
