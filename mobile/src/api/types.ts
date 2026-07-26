export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  bg: string;
  position: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  pay: string;
  note?: string | null;
}

export type BudgetMap = Record<string, number>; // 'total' or category name -> limit

export interface BalanceInput {
  salaryCash: number;
  salaryBank: number;
  prevCash: number;
  prevBank: number;
}

export interface ExportedData {
  expenses: Expense[];
  categories: { name: string; icon: string; bg: string }[];
  budgets: Record<string, BudgetMap>;
  balances: Record<string, BalanceInput>;
  exported: string;
}
