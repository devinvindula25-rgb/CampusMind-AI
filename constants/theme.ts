/**
 * CampusMind AI - Design System
 * Comprehensive theme tokens for the application.
 */

import { Platform } from 'react-native';

// ─── Brand Colors ────────────────────────────────────────────
export const BrandColors = {
  // Primary palette - Deep Academic Blue
  primary: '#1B2A4A',
  primaryLight: '#2D4A7A',
  primaryDark: '#0F1B33',

  // Accent - Vibrant Teal
  accent: '#00B4D8',
  accentLight: '#48CAE4',
  accentDark: '#0096B7',

  // Secondary - Rich Indigo
  secondary: '#6C63FF',
  secondaryLight: '#8B83FF',
  secondaryDark: '#4A42DB',

  // Success / Warning / Error / Info
  success: '#10B981',
  successLight: '#34D399',
  successBg: 'rgba(16, 185, 129, 0.12)',

  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningBg: 'rgba(245, 158, 11, 0.12)',

  error: '#EF4444',
  errorLight: '#F87171',
  errorBg: 'rgba(239, 68, 68, 0.12)',

  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoBg: 'rgba(59, 130, 246, 0.12)',
};

// ─── Theme Colors ────────────────────────────────────────────
export const Colors = {
  light: {
    text: '#1A1A2E',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    tint: BrandColors.accent,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: BrandColors.accent,
    cardShadow: 'rgba(0, 0, 0, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Gradient pairs
    gradientPrimary: ['#1B2A4A', '#2D4A7A'],
    gradientAccent: ['#00B4D8', '#48CAE4'],
    gradientCard: ['#FFFFFF', '#F8FAFC'],
    gradientDashboard: ['#1B2A4A', '#0F1B33'],
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#263548',
    border: '#334155',
    borderLight: '#1E293B',
    tint: BrandColors.accentLight,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: BrandColors.accentLight,
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',

    gradientPrimary: ['#0F172A', '#1E293B'],
    gradientAccent: ['#0096B7', '#00B4D8'],
    gradientCard: ['#1E293B', '#263548'],
    gradientDashboard: ['#0F172A', '#1E293B'],
  },
};

// ─── Typography ──────────────────────────────────────────────
export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ─── Spacing ─────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// ─── Border Radius ───────────────────────────────────────────
export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

// ─── Shadows ─────────────────────────────────────────────────
export const Shadows = {
  sm: Platform.select({
    web: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' } as any,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    }
  }),
  md: Platform.select({
    web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)' } as any,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    }
  }),
  lg: Platform.select({
    web: { boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)' } as any,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    }
  }),
  xl: Platform.select({
    web: { boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.16)' } as any,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 10,
    }
  }),
};

// ─── Fonts ───────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    mono: 'monospace',
  },
});

// ─── Icon Names ──────────────────────────────────────────────
// Maps semantic icon names to platform-specific icon names
export const IconNames = {
  dashboard: 'grid-view',
  programmes: 'school',
  compliance: 'verified',
  research: 'science',
  ai: 'smart-toy',
  reports: 'description',
  workload: 'analytics',
  notifications: 'notifications',
  settings: 'settings',
  profile: 'person',
  logout: 'logout',
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  search: 'search',
  filter: 'filter-list',
  chevronRight: 'chevron-right',
  chevronLeft: 'chevron-left',
  close: 'close',
  check: 'check-circle',
  warning: 'warning',
  info: 'info',
  send: 'send',
  attachment: 'attach-file',
  calendar: 'event',
  clock: 'schedule',
  star: 'star',
  menu: 'menu',
};

// ─── User Roles ──────────────────────────────────────────────
export const UserRoles = {
  TEACHING_ASSISTANT: 'teaching_assistant',
  ASSISTANT_LECTURER: 'assistant_lecturer',
  LECTURER: 'lecturer',
  SENIOR_LECTURER: 'senior_lecturer',
  ASSOCIATE_PROFESSOR: 'associate_professor',
  PROFESSOR: 'professor',
  SENIOR_PROFESSOR: 'senior_professor',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const RoleLabels: Record<UserRole, string> = {
  [UserRoles.TEACHING_ASSISTANT]: 'Teaching Assistant / Demonstrator',
  [UserRoles.ASSISTANT_LECTURER]: 'Assistant Lecturer',
  [UserRoles.LECTURER]: 'Lecturer',
  [UserRoles.SENIOR_LECTURER]: 'Senior Lecturer',
  [UserRoles.ASSOCIATE_PROFESSOR]: 'Associate Professor',
  [UserRoles.PROFESSOR]: 'Professor',
  [UserRoles.SENIOR_PROFESSOR]: 'Senior Professor / Emeritus',
};
