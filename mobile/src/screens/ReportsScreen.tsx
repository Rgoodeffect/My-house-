import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { DateField } from '../components/DateField';
import { Button } from '../components/Button';
import { useMonth } from '../context/MonthContext';
import { useCategories } from '../context/CategoriesContext';
import { useTheme } from '../theme/theme';
import { BudgetsApi, ExpensesApi } from '../api/endpoints';
import { Expense } from '../api/types';
import { fmt, monthLabelOf, todayISODate } from '../utils/format';
import { SERIES_COLORS } from '../utils/constants';

type ReportMode = 'month' | 'range';

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function ReportsScreen() {
  const theme = useTheme();
  const { selectedMonth } = useMonth();
  const { categories } = useCategories();

  const [mode, setMode] = useState<ReportMode>('month');
  const [rangeFrom, setRangeFrom] = useState(daysAgoISO(29));
  const [rangeTo, setRangeTo] = useState(todayISODate());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetTotal, setBudgetTotal] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === 'range') {
        const { expenses: list } = await ExpensesApi.listByRange(rangeFrom, rangeTo);
        setExpenses(list);
      } else {
        const [{ expenses: list }, { budget }] = await Promise.all([
          ExpensesApi.listByMonth(selectedMonth),
          BudgetsApi.get(selectedMonth),
        ]);
        setExpenses(list);
        setBudgetTotal(budget);
      }
    } catch {
      Alert.alert('خطأ', 'تعذر تحميل التقرير');
    } finally {
      setLoading(false);
    }
  }, [mode, rangeFrom, rangeTo, selectedMonth]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const scopeRange = useMemo(() => {
    if (mode === 'range') return { start: new Date(rangeFrom), end: new Date(rangeTo) };
    const [y, m] = selectedMonth.split('-').map(Number);
    const isCurrent = selectedMonth === todayISODate().slice(0, 7);
    return { start: new Date(y, m - 1, 1), end: isCurrent ? new Date() : new Date(y, m, 0) };
  }, [mode, rangeFrom, rangeTo, selectedMonth]);

  const total = expenses.reduce((a, e) => a + e.amount, 0);
  const bycat: Record<string, number> = {};
  expenses.forEach((e) => { bycat[e.category] = (bycat[e.category] || 0) + e.amount; });
  const topCat = Object.entries(bycat).sort((a, b) => b[1] - a[1])[0];
  const daysCount = Math.max(1, Math.round((scopeRange.end.getTime() - scopeRange.start.getTime()) / 86400000) + 1);
  const avgDay = expenses.length ? total / daysCount : 0;
  const maxExp = expenses.length ? Math.max(...expenses.map((e) => e.amount)) : 0;

  const catNames = Object.keys(bycat);
  const pieData = catNames.map((name, i) => ({
    name,
    population: bycat[name],
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    legendFontColor: theme.text2,
    legendFontSize: 12,
  }));

  const series = useMemo(() => {
    const { start, end } = scopeRange;
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    const points: { label: string; sum: number }[] = [];
    if (totalDays > 31) {
      const bucketSize = Math.ceil(totalDays / 15);
      let cur = new Date(start);
      while (cur <= end) {
        const bucketEnd = new Date(cur);
        bucketEnd.setDate(bucketEnd.getDate() + bucketSize - 1);
        const be = bucketEnd > end ? end : bucketEnd;
        const fromKey = cur.toISOString().split('T')[0];
        const toKey = be.toISOString().split('T')[0];
        const sum = expenses.filter((e) => e.date >= fromKey && e.date <= toKey).reduce((a, e) => a + e.amount, 0);
        points.push({ label: cur.getDate() + '/' + (cur.getMonth() + 1), sum });
        cur = new Date(be);
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      let cur = new Date(start);
      while (cur <= end) {
        const key = cur.toISOString().split('T')[0];
        const sum = expenses.filter((e) => e.date === key).reduce((a, e) => a + e.amount, 0);
        points.push({ label: cur.getDate() + '/' + (cur.getMonth() + 1), sum });
        cur.setDate(cur.getDate() + 1);
      }
    }
    return points;
  }, [scopeRange, expenses]);

  const remItems = categories
    .map((c) => ({ cat: c.name, icon: c.icon, spent: bycat[c.name] || 0, limit: budgetTotal[c.name] || 0 }))
    .filter((i) => i.limit > 0);

  const top5 = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const chartWidth = Dimensions.get('window').width - 28 - 28;

  const chartConfig = {
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    color: () => theme.accent,
    labelColor: () => theme.text3,
    decimalPlaces: 0,
    barPercentage: 0.6,
    propsForLabels: { fontSize: 9 },
  };

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View style={styles.wrap}>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, { borderColor: theme.borderStrong }, mode === 'month' && { backgroundColor: theme.accent, borderColor: theme.accent }]}
            onPress={() => setMode('month')}
          >
            <Text style={{ color: mode === 'month' ? '#fff' : theme.text2, fontWeight: '600', fontSize: 12 }}>📅 شهري</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, { borderColor: theme.borderStrong }, mode === 'range' && { backgroundColor: theme.accent, borderColor: theme.accent }]}
            onPress={() => setMode('range')}
          >
            <Text style={{ color: mode === 'range' ? '#fff' : theme.text2, fontWeight: '600', fontSize: 12 }}>🗓️ فترة محددة</Text>
          </Pressable>
        </View>

        {mode === 'range' && (
          <View style={styles.rangeRow}>
            <View style={{ flex: 1 }}><DateField value={rangeFrom} onChange={setRangeFrom} /></View>
            <Text style={{ color: theme.text3 }}>إلى</Text>
            <View style={{ flex: 1 }}><DateField value={rangeTo} onChange={setRangeTo} /></View>
            <Button title="تطبيق" small variant="primary" onPress={load} />
          </View>
        )}

        <View style={styles.kpiGrid}>
          {[
            ['الإجمالي', fmt(total) + ' د.ل'],
            ['أعلى فئة', topCat ? topCat[0] : '—'],
            ['متوسط يومي', fmt(avgDay) + ' د.ل'],
            ['أعلى مصروف', fmt(maxExp) + ' د.ل'],
          ].map(([label, value]) => (
            <Card key={label} style={styles.kpiCard}>
              <Text style={{ color: theme.text3, fontSize: 11, textAlign: 'right' }}>{label}</Text>
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', textAlign: 'right', marginTop: 4 }}>{value}</Text>
            </Card>
          ))}
        </View>

        <Card>
          <Text style={[styles.chartTitle, { color: theme.text2 }]}>توزيع الإنفاق حسب الفئة</Text>
          {pieData.length ? (
            <PieChart
              data={pieData}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              hasLegend
            />
          ) : (
            <Text style={{ color: theme.text3, textAlign: 'center', paddingVertical: 20 }}>لا توجد بيانات</Text>
          )}
        </Card>

        <Card>
          <Text style={[styles.chartTitle, { color: theme.text2 }]}>
            {mode === 'range' ? 'اتجاه الإنفاق خلال الفترة المحددة' : 'الإنفاق اليومي — ' + monthLabelOf(selectedMonth)}
          </Text>
          {series.length ? (
            <BarChart
              data={{ labels: series.map((d) => d.label), datasets: [{ data: series.map((d) => d.sum) }] }}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              fromZero
              withInnerLines={false}
              showValuesOnTopOfBars={false}
              yAxisLabel=""
              yAxisSuffix=""
            />
          ) : (
            <Text style={{ color: theme.text3, textAlign: 'center', paddingVertical: 20 }}>لا توجد بيانات</Text>
          )}
        </Card>

        {mode === 'month' && (
          <Card>
            <Text style={[styles.chartTitle, { color: theme.text2 }]}>المتبقي حسب الفئة</Text>
            {remItems.length === 0 ? (
              <Text style={{ color: theme.text3 }}>لم تحدد ميزانية لأي فئة هذا الشهر</Text>
            ) : (
              remItems.map((i) => {
                const rem = i.limit - i.spent;
                return (
                  <View key={i.cat} style={[styles.listRow, { borderColor: theme.border }]}>
                    <Text style={{ color: rem < 0 ? theme.danger : theme.success, fontWeight: '700', fontSize: 13 }}>
                      {rem < 0 ? 'تجاوز ' + fmt(Math.abs(rem)) : fmt(rem)} د.ل
                    </Text>
                    <Text style={{ color: theme.text2, fontSize: 13 }}>{i.icon} {i.cat}</Text>
                  </View>
                );
              })
            )}
          </Card>
        )}

        <Card>
          <Text style={[styles.chartTitle, { color: theme.text2 }]}>
            {mode === 'range' ? 'أعلى 5 مصروفات في الفترة المحددة' : 'أعلى 5 مصروفات — ' + monthLabelOf(selectedMonth)}
          </Text>
          {top5.length === 0 ? (
            <Text style={{ color: theme.text3 }}>لا توجد مصروفات في هذه الفترة</Text>
          ) : (
            top5.map((e, i) => (
              <View key={e.id} style={[styles.listRow, { borderColor: theme.border }]}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>{fmt(e.amount)} د.ل</Text>
                <Text style={{ color: theme.text2, fontSize: 13 }}>{i + 1}. {e.name} <Text style={{ color: theme.text3, fontSize: 11 }}>({e.category})</Text></Text>
              </View>
            ))
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 14, gap: 12 },
  toggleRow: { flexDirection: 'row', gap: 6 },
  toggleBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpiCard: { width: '47%' },
  chartTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10, textAlign: 'right' },
  listRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1 },
});
