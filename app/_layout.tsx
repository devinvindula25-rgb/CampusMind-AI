/**
 * CampusMind AI - Root Layout
 * Wraps the app with providers, adds sidebar navigation and floating AI button.
 * Theme is driven by SettingsContext (not just system preference).
 */

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, LogBox, Platform as RNPlatform } from 'react-native';

// Suppress unhandled promise rejections from expo-keep-awake in development
LogBox.ignoreLogs(['Unable to activate keep awake', 'Uncaught (in promise']);
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import 'react-native-reanimated';

import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import AIFloatingButton from '@/components/AIFloatingButton';
import { BrandColors } from '@/constants/theme';

const CampusMindLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00B4D8',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1A1A2E',
    border: '#E2E8F0',
  },
};

const CampusMindDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#48CAE4',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    border: '#334155',
  },
};

// Inner component that reads from SettingsContext (must be inside SettingsProvider)
function AppInner() {
  const { resolvedTheme } = useSettings();
  const { user, loading } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const isDark = resolvedTheme === 'dark';
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = segments[0] === 'login' || segments[0] === 'register';

    if (!user && !isPublicRoute) {
      // Redirect unauthenticated users to login, regardless of where they are
      router.replace('/login');
    } else if (user && isPublicRoute) {
      // Redirect authenticated users from login/register back to dashboard
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  const segs = segments as unknown as string[];
  const hideOverlays = segs.includes('email-draft') || segs.includes('modal') || segs.includes('login') || segs.includes('register');

  return (
    <ThemeProvider value={isDark ? CampusMindDarkTheme : CampusMindLightTheme}>
      <View style={[styles.rootContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="login"
              options={{ headerShown: false, presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="register"
              options={{ headerShown: false, presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="settings"
              options={{ headerShown: false, presentation: 'modal' }}
            />

            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="email-draft" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>

          {!hideOverlays && (
            <>
              {/* Floating Sidebar Toggle Button */}
              <TouchableOpacity
                style={[styles.sidebarToggle, isDark && styles.sidebarToggleDark]}
                onPress={() => setSidebarVisible(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="menu" size={22} color="#fff" />
              </TouchableOpacity>

              {/* Floating AI Assistant Button */}
              <AIFloatingButton />
            </>
          )}

          {/* Sidebar Drawer */}
          <Sidebar
            visible={sidebarVisible}
            onClose={() => setSidebarVisible(false)}
          />
        </View>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
  );
}

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...MaterialIcons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <AppInner />
      </SettingsProvider>
    </AuthProvider>
  );
}



const styles = StyleSheet.create({
  rootContainer: { flex: 1 },
  sidebarToggle: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    ...(RNPlatform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 }),
  },
  sidebarToggleDark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
