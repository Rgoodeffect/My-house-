import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Kpi } from '../components/Kpi';
import { useMonth } from '../context/MonthContext';
import { useTheme } from '../theme/theme';
import { BalancesApi, ExpensesApi } from '../api/endpoints';
import { Expense } from '../api/types';
import { fmt, monthLabelOf } from '../utils/format';

export function BalanceScreen() {
  const theme = useTheme();
  const { selectedMonth } = useMonth();

  const [salaryCash, setSalaryCash] = useState('');
  const [salaryBank, setSalaryBank] = useState('');
  const [prevCash, setPrevCash] = useState('');
  const [prevBank, setPrevBank] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ balance }, { expenses: list }] = await Promise.all([
        BalancesApi.get(selectedMonth),
        ExpensesApi.listByMonth(selectedMonth),
      ]);
      setSalaryCash(balance.salaryCash ? String(balance.salaryCash) : '');
      setSalaryBank(balance.salaryBank ? String(balance.salaryBank) : '');
      setPrevCash(balance.prevCash ? String(balance.prevCash) : '');
      setPrevBank(balance.prevBank ? String(balance.prevBank) : '');
      setExpenses(list);
    } catch {
      Alert.alert('خطأ', 'تعذر تحميل بيانات الرصيد');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    setSaving(true);
    try {
      await BalancesApi.save(selectedMonth, {
        salaryCash: parseFloat(salaryCash) || 0,
        salaryBank: parseFloat(salaryBank) || 0,
        prevCash: parseFloat(prevCash) || 0,
        prevBank: parseFloat(prevBank) || 0,
      });
      Alert.alert('تم', 'تم حفظ بيانات الرصيد لشهر ' + monthLabelOf(selectedMonth) + ' ✓');
    } catch {
      Alert.alert('خطأ', 'تعذر حفظ بيانات الرصيد');
    } finally {
      setSaving(false);
    }
  };

  const sc = parseFloat(salaryCash) || 0;
  const sb = parseFloat(salaryBank) || 0;
  const pc = parseFloat(prevCash) || 0;
  const pb = parseFloat(prevBank) || 0;
  const cashExp = expenses.filter((e) => (e.pay || 'نقداً') === 'نقداً').reduce((a, e) => a + e.amount, 0);
  const bankExp = expenses.filter((e) => (e.pay || 'نقداً') !== 'نقداً').reduce((a, e) => a + e.amount, 0);
  const remCash = sc + pc - cashExp;
  const remBank = sb + pb - bankExp;
  const total = remCash + remBank;

  const Row = ({ label, val }: { label: string; val: number }) => (
    <View style={styles.detailRow}>
      <Text style={{ color: theme.text2, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: theme.text2, fontSize: 13 }}>{fmt(val)} د.ل</Text>
    </View>
  );
  const RowStrong = ({ label, val }: { label: string; val: number }) => (
    <View style={[styles.detailRow, styles.detailStrong, { borderColor: theme.border }]}>
      <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>{label}</Text>
      <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>{fmt(val)} د.ل</Text>
    </View>
  );

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.text }]}>بداية الشهر — {monthLabelOf(selectedMonth)}</Text>
        <View style={styles.grid}>
          <View style={styles.half}><TextField label="المرتب (نقداً)" value={salaryCash} onChangeText={setSalaryCash} keyboardType="decimal-pad" placeholder="0.00" /></View>
          <View style={styles.half}><TextField label="المرتب (مصرف)" value={salaryBank} onChangeText={setSalaryBank} keyboardType="decimal-pad" placeholder="0.00" /></View>
          <View style={styles.half}><TextField label="المتبقي السابق (نقداً)" value={prevCash} onChangeText={setPrevCash} keyboardType="decimal-pad" placeholder="0.00" /></View>
          <View style={styles.half}><TextField label="المتبقي السابق (مصرف)" value={prevBank} onChangeText={setPrevBank} keyboardType="decimal-pad" placeholder="0.00" /></View>
        </View>
        <Button title="💾 حفظ" variant="primary" onPress={save} loading={saving} style={{ marginTop: 14 }} />
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text2 }]}>الوضع الحالي</Text>
        <View style={styles.kpiRow}>
          <Kpi label="المتبقي نقداً" value={fmt(remCash)} unit="دينار ليبي" tone={remCash < 0 ? 'danger' : 'default'} />
          <Kpi label="المتبقي في المصرف" value={fmt(remBank)} unit="دينار ليبي" tone={remBank < 0 ? 'danger' : 'default'} />
        </View>
        <Kpi label="الإجمالي الكلي" value={fmt(total)} unit="دينار ليبي" valueSize={24} tone={total < 0 ? 'danger' : 'success'} />

        <Card style={{ marginTop: 12 }}>
          <Text style={[styles.subTitle, { color: theme.text2 }]}>تفاصيل الحساب</Text>
          <Row label="المرتب (نقداً)" val={sc} />
          <Row label="+ المتبقي من الفترة السابقة (نقداً)" val={pc} />
          <Row label="− مصروفات نقدية هذا الشهر" val={cashExp} />
          <RowStrong label="= المتبقي نقداً" val={remCash} />
          <View style={{ height: 10 }} />
          <Row label="المرتب (مصرف)" val={sb} />
          <Row label="+ المتبقي من الفترة السابقة (مصرف)" val={pb} />
          <Row label="− مصروفات عبر البطاقة/التحويل هذا الشهر" val={bankExp} />
          <RowStrong label="= المتبقي في المصرف" val={remBank} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { margin: 14 },
  title: { fontSize: 13, fontWeight: '600', marginBottom: 10, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  half: { width: '47%' },
  section: { paddingHorizontal: 14, gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textAlign: 'right', marginBottom: 4 },
  kpiRow: { flexDirection: 'row', gap: 8 },
  subTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'right' },
  detailRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 3 },
  detailStrong: { borderTopWidth: 1, marginTop: 4, paddingTop: 6 },
});
