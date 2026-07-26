import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { shiftMonthKey, thisMonthKey } from '../utils/format';

interface MonthContextValue {
  selectedMonth: string;
  isCurrentMonth: boolean;
  shiftMonth: (delta: number) => void;
  goToCurrentMonth: () => void;
}

const MonthContext = createContext<MonthContextValue | null>(null);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState(thisMonthKey());

  const shiftMonth = useCallback((delta: number) => {
    setSelectedMonth((cur) => shiftMonthKey(cur, delta));
  }, []);

  const goToCurrentMonth = useCallback(() => setSelectedMonth(thisMonthKey()), []);

  const value = useMemo(
    () => ({ selectedMonth, isCurrentMonth: selectedMonth === thisMonthKey(), shiftMonth, goToCurrentMonth }),
    [selectedMonth, shiftMonth, goToCurrentMonth]
  );

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
}

export function useMonth(): MonthContextValue {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error('useMonth must be used within MonthProvider');
  return ctx;
}
