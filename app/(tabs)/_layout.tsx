/**
 * CampusMind AI - Tab Layout
 * Floating, glassmorphic bottom tab navigation.
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Shadows } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const { settings, resolvedTheme } = useSettings();
  const isDark = resolvedTheme === 'dark';
  const isInst = settings.activeWorkspace === 'institutional';
  const isDir = settings.activeWorkspace === 'directory';
  const isPers = settings.activeWorkspace === 'personal';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BrandColors.accent,
        tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
        tabBarBackground: () => (
          <BlurView 
            tint={isDark ? 'dark' : 'light'} 
            intensity={80} 
            style={StyleSheet.absoluteFill} 
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          borderRadius: 32,
          height: 64,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          ...Shadows.lg,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        }
      }}
    >
      {/* --- Personal Tabs --- */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          href: isPers ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="dashboard" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          href: isPers ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="event-note" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="research"
        options={{
          title: 'Research',
          href: isPers ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="science" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: 'Meetings',
          href: isPers ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="groups" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="burnout"
        options={{
          title: 'Well-being',
          href: isPers ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="favorite" size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* --- Institutional Tabs --- */}
      <Tabs.Screen
        name="institutional/index"
        options={{
          title: 'Dashboard',
          href: isInst ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="business" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="institutional/accreditation"
        options={{
          title: 'Accreditation',
          href: isInst ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="verified" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="institutional/curriculum"
        options={{
          title: 'Curriculum',
          href: isInst ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="menu-book" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="institutional/audits"
        options={{
          title: 'Audits',
          href: isInst ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="fact-check" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="institutional/reports"
        options={{
          title: 'Reports',
          href: isInst ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="description" size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* Hidden tabs (Personal) */}
      <Tabs.Screen name="ai-assistant" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="programmes" options={{ href: null }} />
      <Tabs.Screen name="compliance" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="teaching" options={{ href: null }} />
      <Tabs.Screen name="committees" options={{ href: null }} />
      <Tabs.Screen name="supervision" options={{ href: null }} />

      {/* Hidden tabs (Institutional) */}
      <Tabs.Screen
        name="institutional/documents"
        options={{
          title: 'QA Docs',
          href: null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="folder" size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* --- Directory Tabs --- */}
      <Tabs.Screen
        name="directory/index"
        options={{
          title: 'Search',
          href: isDir ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="search" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="directory/departments"
        options={{
          title: 'Departments',
          href: isDir ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="account-balance" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="directory/publications"
        options={{
          title: 'Publications',
          href: isDir ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <MaterialIcons name="article" size={24} color={color} />
            </View>
          ),
        }}
      />

      {/* Hidden tabs (Directory) */}
      <Tabs.Screen name="directory/faculty/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconBg: {
    backgroundColor: BrandColors.accent + '20',
    borderRadius: 20,
    padding: 6,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
