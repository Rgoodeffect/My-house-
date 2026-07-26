import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '../context/CategoriesContext';
import { useTheme } from '../theme/theme';
import { Expense } from '../api/types';
import { fmt, fmtDate } from '../utils/format';

interface ExpenseListItemProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseListItem({ expense, onEdit, onDelete }: ExpenseListItemProps) {
  const theme = useTheme();
  const { getCategory } = useCategories();
  const cat = getCategory(expense.category);

  const meta = [expense.category, fmtDate(expense.date), expense.pay || 'نقداً', expense.note].filter(Boolean).join(' · ');

  return (
    <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.dot, { backgroundColor: cat.bg }]}>
        <Text style={{ fontSize: 19 }}>{cat.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>{expense.name}</Text>
        <Text numberOfLines={1} style={[styles.meta, { color: theme.text3 }]}>{meta}</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.amountRow}>
          <Text style={[styles.amount, { color: theme.text }]}>{fmt(expense.amount)}</Text>
          <Text style={[styles.unit, { color: theme.text3 }]}> د.ل</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={onEdit} style={[styles.actionBtn, { borderColor: theme.borderStrong }]}>
            <Ionicons name="pencil" size={14} color={theme.text} />
          </Pressable>
          <Pressable onPress={onDelete} style={[styles.actionBtn, { borderColor: theme.danger }]}>
            <Ionicons name="trash" size={14} color={theme.danger} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 16, padding: 12 },
  dot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, alignItems: 'flex-end' },
  name: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 3 },
  right: { alignItems: 'flex-end', gap: 6 },
  amountRow: { flexDirection: 'row' },
  amount: { fontSize: 15, fontWeight: '700' },
  unit: { fontSize: 10 },
  actions: { flexDirection: 'row-reverse', gap: 6 },
  actionBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
