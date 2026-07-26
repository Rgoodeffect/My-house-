import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/theme';

interface ConfirmContextValue {
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('تأكيد');
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((msg: string, t = 'تأكيد') => {
    setMessage(msg);
    setTitle(t);
    setVisible(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    setVisible(false);
    resolver.current?.(result);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => close(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.text2 }]}>{message}</Text>
            <View style={styles.row}>
              <Pressable
                style={[styles.btn, { borderColor: theme.danger, backgroundColor: theme.danger }]}
                onPress={() => close(true)}
              >
                <Text style={[styles.btnText, { color: '#fff' }]}>تأكيد</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, { borderColor: theme.borderStrong }]}
                onPress={() => close(false)}
              >
                <Text style={[styles.btnText, { color: theme.text }]}>إلغاء</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): (message: string, title?: string) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  card: { borderRadius: 16, padding: 20 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 12, textAlign: 'right' },
  message: { fontSize: 14, lineHeight: 20, marginBottom: 18, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', gap: 8 },
  btn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnText: { fontWeight: '600', fontSize: 14 },
});
