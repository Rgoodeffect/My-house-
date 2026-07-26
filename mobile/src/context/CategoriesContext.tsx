import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CategoriesApi } from '../api/endpoints';
import { Category } from '../api/types';
import { useAuth } from './AuthContext';

interface CategoriesContextValue {
  categories: Category[];
  loading: boolean;
  refresh: () => Promise<void>;
  getCategory: (name: string) => Category | { icon: string; bg: string; name: string };
  addCategory: (name: string, icon: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

const FALLBACK = { icon: '📦', bg: '#eaf3de', name: '' };

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { categories: list } = await CategoriesApi.list();
      setCategories(list);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) refresh();
    else setCategories([]);
  }, [user, refresh]);

  const getCategory = useCallback(
    (name: string) => categories.find((c) => c.name === name) || { ...FALLBACK, name },
    [categories]
  );

  const addCategory = useCallback(async (name: string, icon: string) => {
    await CategoriesApi.create(name, icon);
    await refresh();
  }, [refresh]);

  const removeCategory = useCallback(async (id: string) => {
    await CategoriesApi.remove(id);
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ categories, loading, refresh, getCategory, addCategory, removeCategory }),
    [categories, loading, refresh, getCategory, addCategory, removeCategory]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategories must be used within CategoriesProvider');
  return ctx;
}
