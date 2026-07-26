import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { useMonth } from '../context/MonthContext';
import { useCategories } from '../context/CategoriesContext';
import { useConfirm } from '../context/ConfirmContext';
import { useTheme } from '../theme/theme';
import { BudgetsApi, ExpensesApi } from '../api/endpoints';
import { BudgetMap, Expense } from '../api/types';
import { fmt, monthLabelOf, prevMonthKey } from '../utils/format';

export function BudgetScreen() {
  const theme = useTheme();
  const { selectedMonth } = useMonth();
  const { categories } = useCategories();
  const confirm = useConfirm();

  const [totalInput, setTotalInput] = useState('');
  const [catInputs, setCatInputs] = useState<Record<string, string>>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [prevBudget, setPrevBudget] = useState<BudgetMap | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ budget }, { expenses: list }, prev] = await Promise.all([
        BudgetsApi.get(selectedMonth),
        ExpensesApi.listByMonth(selectedMonth),
        BudgetsApi.get(prevMonthKey(selectedMonth)),
      ]);
      setTotalInput(budget.total ? String(budget.total) : '');
      const nextInputs: Record<string, string> = {};
      categories.forEach((c) => { if (budget[c.name]) nextInputs[c.name] = String(budget[c.name]); });
      setCatInputs(nextInputs);
      setExpenses(list);
      setPrevBudget(Object.keys(prev.budget).length ? prev.budget : null);
    } catch {
      Alert.alert('خطأ', 'تعذر تحميل الميزانية');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, categories]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    setSaving(true);
    try {
      const entries: BudgetMap = {};
      const t = parseFloat(totalInput);
      if (!isNaN(t) && t > 0) entries.total = t;
      Object.entries(catInputs).forEach(([cat, v]) => {
        const n = parseFloat(v);
        if (!isNaN(n) && n > 0) entries[cat] = n;
      });
      await BudgetsApi.save(selectedMonth, entries);
      Alert.alert('تم', 'تم حفظ ميزانية ' + monthLabelOf(selectedMonth) + ' ✓');
      await load();
    } catch {
      Alert.alert('خطأ', 'تعذر حفظ الميزانية');
    } finally {
      setSaving(false);
    }
  };

  const copyPrev = async () => {
    if (!prevBudget) return;
    const ok = await confirm(`نسخ ميزانية ${monthLabelOf(prevMonthKey(selectedMonth))} إلى ${monthLabelOf(selectedMonth)}؟`);
    if (!ok) return;
    try {
      await BudgetsApi.save(selectedMonth, prevBudget);
      await load();
    } catch {
      Alert.alert('خطأ', 'تعذر نسخ الميزانية');
    }
  };

  const hasCurrentEntries = !!totalInput || Object.values(catInputs).some((v) => v);
  const spentByCat: Record<string, number> = {};
  expenses.forEach((e) => { spentByCat[e.category] = (spentByCat[e.category] || 0) + e.amount; });

  const progressItems = categories
    .map((c) => ({
      cat: c.name,
      icon: c.icon,
      spent: spentByCat[c.name] || 0,
      limit: parseFloat(catInputs[c.name] || '0') || 0,
    }))
    .filter((i) => i.spent > 0 || i.limit > 0);

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>الميزانية الإجمالية — {monthLabelOf(selectedMonth)}</Text>

        {prevBudget && !hasCurrentEntries && (
          <Button title={`📋 نسخ ميزانية ${monthLabelOf(prevMonthKey(selectedMonth))}`} small onPress={copyPrev} style={{ marginBottom: 10, alignSelf: 'flex-end' }} />
        )}

        <View style={styles.totalRow}>
          <View style={{ flex: 1 }}>
            <TextField label="المبلغ (د.ل)" value={totalInput} onChangeText={setTotalInput} keyboardType="decimal-pad" placeholder="مثال: 3000" />
          </View>
        </View>

        <Text style={[styles.subTitle, { color: theme.text2 }]}>حدود الفئات</Text>
        <View style={styles.catGrid}>
          {categories.map((c) => (
            <View key={c.id} style={styles.catField}>
              <TextField
                label={`${c.icon} ${c.name}`}
                value={catInputs[c.name] || ''}
                onChangeText={(v) => setCatInputs((prev) => ({ ...prev, [c.name]: v }))}
                keyboardType="decimal-pad"
                placeholder="حد الإنفاق"
              />
            </View>
          ))}
        </View>

        <Button title="💾 حفظ" variant="primary" onPress={save} loading={saving} style={{ marginTop: 14 }} />
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text2 }]}>تقدم الإنفاق</Text>
        {progressItems.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ color: theme.text3 }}>حدّد ميزانية أو أضف مصروفات لهذا الشهر</Text>
          </View>
        ) : (
          progressItems.map((i) => {
            const pct = i.limit > 0 ? Math.min(100, (i.spent / i.limit) * 100) : 0;
            const color = pct >= 100 ? theme.danger : pct >= 80 ? theme.warning : theme.success;
            const rem = i.limit - i.spent;
            return (
              <Card key={i.cat} style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={{ color: theme.text3, fontSize: 12 }}>{fmt(i.spent)}{i.limit > 0 ? ' / ' + fmt(i.limit) : ''} د.ل</Text>
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{i.icon} {i.cat}</Text>
                </View>
                <View style={[styles.track, { backgroundColor: theme.surface2 }]}>
                  <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                {i.limit > 0 && (
                  <Text style={{ color: rem < 0 ? theme.danger : theme.success, fontSize: 11, fontWeight: '600', textAlign: 'left', marginTop: 6 }}>
                    {rem < 0 ? 'تجاوز ' + fmt(Math.abs(rem)) : 'متبقي ' + fmt(rem)} د.ل
                  </Text>
                )}
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { margin: 14 },
  title: { fontSize: 13, fontWeight: '600', marginBottom: 10, textAlign: 'right' },
  subTitle: { fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 10, textAlign: 'right' },
  totalRow: { flexDirection: 'row' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catField: { width: '47%' },
  section: { paddingHorizontal: 14, gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textAlign: 'right', marginBottom: 4 },
  empty: { alignItems: 'center', paddingVertical: 30 },
  progressCard: { marginBottom: 0 },
  progressHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8 },
  track: { height: 7, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
