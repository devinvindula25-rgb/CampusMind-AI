/**
 * CampusMind AI - Sidebar Navigation Panel
 * Accessible drawer with workspace switcher, navigation, and settings.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings, Workspace, useThemeEngine } from '@/contexts/SettingsContext';
import { BorderRadius, Spacing, RoleLabels } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const PERSONAL_NAV = [
  { label: 'Dashboard', icon: 'dashboard' as const, route: '/(tabs)' },
  { label: 'Planner', icon: 'event-note' as const, route: '/(tabs)/planner' },
  { label: 'AI Assistant', icon: 'smart-toy' as const, route: '/(tabs)/ai-assistant' },
  { label: 'Research Tracker', icon: 'science' as const, route: '/(tabs)/research' },
  { label: 'Teaching', icon: 'menu-book' as const, route: '/(tabs)/teaching' },
  { label: 'Committees', icon: 'groups-3' as const, route: '/(tabs)/committees' },
  { label: 'Supervision', icon: 'school' as const, route: '/(tabs)/supervision' },
  { label: 'Well-being', icon: 'favorite' as const, route: '/(tabs)/burnout' },
  { label: 'Meetings', icon: 'groups' as const, route: '/(tabs)/meetings' },
];

const INSTITUTIONAL_NAV = [
  { label: 'Dashboard', icon: 'dashboard' as const, route: '/(tabs)/institutional' },
  { label: 'Accreditation', icon: 'verified' as const, route: '/(tabs)/institutional/accreditation' },
  { label: 'Curriculum Reviews', icon: 'menu-book' as const, route: '/(tabs)/institutional/curriculum' },
  { label: 'Academic Audits', icon: 'fact-check' as const, route: '/(tabs)/institutional/audits' },
  { label: 'Compliance Reports', icon: 'description' as const, route: '/(tabs)/institutional/reports' },
  { label: 'QA Documents', icon: 'folder' as const, route: '/(tabs)/institutional/documents' },
];

const DIRECTORY_NAV = [
  { label: 'Directory Search', icon: 'search' as const, route: '/(tabs)/directory' },
  { label: 'Departments', icon: 'account-balance' as const, route: '/(tabs)/directory/departments' },
  { label: 'Publications', icon: 'article' as const, route: '/(tabs)/directory/publications' },
];

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const { userProfile, signOut } = useAuth();
  const { settings, updateSetting, switchWorkspace, resolvedTheme } = useSettings();
  const { BrandColors, Typography, isDark } = useThemeEngine();

  if (!visible) return null;

  const currentNav = settings.activeWorkspace === 'personal' ? PERSONAL_NAV 
    : settings.activeWorkspace === 'institutional' ? INSTITUTIONAL_NAV 
    : DIRECTORY_NAV;

  const handleNavigation = (route: string) => {
    onClose();
    // Small delay so drawer animation completes
    setTimeout(() => {
      try {
        router.push(route as any);
      } catch {
        // If route doesn't exist yet, stay on current page
        console.log('Route not yet implemented:', route);
      }
    }, 150);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.backdropInner} />
      </TouchableOpacity>

      {/* Sidebar Panel */}
      <View style={[styles.sidebar, isDark && styles.sidebarDark]}>
        <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
          {/* Close Button (Always visible) */}
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Authenticated Only Content */}
          {userProfile && (
            <>
              {/* Header / Profile */}
              <LinearGradient
                colors={['#1B2A4A', '#0F172A']}
                style={styles.profileSection}
              >
                <View style={styles.profileContent}>
                  <LinearGradient
                    colors={[BrandColors.accent, BrandColors.secondary]}
                    style={styles.avatar}
                  >
                  <Text style={[styles.avatarText, { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold }]}>
                    {(userProfile.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <Text style={[styles.profileName, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold }]}>{userProfile.name || 'User'}</Text>
                <Text style={[styles.profileRole, { fontSize: Typography.sizes.sm, color: BrandColors.accentLight }]}>
                  {userProfile.role ? RoleLabels[userProfile.role] : 'Lecturer'}
                </Text>
                <Text style={[styles.profileDept, { fontSize: Typography.sizes.xs }]}>{userProfile.department || 'Computer Science'}</Text>
                </View>
              </LinearGradient>

          {/* Workspace Switcher */}
            <View style={styles.workspaceSwitcher}>
              <Text style={styles.sectionLabel}>WORKSPACE</Text>
              <View style={[styles.workspaceToggle, isDark && styles.workspaceToggleDark]}>
                <WorkspaceTab
                  label="Personal"
                  icon="person"
                  active={settings.activeWorkspace === 'personal'}
                  onPress={() => {
                    switchWorkspace('personal');
                    handleNavigation('/(tabs)');
                  }}
                  isDark={isDark}
                  BrandColors={BrandColors}
                  Typography={Typography}
                />
                <WorkspaceTab
                  label="Institutional"
                  icon="business"
                  active={settings.activeWorkspace === 'institutional'}
                  onPress={() => {
                    switchWorkspace('institutional');
                    handleNavigation('/(tabs)/institutional');
                  }}
                  isDark={isDark}
                  BrandColors={BrandColors}
                  Typography={Typography}
                />
                <WorkspaceTab
                  label="Directory"
                  icon="contacts"
                  active={settings.activeWorkspace === 'directory'}
                  onPress={() => {
                    switchWorkspace('directory');
                    handleNavigation('/(tabs)/directory');
                  }}
                  isDark={isDark}
                  BrandColors={BrandColors}
                  Typography={Typography}
                />
              </View>
            </View>

          {/* Navigation Links */}
          <View style={styles.navSection}>
            <Text style={styles.sectionLabel}>
              {settings.activeWorkspace === 'personal' ? 'PERSONAL HUB' : settings.activeWorkspace === 'institutional' ? 'QA & COMPLIANCE' : 'FACULTY NETWORK'}
            </Text>
            {currentNav.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={[styles.navItem, isDark && styles.borderDark]}
                onPress={() => handleNavigation(item.route)}
                activeOpacity={0.6}
              >
                <View style={[styles.navIconContainer, { backgroundColor: BrandColors.accent + '12' }]}>
                  <MaterialIcons name={item.icon} size={22} color={BrandColors.accent} />
                </View>
                <Text style={[styles.navLabel, { fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium }, isDark && styles.textDark]}>{item.label}</Text>
                <MaterialIcons name="chevron-right" size={20} color={isDark ? '#475569' : '#CBD5E1'} />
              </TouchableOpacity>
            ))}
          </View>
          </>
          )}

          {/* Quick Settings (Always visible) */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionLabel}>QUICK SETTINGS</Text>

            <SettingRow
              icon="brightness-6"
              label="Dark Mode"
              value={resolvedTheme === 'dark'}
              onToggle={(v) => updateSetting('themeMode', v ? 'dark' : 'light')}
              isDark={isDark}
              BrandColors={BrandColors}
              Typography={Typography}
            />
            <SettingRow
              icon="notifications"
              label="Notifications"
              value={settings.notificationsEnabled}
              onToggle={(v) => updateSetting('notificationsEnabled', v)}
              isDark={isDark}
              BrandColors={BrandColors}
              Typography={Typography}
            />
            <SettingRow
              icon="self-improvement"
              label="Ergonomic Reminders"
              value={settings.ergonomicReminders}
              onToggle={(v) => updateSetting('ergonomicReminders', v)}
              isDark={isDark}
              BrandColors={BrandColors}
              Typography={Typography}
            />
            <SettingRow
              icon="contrast"
              label="High Contrast"
              value={settings.highContrast}
              onToggle={(v) => updateSetting('highContrast', v)}
              isDark={isDark}
              BrandColors={BrandColors}
              Typography={Typography}
            />

            {/* Full Settings Link */}
            <TouchableOpacity
              style={[styles.fullSettingsButton, isDark && styles.borderDark]}
              onPress={() => handleNavigation('/settings')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="settings" size={20} color={BrandColors.accent} />
              <Text style={[styles.fullSettingsText, { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: BrandColors.accent }]}>All Settings</Text>
              <MaterialIcons name="chevron-right" size={20} color={isDark ? '#475569' : '#CBD5E1'} />
            </TouchableOpacity>
          </View>

          {/* Sign Out (Only when authenticated) */}
          {userProfile && (
            <TouchableOpacity style={[styles.signOutButton, isDark && styles.borderDark]} onPress={handleSignOut} activeOpacity={0.7}>
              <MaterialIcons name="logout" size={20} color={BrandColors.error} />
              <Text style={[styles.signOutText, { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: BrandColors.error }]}>Sign Out</Text>
            </TouchableOpacity>
          )}

          {/* App Version */}
          <Text style={[styles.versionText, { fontSize: Typography.sizes.xs }]}>CampusMind AI v1.0.0</Text>
          <View style={{ height: Spacing['2xl'] }} />
        </ScrollView>
      </View>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function WorkspaceTab({ label, icon, active, onPress, isDark, BrandColors, Typography }: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
  BrandColors: any;
  Typography: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.wsTab, active && styles.wsTabActive, isDark && active && styles.wsTabActiveDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name={icon} size={18} color={active ? BrandColors.accent : '#94A3B8'} />
      <Text style={[styles.wsTabText, { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium }, active && { color: BrandColors.accent, fontWeight: Typography.weights.bold }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SettingRow({ icon, label, value, onToggle, isDark, BrandColors, Typography }: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  isDark: boolean;
  BrandColors: any;
  Typography: any;
}) {
  return (
    <View style={[styles.settingRow, isDark && styles.borderDark]}>
      <MaterialIcons name={icon} size={20} color={isDark ? '#94A3B8' : '#64748B'} />
      <Text style={[styles.settingLabel, { fontSize: Typography.sizes.md }, isDark && styles.textDark]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: isDark ? '#475569' : '#E2E8F0', true: BrandColors.accent + '60' }}
        thumbColor={value ? BrandColors.accent : (isDark ? '#94A3B8' : '#CBD5E1')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 100,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    zIndex: 101,
    ...(Platform.OS === 'web'
      ? { boxShadow: '4px 0px 20px rgba(0, 0, 0, 0.15)' } as any
      : { shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 20 }),
  },
  sidebarDark: {
    backgroundColor: '#1E293B',
  },
  sidebarScroll: { flex: 1 },

  // Profile
  closeButtonContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: Spacing.lg,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  profileSection: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContent: { alignItems: 'center', marginTop: Spacing.sm },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  avatarText: { color: '#fff' },
  profileName: { color: '#fff', marginBottom: 2 },
  profileRole: { marginBottom: 2 },
  profileDept: { color: '#94A3B8' },

  // Workspace Switcher
  workspaceSwitcher: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 1, marginBottom: Spacing.sm,
  },
  workspaceToggle: {
    flexDirection: 'column', 
    gap: 4,
  },
  workspaceToggleDark: {
    backgroundColor: '#0F172A',
  },
  wsTab: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md, gap: Spacing.md,
  },
  wsTabActive: { backgroundColor: '#F1F5F9' },
  wsTabActiveDark: { backgroundColor: '#1E293B' },
  wsTabText: { color: '#94A3B8' },

  // Navigation
  navSection: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  navItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  navIconContainer: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  navLabel: { flex: 1, color: '#1A1A2E' },
  textDark: { color: '#F1F5F9' },
  borderDark: { borderBottomColor: '#334155' },

  // Settings
  settingsSection: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  settingLabel: { flex: 1, color: '#334155' },
  fullSettingsButton: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    gap: Spacing.md, marginTop: Spacing.sm,
  },
  fullSettingsText: { flex: 1 },

  // Sign Out
  signOutButton: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  signOutText: { },

  versionText: { textAlign: 'center', color: '#CBD5E1', marginTop: Spacing.lg },
});
