/**
 * CampusMind AI - Settings Context
 * Persists user preferences (theme, navigation mode, workspace, notifications).
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { configureScheduledNotifications } from '@/services/notificationService';
import { BrandColors as DefaultBrandColors, Typography as DefaultTypography } from '@/constants/theme';

export type NavigationMode = 'tabs' | 'sidebar';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Workspace = 'personal' | 'institutional' | 'directory';

interface Settings {
  navigationMode: NavigationMode;
  themeMode: ThemeMode;
  activeWorkspace: Workspace;
  focusModeEnabled: boolean;
  ergonomicReminders: boolean;
  reminderInterval: number; // minutes
  hydrationReminders: boolean;
  notificationsEnabled: boolean;
  deadlineReminders: boolean;
  burnoutAlerts: boolean;
  meetingReminders: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
}

interface SettingsContextType {
  settings: Settings;
  resolvedTheme: 'light' | 'dark';
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  switchWorkspace: (ws: Workspace) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  navigationMode: 'tabs',
  themeMode: 'light',
  activeWorkspace: 'personal',
  focusModeEnabled: true,
  ergonomicReminders: true,
  reminderInterval: 20,
  hydrationReminders: true,
  notificationsEnabled: true,
  deadlineReminders: true,
  burnoutAlerts: true,
  meetingReminders: true,
  fontSize: 'medium',
  highContrast: false,
};

const STORAGE_KEY = '@campusmind_settings';

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  resolvedTheme: 'light',
  updateSetting: () => {},
  switchWorkspace: () => {},
  resetSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const systemColorScheme = useColorScheme();

  // Compute the resolved theme based on settings + system preference
  const resolvedTheme: 'light' | 'dark' =
    settings.themeMode === 'system'
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : settings.themeMode;

  // Load saved settings
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    })();
  }, []);

  // Persist on change
  const persist = useCallback(async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      persist(next);
      return next;
    });
  }, [persist]);

  const switchWorkspace = useCallback((ws: Workspace) => {
    updateSetting('activeWorkspace', ws);
  }, [updateSetting]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persist(DEFAULT_SETTINGS);
  }, [persist]);

  // Configure Notifications whenever related settings change
  useEffect(() => {
    configureScheduledNotifications({
      notificationsEnabled: settings.notificationsEnabled,
      ergonomicReminders: settings.ergonomicReminders,
      hydrationReminders: settings.hydrationReminders,
      deadlineReminders: settings.deadlineReminders,
      burnoutAlerts: settings.burnoutAlerts,
      meetingReminders: settings.meetingReminders,
      reminderInterval: settings.reminderInterval,
    });
  }, [
    settings.notificationsEnabled,
    settings.ergonomicReminders,
    settings.hydrationReminders,
    settings.deadlineReminders,
    settings.burnoutAlerts,
    settings.meetingReminders,
    settings.reminderInterval
  ]);

  return (
    <SettingsContext.Provider value={{ settings, resolvedTheme, updateSetting, switchWorkspace, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Custom hook that provides dynamically scaled Typography and high-contrast BrandColors.
 */
export function useThemeEngine() {
  const { settings, resolvedTheme } = useSettings();
  const isDark = resolvedTheme === 'dark';

  const dynamicTypography = useMemo(() => {
    const scaleFactor = settings.fontSize === 'small' ? 0.85 : settings.fontSize === 'large' ? 1.2 : 1;
    return {
      ...DefaultTypography,
      sizes: {
        xs: DefaultTypography.sizes.xs * scaleFactor,
        sm: DefaultTypography.sizes.sm * scaleFactor,
        md: DefaultTypography.sizes.md * scaleFactor,
        base: DefaultTypography.sizes.base * scaleFactor,
        lg: DefaultTypography.sizes.lg * scaleFactor,
        xl: DefaultTypography.sizes.xl * scaleFactor,
        '2xl': DefaultTypography.sizes['2xl'] * scaleFactor,
        '3xl': DefaultTypography.sizes['3xl'] * scaleFactor,
        '4xl': DefaultTypography.sizes['4xl'] * scaleFactor,
        '5xl': DefaultTypography.sizes['5xl'] * scaleFactor,
      }
    };
  }, [settings.fontSize]);

  const dynamicBrandColors = useMemo(() => {
    if (settings.highContrast) {
      return {
        ...DefaultBrandColors,
        accent: isDark ? '#FFFFFF' : '#000000',
        accentDark: isDark ? '#E2E8F0' : '#1A1A1A',
        accentLight: isDark ? '#CBD5E1' : '#333333',
        secondary: isDark ? '#FFFFFF' : '#000000',
      };
    }
    return DefaultBrandColors;
  }, [settings.highContrast, isDark]);

  return { Typography: dynamicTypography, BrandColors: dynamicBrandColors, isDark };
}
