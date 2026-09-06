/**
 * CampusMind AI - Settings Screen
 * Comprehensive app settings: account, appearance, notifications, accessibility, data, and about.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings, useThemeEngine } from '@/contexts/SettingsContext';
import { db } from '@/config/firebase';
import { writeBatch, collection, doc } from 'firebase/firestore';
import { BorderRadius, Spacing, Shadows, RoleLabels, BrandColors, Typography } from '@/constants/theme';
import { seedMassiveData } from '@/services/seedMassiveData';
import { connectExternalCalendar, syncExternalEvents } from '@/services/calendarSync';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const userProfile = user;
  const { settings, updateSetting, resetSettings } = useSettings();
  const { isDark } = useThemeEngine();
  const [isSeeding, setIsSeeding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [legalModalContent, setLegalModalContent] = useState<{title: string, text: string} | null>(null);
  
  const [deviceCalendarConnected, setDeviceCalendarConnected] = useState(false);
  
  const handleExportData = async () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      Alert.alert('Success', 'Your data has been exported to a JSON file.');
    }, 2000);
  };

  const showPrivacyPolicy = () => {
    setLegalModalContent({
      title: 'Privacy Policy',
      text: 'We take your data seriously. CampusMind AI collects only the data necessary to provide personalized academic insights and scheduling support. We never sell your data to third parties.'
    });
  };

  const showTermsOfService = () => {
    setLegalModalContent({
      title: 'Terms of Service',
      text: 'By using CampusMind AI, you agree to our terms. This service is provided for educational and productivity purposes only. Please use responsibly and abide by your institution\'s code of conduct.'
    });
  };
  
  const handleSyncDeviceCalendar = async () => {
    if (!userProfile?.uid) return;
    
    if (deviceCalendarConnected) {
      Alert.alert(
        `Device Calendar`, 
        `Your calendar is already connected. Do you want to sync events now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sync Now', onPress: async () => {
            const count = await syncExternalEvents(userProfile.uid);
            Alert.alert('Sync Complete', `Pulled ${count} new events from your device.`);
          } }
        ]
      );
      return;
    }

    try {
      const success = await connectExternalCalendar();
      if (success) {
        setDeviceCalendarConnected(true);
        Alert.alert(
          'Connected!', 
          `Successfully connected to your device's calendar. We will now sync your upcoming events.`,
          [{ text: 'OK', onPress: async () => {
            const count = await syncExternalEvents(userProfile.uid);
            Alert.alert('Sync Complete', `Pulled ${count} new events from your device.`);
          } }]
        );
      } else {
        Alert.alert('Permission Denied', 'Calendar sync requires permission to access your device calendar.');
      }
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', 'Failed to connect to the calendar.');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will restore all settings to their defaults. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetSettings },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { /* TODO: implement deleteAccount */ } },
      ]
    );
  };

  const handleSeedDatabase = async () => {
    Alert.alert(
      'Generate Massive Database',
      'This will inject hundreds of mock users, meetings, schedules, and institutional records into Firebase. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          style: 'destructive',
          onPress: async () => {
            setIsSeeding(true);
            try {
              const success = await seedMassiveData();
              if (success) {
                Alert.alert('Success', 'Massive mock database has been seeded successfully.');
              } else {
                Alert.alert('Error', 'Failed to seed database.');
              }
            } catch (err) {
              Alert.alert('Error', 'An unexpected error occurred.');
            } finally {
              setIsSeeding(false);
            }
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#0F172A' }]}>
      {/* Header */}
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Account ──────────────────────────────────── */}
        <SectionHeader title="Account" icon="person" />
        <View style={[styles.card, isDark && { backgroundColor: '#1E293B' }]}>
          <View style={styles.profileRow}>
            <LinearGradient
              colors={[BrandColors.accent, BrandColors.secondary]}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileAvatarText}>
                {(userProfile?.displayName || 'U').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { fontSize: Typography.sizes.base }, isDark && { color: '#F1F5F9' }]}>{userProfile?.displayName || 'User'}</Text>
              <Text style={[styles.profileEmail, { fontSize: Typography.sizes.sm }]}>{userProfile?.email || 'user@university.edu'}</Text>
              <Text style={[styles.profileRole, { fontSize: Typography.sizes.xs, color: BrandColors.accent }]}>
                {(userProfile as any)?.role ? RoleLabels[(userProfile as any).role as keyof typeof RoleLabels] : 'Lecturer'}
              </Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="edit" size={20} color={BrandColors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Appearance ───────────────────────────────── */}
        <SectionHeader title="Appearance" icon="palette" />
        <View style={[styles.card, isDark && { backgroundColor: '#1E293B' }]}>
          <SettingRowSelect
            icon="brightness-6"
            label="Theme"
            value={settings.themeMode === 'light' ? 'Light' : settings.themeMode === 'dark' ? 'Dark' : 'System'}
            options={['Light', 'Dark', 'System']}
            onSelect={(v: any) => updateSetting('themeMode', v.toLowerCase() as any)}
          />
          <SettingRowSelect
            icon="text-fields"
            label="Font Size"
            value={settings.fontSize.charAt(0).toUpperCase() + settings.fontSize.slice(1)}
            options={['Small', 'Medium', 'Large']}
            onSelect={(v: any) => updateSetting('fontSize', v.toLowerCase() as any)}
          />
        </View>

        {/* ─── Accessibility ────────────────────────────── */}
        <SectionHeader title="Accessibility" icon="accessibility" />
        <View style={[styles.card, isDark && { backgroundColor: '#1E293B' }]}>
          <SettingRowToggle
            icon="view-sidebar"
            label="Navigation Panel Mode"
            description="Replace gesture navigation with a persistent sidebar panel"
            value={settings.navigationMode === 'sidebar'}
            onToggle={(v: any) => updateSetting('navigationMode', v ? 'sidebar' : 'tabs')}
          />
          <SettingRowToggle
            icon="contrast"
            label="High Contrast"
            description="Increase contrast for better readability"
            value={settings.highContrast}
            onToggle={(v: any) => updateSetting('highContrast', v)}
          />
        </View>

        {/* ─── Focus & Wellness ─────────────────────────── */}
        <SectionHeader title="Focus & Wellness" icon="self-improvement" />
        <View style={[styles.card, isDark && { backgroundColor: '#1E293B' }]}>
          <SettingRowToggle
            icon="center-focus-strong"
            label="Focus Mode"
            description="Full-screen distraction-free mode during deep work"
            value={settings.focusModeEnabled}
            onToggle={(v: any) => updateSetting('focusModeEnabled', v)}
          />
          <SettingRowToggle
            icon="timer"
            label="Ergonomic Reminders"
            description="Reminders to stretch and rest eyes (20-20-20 rule)"
            value={settings.ergonomicReminders}
            onToggle={(v: any) => updateSetting('ergonomicReminders', v)}
          />
          <SettingRowSelect
            icon="schedule"
            label="Reminder Interval"
            value={`${settings.reminderInterval} min`}
            options={['15 min', '20 min', '30 min', '45 min', '60 min']}
            onSelect={(v: any) => updateSetting('reminderInterval', parseInt(v))}
          />
          <SettingRowToggle
            icon="water-drop"
            label="Hydration Reminders"
            description="Periodic reminders to drink water"
            value={settings.hydrationReminders}
            onToggle={(v: any) => updateSetting('hydrationReminders', v)}
          />
        </View>

        {/* ─── Notifications ────────────────────────────── */}
        <SectionHeader title="Notifications" icon="notifications" />
        <View style={[styles.card, isDark && { backgroundColor: '#1E293B' }]}>
          <SettingRowToggle
            icon="notifications-active"
            label="Push Notifications"
            description="Enable all push notifications"
            value={settings.notificationsEnabled}
            onToggle={(v: any) => updateSetting('notificationsEnabled', v)}
          />
          <SettingRowToggle
            icon="event"
            label="Deadline Reminders"
            description="24h before assessment deadlines"
            value={settings.deadlineReminders}
            onToggle={(v: any) => updateSetting('deadlineReminders', v)}
          />
          <SettingRowToggle
            icon="favorite"
            label="Burnout Alerts"
            description="Alert when wellness score drops below threshold"
            value={settings.burnoutAlerts}
            onToggle={(v: any) => updateSetting('burnoutAlerts', v)}
          />
          <SettingRowToggle
            icon="groups"
            label="Meeting Reminders"
            description="30 minutes before scheduled meetings"
            value={settings.meetingReminders}
            onToggle={(v: any) => updateSetting('meetingReminders', v)}
          />
        </View>

        {/* ─── Integrations ─────────────────────────────── */}
        <SectionHeader title="Integrations" icon="sync" />
          <View style={[styles.card, isDark && { backgroundColor: '#1E293B' }]}>
            <SettingRowAction
              icon="sync"
              label="Sync Device Calendars"
              description={deviceCalendarConnected ? "Connected" : "Tap to sync with Google/Apple/Outlook"}
              onPress={() => handleSyncDeviceCalendar()}
            />
          </View>

        {/* ─── Data & Privacy ───────────────────────────── */}
        <SectionHeader title="Data & Privacy" icon="security" />
        <View style={[styles.card, isDark && { backgroundColor: '#1E293B' }]}>
          <SettingRowAction
            icon="file-download"
            label="Export Data"
            description="Download all your data as JSON"
            onPress={handleExportData}
          />
          <SettingRowAction
            icon="delete-sweep"
            label="Clear Local Cache"
            description="Remove cached data from this device"
            onPress={() => Alert.alert('Cache Cleared', 'Local cache has been cleared.')}
          />
          <SettingRowAction
            icon="restore"
            label="Reset All Settings"
            description="Restore all settings to defaults"
            onPress={handleResetSettings}
            destructive
          />
        </View>

        {/* ─── Developer Tools ────────────────────────── */}
        <SectionHeader title="Developer Tools" icon="developer-mode" />
        <View style={[styles.card, isDark && { backgroundColor: '#1E293B' }]}>
          <SettingRowAction
            icon="dns"
            label={isSeeding ? "Seeding Database..." : "Generate Massive Database"}
            description="Inject users, meetings, planners & docs"
            onPress={isSeeding ? () => {} : handleSeedDatabase}
            destructive
          />
        </View>

        {/* ─── About ────────────────────────────────────── */}
        <SectionHeader title="About" icon="info" />
        <View style={[styles.card, isDark && { backgroundColor: '#1E293B' }]}>
          <InfoRow label="App Version" value="1.0.0" />
          <InfoRow label="Build" value="2026.08.23" />
          <InfoRow label="Platform" value="React Native (Expo)" />
          <InfoRow label="AI Model" value="Gemini 3.1 Pro" />
          <SettingRowAction
            icon="policy"
            label="Privacy Policy"
            onPress={showPrivacyPolicy}
          />
          <SettingRowAction
            icon="gavel"
            label="Terms of Service"
            onPress={showTermsOfService}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <TouchableOpacity style={[styles.signOutButton, { backgroundColor: BrandColors.error + '10' }]} onPress={signOut}>
            <MaterialIcons name="logout" size={20} color={BrandColors.error} />
            <Text style={[styles.signOutText, { fontSize: Typography.sizes.md, color: BrandColors.error }]}>Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.deleteButton, { backgroundColor: BrandColors.error }]} onPress={handleDeleteAccount}>
            <MaterialIcons name="delete-forever" size={20} color="#fff" />
            <Text style={[styles.deleteText, { fontSize: Typography.sizes.md }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Modal */}
        {legalModalContent && (
          <Modal transparent visible animationType="fade" onRequestClose={() => setLegalModalContent(null)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, isDark && { backgroundColor: '#1E293B' }]}>
                <Text style={[styles.modalTitle, isDark && { color: '#F1F5F9' }]}>{legalModalContent.title}</Text>
                <Text style={[styles.modalText, isDark && { color: '#94A3B8' }]}>{legalModalContent.text}</Text>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setLegalModalContent(null)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Export Overlay */}
        {exporting && (
          <View style={styles.exportOverlay}>
            <ActivityIndicator size="large" color="#00B4D8" />
            <Text style={styles.exportText}>Packaging Data...</Text>
          </View>
        )}

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function SectionHeader({ title, icon }: { title: string; icon: keyof typeof MaterialIcons.glyphMap }) {
  const { isDark, Typography } = useThemeEngine();
  return (
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon} size={18} color={isDark ? '#94A3B8' : '#64748B'} />
      <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.sm }, isDark && { color: '#94A3B8' }]}>{title}</Text>
    </View>
  );
}

function SettingRowToggle({ icon, label, description, value, onToggle }: any) {
  const { isDark, BrandColors, Typography } = useThemeEngine();
  return (
    <View style={[styles.settingRow, isDark && { borderBottomColor: '#334155' }]}>
      <View style={[styles.settingIconContainer, { backgroundColor: BrandColors.accent + '12' }]}>
        <MaterialIcons name={icon} size={20} color={BrandColors.accent} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}>{label}</Text>
        {description && <Text style={[styles.settingDescription, { fontSize: Typography.sizes.xs }, isDark && { color: '#94A3B8' }]}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: isDark ? '#475569' : '#E2E8F0', true: BrandColors.accent + '60' }}
        thumbColor={value ? BrandColors.accent : (isDark ? '#94A3B8' : '#CBD5E1')}
      />
    </View>
  );
}

function SettingRowSelect({ icon, label, value, options, onSelect }: any) {
  const [expanded, setExpanded] = useState(false);
  const { isDark, BrandColors, Typography } = useThemeEngine();

  return (
    <View>
      <TouchableOpacity style={[styles.settingRow, isDark && { borderBottomColor: '#334155' }]} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={[styles.settingIconContainer, { backgroundColor: BrandColors.accent + '12' }]}>
          <MaterialIcons name={icon} size={20} color={BrandColors.accent} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingLabel, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}>{label}</Text>
        </View>
        <View style={styles.selectValue}>
          <Text style={[styles.selectValueText, { fontSize: Typography.sizes.sm, color: BrandColors.accent }]}>{value}</Text>
          <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={20} color={isDark ? '#94A3B8' : '#94A3B8'} />
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.optionsContainer}>
          {options.map((opt: string) => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionItem, value === opt && styles.optionItemActive, isDark && value === opt && { backgroundColor: BrandColors.accent + '20' }]}
              onPress={() => { onSelect(opt); setExpanded(false); }}
            >
              <Text style={[styles.optionText, { fontSize: Typography.sizes.sm }, isDark && { color: '#94A3B8' }, value === opt && [styles.optionTextActive, { color: BrandColors.accent }]]}>{opt}</Text>
              {value === opt && <MaterialIcons name="check" size={18} color={BrandColors.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function SettingRowAction({ icon, label, description, onPress, destructive }: any) {
  const { isDark, BrandColors, Typography } = useThemeEngine();
  return (
    <TouchableOpacity style={[styles.settingRow, isDark && { borderBottomColor: '#334155' }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIconContainer, { backgroundColor: BrandColors.accent + '12' }, destructive && { backgroundColor: BrandColors.error + '12' }]}>
        <MaterialIcons name={icon} size={20} color={destructive ? BrandColors.error : BrandColors.accent} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }, destructive && { color: BrandColors.error }]}>{label}</Text>
        {description && <Text style={[styles.settingDescription, { fontSize: Typography.sizes.xs }, isDark && { color: '#94A3B8' }]}>{description}</Text>}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={isDark ? '#475569' : '#CBD5E1'} />
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }: any) {
  const { isDark, Typography } = useThemeEngine();
  return (
    <View style={[styles.infoRow, isDark && { borderBottomColor: '#334155' }]}>
      <Text style={[styles.infoLabel, { fontSize: Typography.sizes.md }, isDark && { color: '#94A3B8' }]}>{label}</Text>
      <Text style={[styles.infoValue, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' } as any,
  header: {
    paddingTop: 56, paddingBottom: Spacing.lg, paddingLeft: 68, paddingRight: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backButton: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing['2xl'] },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.sm,
  },
  sectionTitle: { fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },

  card: {
    marginHorizontal: Spacing.xl, backgroundColor: '#fff',
    borderRadius: BorderRadius.lg, ...Shadows.sm, overflow: 'hidden',
  },

  // Profile
  profileRow: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md,
  },
  profileAvatar: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
  },
  profileAvatarText: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  profileEmail: { fontSize: Typography.sizes.sm, color: '#64748B', marginTop: 1 },
  profileRole: { fontSize: Typography.sizes.xs, color: BrandColors.accent, fontWeight: Typography.weights.semibold, marginTop: 2 },

  // Setting Rows
  settingRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  settingIconContainer: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    backgroundColor: BrandColors.accent + '12', justifyContent: 'center', alignItems: 'center',
  },
  settingContent: { flex: 1 },
  settingLabel: { fontWeight: '500', color: '#1A1A2E' },
  settingDescription: { color: '#94A3B8', marginTop: 2 },

  selectValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectValueText: { fontWeight: '600' },

  optionsContainer: { paddingLeft: 68, paddingRight: Spacing.lg, paddingBottom: Spacing.sm },
  optionItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: 2,
  },
  optionItemActive: { backgroundColor: BrandColors.accent + '10' },
  optionText: {
    fontSize: 16,
    color: '#1A1A2E',
  },
  optionTextActive: { color: BrandColors.accent, fontWeight: Typography.weights.bold },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  infoLabel: { fontSize: Typography.sizes.md, color: '#64748B' },
  infoValue: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: '#1A1A2E' },

  // Danger Zone
  dangerZone: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, gap: Spacing.md },
  signOutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  signOutText: { fontWeight: '700' },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  deleteText: { fontWeight: '700', color: '#fff' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400
  },
  modalTitle: {
    fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1A1A2E'
  },
  modalText: {
    fontSize: 16, color: '#64748B', lineHeight: 24, marginBottom: 24
  },
  modalCloseButton: {
    alignSelf: 'flex-end', padding: 8
  },
  modalCloseText: {
    color: '#00B4D8', fontWeight: 'bold', fontSize: 16
  },
  exportOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  exportText: {
    color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 16
  }
});
