import { useColorScheme } from 'react-native';

export interface Theme {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  borderStrong: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  accentBg: string;
  danger: string;
  dangerBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
}

const light: Theme = {
  bg: '#f5f4f0', surface: '#ffffff', surface2: '#f9f8f5',
  border: 'rgba(0,0,0,0.09)', borderStrong: 'rgba(0,0,0,0.18)',
  text: '#0f0f0e', text2: '#52514e', text3: '#898781',
  accent: '#1a6ef5', accentBg: '#e8f0fe',
  danger: '#d03b3b', dangerBg: '#fdf0f0',
  success: '#0f7d4b', successBg: '#e8f7ef',
  warning: '#b55e00', warningBg: '#fff4e6',
};

const dark: Theme = {
  bg: '#111110', surface: '#1c1c1a', surface2: '#242422',
  border: 'rgba(255,255,255,0.08)', borderStrong: 'rgba(255,255,255,0.18)',
  text: '#f0efe8', text2: '#c3c2b7', text3: '#898781',
  accent: '#4d8ef7', accentBg: '#162040',
  danger: '#e66767', dangerBg: '#2a1212',
  success: '#34c27a', successBg: '#0d2a1c',
  warning: '#f5a623', warningBg: '#2a1e08',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
