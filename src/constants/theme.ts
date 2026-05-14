export const COLORS = {
  primary: '#E8838F',
  primaryLight: '#F2B5BC',
  primaryDark: '#C96B76',
  secondary: '#B5A3E8',
  secondaryLight: '#D4CBF2',
  fertile: '#7FB285',
  fertileLight: '#B8D9BC',
  ovulation: '#F5C842',
  background: '#FFF9F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#7A7A7A',
  textLight: '#B0B0B0',
  border: '#F0E8E4',
  error: '#E85D5D',
  white: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.06)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FONT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    hero: 48,
  },
};

export const PHASES = {
  menstrual: { label: 'Menstrual', color: COLORS.primary, emoji: '🌺' },
  follicular: { label: 'Follicular', color: COLORS.secondary, emoji: '🌱' },
  ovulation: { label: 'Ovulation', color: COLORS.fertile, emoji: '🌸' },
  luteal: { label: 'Luteal', color: COLORS.ovulation, emoji: '🍂' },
} as const;

export type Phase = keyof typeof PHASES;
