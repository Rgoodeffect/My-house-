import { api } from './client';
import { BalanceInput, BudgetMap, Category, Expense, ExportedData, User } from './types';

export const AuthApi = {
  register: (email: string, password: string, name: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  me: () => api.get<{ user: User }>('/auth/me'),
};

export const CategoriesApi = {
  list: () => api.get<{ categories: Category[] }>('/categories'),
  create: (name: string, icon: string) => api.post<{ category: Category }>('/categories', { name, icon }),
  remove: (id: string) => api.delete<{ ok: true }>(`/categories/${id}`),
};

export const ExpensesApi = {
  listByMonth: (month: string) => api.get<{ expenses: Expense[] }>(`/expenses?month=${month}`),
  listByRange: (from: string, to: string) => api.get<{ expenses: Expense[] }>(`/expenses?from=${from}&to=${to}`),
  create: (data: Omit<Expense, 'id'>) => api.post<{ expense: Expense }>('/expenses', data),
  update: (id: string, data: Partial<Omit<Expense, 'id'>>) => api.put<{ expense: Expense }>(`/expenses/${id}`, data),
  remove: (id: string) => api.delete<{ ok: true }>(`/expenses/${id}`),
};

export const BudgetsApi = {
  get: (month: string) => api.get<{ month: string; budget: BudgetMap }>(`/budgets?month=${month}`),
  save: (month: string, entries: BudgetMap) => api.put<{ month: string; budget: BudgetMap }>('/budgets', { month, entries }),
};

export const BalancesApi = {
  get: (month: string) => api.get<{ month: string; balance: BalanceInput }>(`/balances?month=${month}`),
  save: (month: string, data: BalanceInput) => api.put<{ month: string; balance: BalanceInput }>('/balances', { month, ...data }),
};

export const DataApi = {
  export: () => api.get<ExportedData>('/data/export'),
  import: (data: ExportedData) => api.post<{ ok: true }>('/data/import', data),
  clear: () => api.post<{ ok: true }>('/data/clear'),
};
