import React, { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/theme';
import { EMOJIS } from '../utils/constants';
import { TextField } from './TextField';
import { Button } from './Button';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, icon: string) => Promise<void>;
}

export function CategoryModal({ visible, onClose, onSave }: CategoryModalProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('❓');
  const [saving, setSaving] = useState(false);

  const reset = () => { setName(''); setEmoji('❓'); };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('تنبيه', 'يرجى إدخال اسم الفئة'); return; }
    setSaving(true);
    try {
      await onSave(name.trim(), emoji);
      reset();
    } catch (e: any) {
      Alert.alert('خطأ', e?.message || 'تعذر حفظ الفئة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>إضافة فئة جديدة</Text>
          <TextField label="اسم الفئة" value={name} onChangeText={setName} placeholder="مثال: قهوة" />

          <View style={styles.previewRow}>
            <Text style={{ fontSize: 12, color: theme.text3 }}>اختر من القائمة</Text>
            <Text style={{ fontSize: 32 }}>{emoji}</Text>
          </View>

          <View style={[styles.emojiGrid, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <FlatList
              data={EMOJIS}
              numColumns={6}
              keyExtractor={(item, i) => item + i}
              style={{ maxHeight: 180 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setEmoji(item)}
                  style={[styles.emojiOpt, item === emoji && { borderColor: theme.accent, backgroundColor: theme.accentBg }]}
                >
                  <Text style={{ fontSize: 22 }}>{item}</Text>
                </Pressable>
              )}
            />
          </View>

          <View style={styles.btnRow}>
            <Button title="حفظ الفئة" variant="primary" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
            <Button title="إلغاء" onPress={() => { reset(); onClose(); }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 12 },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'right' },
  previewRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  emojiGrid: { borderWidth: 1, borderRadius: 10, padding: 8 },
  emojiOpt: { width: '16.66%', alignItems: 'center', paddingVertical: 6, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  btnRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 6 },
});
