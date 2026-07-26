import type { Expense } from '../api/types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Add: { editing?: Expense } | undefined;
  Budget: undefined;
  Balance: undefined;
  Reports: undefined;
  Settings: undefined;
};
