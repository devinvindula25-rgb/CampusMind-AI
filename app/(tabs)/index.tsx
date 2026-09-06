/**
 * CampusMind AI - Dashboard Screen (Academic Focus)
 * Unified view with today's schedule, burnout risk, urgent emails, and workload.
 * All buttons are functional. Theme-aware.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows, RoleLabels } from '@/constants/theme';
import { router } from 'expo-router';
import {
  subscribeSchedules,
  subscribeResearchProjects,
  subscribeWellnessLogs,
  subscribeNotifications,
  subscribeEmailDrafts,
} from '@/services/firestore';
import { seedNewCollections } from '@/services/seedData';
import type { ScheduleItem, ResearchProject, WellnessLog, Notification, EmailDraft } from '@/services/firestoreTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Constants & Static Mock Data (for remaining items) ───────────────────────────────────────────────
const ACTIVITY_TYPES: Record<string, { color: string }> = {
  lecture_prep: { color: '#3B82F6' },
  research_writing: { color: '#8B5CF6' },
  student_consultations: { color: '#10B981' },
  meetings: { color: '#F59E0B' },
  assessment_review: { color: '#EF4444' },
  admin: { color: '#64748B' },
  break: { color: '#06B6D4' },
};

export default function DashboardScreen() {
  const { user, userProfile, signOut } = useAuth();
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Live Data State
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);

  const todayStr = useMemo(() => {
    const today = new Date();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${m}-${d}`;
  }, []);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    let loaded = 0;
    const checkDone = () => { loaded++; if (loaded >= 5) setLoading(false); };
    
    const unsub1 = subscribeSchedules(user.uid, todayStr, (data) => { setTodaySchedule(data); checkDone(); });
    const unsub2 = subscribeResearchProjects(user.uid, (data) => { setProjects(data); checkDone(); });
    const unsub3 = subscribeWellnessLogs(user.uid, (data) => { setWellnessLogs(data); checkDone(); }, 7);
    const unsub4 = subscribeNotifications(user.uid, (data) => { setNotifications(data); checkDone(); });
    const unsub5 = subscribeEmailDrafts(user.uid, (data) => { setEmailDrafts(data); checkDone(); });

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); };
  }, [user?.uid, todayStr]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  // Compute live metrics
  const liveMetrics = useMemo(() => {
    const unreadNotifs = notifications.filter(n => !n.read).length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    
    let riskScore = 42; // default
    if (wellnessLogs.length > 0) {
      const avgStress = wellnessLogs.reduce((sum, l) => sum + l.stressLevel, 0) / wellnessLogs.length;
      const avgHours = wellnessLogs.reduce((sum, l) => sum + (l.workingHours || 0), 0) / wellnessLogs.length;
      riskScore = Math.min(Math.round((avgStress / 5) * 50 + (avgHours / 12) * 50), 100);
    }
    
    return {
      todayScheduleItems: todaySchedule.length,
      researchProjects: activeProjects,
      burnoutRiskScore: riskScore,
      unreadNotifs,
      workloadScore: 73, // mock
      weeklyTeachingHours: 18, // mock
    };
  }, [todaySchedule, projects, wellnessLogs, notifications]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getBurnoutColor = (score: number) => {
    if (score <= 30) return BrandColors.success;
    if (score <= 60) return BrandColors.warning;
    return BrandColors.error;
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.accent} />
        }
      >
        {/* ─── Header ─────────────────────────────────────── */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#1B2A4A', '#0F172A']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName} numberOfLines={1}>{userProfile?.name || 'Dr. User'}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push('/(tabs)/notifications')}
              >
                <MaterialIcons name="notifications-none" size={24} color="#fff" />
                {liveMetrics.unreadNotifs > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{liveMetrics.unreadNotifs}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/settings')}>
                <LinearGradient
                  colors={[BrandColors.accent, BrandColors.secondary]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {(userProfile?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStatsRow}>
            <QuickStat icon="event-note" label="Today" value={`${liveMetrics.todayScheduleItems} tasks`} color={BrandColors.accent} onPress={() => router.push('/(tabs)/planner')} />
            <View style={styles.quickStatDivider} />
            <QuickStat icon="psychology" label="Workload" value={`${liveMetrics.workloadScore}%`} color={BrandColors.warning} onPress={() => router.push('/(tabs)/burnout')} />
            <View style={styles.quickStatDivider} />
            <QuickStat icon="favorite" label="Burnout" value={`${liveMetrics.burnoutRiskScore}%`} color={getBurnoutColor(liveMetrics.burnoutRiskScore)} onPress={() => router.push('/(tabs)/burnout')} />
            <View style={styles.quickStatDivider} />
            <QuickStat icon="science" label="Research" value={`${liveMetrics.researchProjects}`} color={BrandColors.secondary} onPress={() => router.push('/(tabs)/research')} />
          </View>
        </LinearGradient>

        {/* ─── Today&apos;s Schedule ────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Today's Schedule</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/(tabs)/planner')}>
              <Text style={styles.seeAllText}>Full Planner</Text>
              <MaterialIcons name="chevron-right" size={18} color={BrandColors.accent} />
            </TouchableOpacity>
          </View>

          {loading ? (
             <ActivityIndicator size="small" color={BrandColors.accent} style={{ marginTop: 20 }} />
          ) : todaySchedule.length > 0 ? (
            todaySchedule.map((item, index) => {
              const color = ACTIVITY_TYPES[item.type]?.color || '#64748B';
              return (
                <TouchableOpacity key={item.id} style={[styles.scheduleCard, isDark && styles.cardDark]} activeOpacity={0.7} onPress={() => router.push('/(tabs)/planner')}>
                  <View style={[styles.scheduleStripe, { backgroundColor: color }]} />
                  <View style={styles.scheduleContent}>
                    <Text style={[styles.scheduleTime, isDark && styles.textMutedDark]}>{item.startTime} – {item.endTime}</Text>
                    <Text style={[styles.scheduleTitle, isDark && styles.textDark]}>{item.title}</Text>
                  </View>
                  {index === 0 && (
                    <View style={styles.nowBadge}>
                      <Text style={styles.nowBadgeText}>NEXT</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })
          ) : (
            <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 10 }}>No events scheduled for today.</Text>
          )}
        </View>

        {/* ─── Burnout & Workload Summary ─────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Well-being & Workload</Text>
          <View style={styles.wellbeingRow}>
            <View style={[styles.wellbeingCard, { flex: 1 }, isDark && styles.cardDark]}>
              <View style={styles.wellbeingHeader}>
                <MaterialIcons name="favorite" size={20} color={getBurnoutColor(liveMetrics.burnoutRiskScore)} />
                <Text style={[styles.wellbeingLabel, isDark && styles.textMutedDark]}>Burnout Risk</Text>
              </View>
              <Text style={[styles.wellbeingValue, { color: getBurnoutColor(liveMetrics.burnoutRiskScore) }]}>
                {liveMetrics.burnoutRiskScore}%
              </Text>
              <View style={[styles.progressBarTrack, isDark && styles.progressBarTrackDark]}>
                <View style={[styles.progressBarFill, { width: `${liveMetrics.burnoutRiskScore}%`, backgroundColor: getBurnoutColor(liveMetrics.burnoutRiskScore) }]} />
              </View>
              <Text style={[styles.wellbeingStatus, isDark && styles.textMutedDark]}>
                {liveMetrics.burnoutRiskScore <= 30 ? '✅ Low risk' : liveMetrics.burnoutRiskScore <= 60 ? '⚠️ Moderate' : '🔴 High risk'}
              </Text>
            </View>

            <View style={[styles.wellbeingCard, { flex: 1 }, isDark && styles.cardDark]}>
              <View style={styles.wellbeingHeader}>
                <MaterialIcons name="analytics" size={20} color={BrandColors.info} />
                <Text style={[styles.wellbeingLabel, isDark && styles.textMutedDark]}>Workload</Text>
              </View>
              <Text style={[styles.wellbeingValue, { color: BrandColors.info }]}>
                {liveMetrics.workloadScore}%
              </Text>
              <View style={[styles.progressBarTrack, isDark && styles.progressBarTrackDark]}>
                <View style={[styles.progressBarFill, { width: `${liveMetrics.workloadScore}%`, backgroundColor: BrandColors.info }]} />
              </View>
              <Text style={[styles.wellbeingStatus, isDark && styles.textMutedDark]}>📚 {liveMetrics.weeklyTeachingHours}h teaching/week</Text>
            </View>
          </View>
        </View>

        {/* ─── AI Insights ────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>AI Insights</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/(tabs)/ai-assistant')}>
              <Text style={styles.seeAllText}>View All</Text>
              <MaterialIcons name="chevron-right" size={18} color={BrandColors.accent} />
            </TouchableOpacity>
          </View>
          {notifications.filter(n => n.type === 'ai_recommendation').map((insight) => (
            <TouchableOpacity key={insight.id} style={[styles.insightCard, isDark && styles.cardDark]} activeOpacity={0.7} onPress={() => router.push('/(tabs)/ai-assistant')}>
              <View style={styles.insightIconContainer}>
                <LinearGradient
                  colors={[BrandColors.secondary, BrandColors.accent]}
                  style={styles.insightIconGradient}
                >
                  <MaterialIcons name="smart-toy" size={18} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={[styles.insightText, isDark && styles.textDark]}>{insight.message}</Text>
            </TouchableOpacity>
          ))}
          {notifications.filter(n => n.type === 'ai_recommendation').length === 0 && (
            <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 10 }}>No new AI insights.</Text>
          )}
        </View>

        {/* ─── Pending Emails ─────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Pending Emails</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/email-draft')}>
              <Text style={styles.seeAllText}>Email Assistant</Text>
              <MaterialIcons name="chevron-right" size={18} color={BrandColors.accent} />
            </TouchableOpacity>
          </View>
          {emailDrafts.map((email) => {
            const timeStr = email.createdAt ? new Date(email.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
            return (
              <TouchableOpacity key={email.id} style={[styles.emailCard, isDark && styles.cardDark]} activeOpacity={0.7} onPress={() => router.push(('/email-draft?id=' + email.id) as any)}>
                <View style={styles.emailIcon}>
                  <MaterialIcons name="email" size={20} color={BrandColors.accent} />
                </View>
                <View style={styles.emailContent}>
                  <Text style={[styles.emailFrom, isDark && styles.textDark]}>{email.recipient || 'Draft'}</Text>
                  <Text style={[styles.emailSubject, isDark && styles.textMutedDark]} numberOfLines={1}>{email.subject}</Text>
                </View>
                <View style={styles.emailMeta}>
                  <Text style={styles.emailTime}>{timeStr}</Text>
                  <View style={styles.aiDraftBadge}>
                    <MaterialIcons name="auto-awesome" size={12} color={BrandColors.secondary} />
                    <Text style={styles.aiDraftText}>AI Draft</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
          {emailDrafts.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 10 }}>Inbox Zero! No pending drafts.</Text>
          )}
        </View>

        {/* ─── Quick Actions ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction icon="event-note" label="Plan Day" color={BrandColors.accent} onPress={() => router.push('/(tabs)/planner')} />
            <QuickAction icon="science" label="Research" color={BrandColors.secondary} onPress={() => router.push('/(tabs)/research')} />
            <QuickAction icon="self-improvement" label="Log Burnout" color={BrandColors.warning} onPress={() => router.push('/(tabs)/burnout')} />
            <QuickAction icon="email" label="Draft Email" color={BrandColors.info} onPress={() => router.push('/email-draft')} />
            <QuickAction icon="groups" label="Meetings" color="#EC4899" onPress={() => router.push('/(tabs)/meetings')} />
            <QuickAction icon="settings" label="Settings" color="#64748B" onPress={() => router.push('/settings')} />
            <QuickAction icon="data-object" label="Seed Data" color="#10B981" onPress={async () => {
              if (user?.uid) {
                await seedNewCollections(user.uid);
                Alert.alert('Success', 'Seed data created!');
              }
            }} />
          </View>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function QuickStat({ icon, label, value, color, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string; color: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.quickStat} activeOpacity={0.7} onPress={onPress}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({ icon, label, color, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; color: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.quickAction} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '18' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  // Header
  header: {
    paddingTop: 56,
    paddingLeft: 68, paddingRight: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  headerLeft: { flex: 1, marginRight: Spacing.md },
  greeting: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginBottom: 2 },
  userName: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: '#fff' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexShrink: 0 },
  headerIconButton: {
    width: 44, height: 44, borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9,
    backgroundColor: BrandColors.error, justifyContent: 'center', alignItems: 'center',
  },
  notifBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  avatarButton: {},
  avatarGradient: {
    width: 44, height: 44, borderRadius: BorderRadius.full,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#fff' },

  // Quick Stats
  quickStatsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BorderRadius.lg, padding: Spacing.base, alignItems: 'center',
  },
  quickStat: { flex: 1, alignItems: 'center', gap: 4 },
  quickStatDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.1)' },
  quickStatValue: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#fff' },
  quickStatLabel: { fontSize: Typography.sizes.xs, color: '#94A3B8' },

  // Sections
  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginBottom: Spacing.base,
  },
  sectionTitleDark: { color: '#F1F5F9' },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.base },
  seeAllText: { fontSize: Typography.sizes.sm, color: BrandColors.accent, fontWeight: Typography.weights.semibold },

  // Schedule
  scheduleCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm, overflow: 'hidden', ...Shadows.sm,
  },
  cardDark: { backgroundColor: '#1E293B' },
  scheduleStripe: { width: 4 },
  scheduleContent: { flex: 1, padding: Spacing.md },
  scheduleTime: { fontSize: Typography.sizes.xs, color: '#64748B', fontWeight: Typography.weights.semibold, marginBottom: 2 },
  scheduleTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: '#1A1A2E' },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  nowBadge: {
    backgroundColor: BrandColors.error, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'center', marginRight: Spacing.md,
  },
  nowBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Well-being
  wellbeingRow: { flexDirection: 'row', gap: Spacing.md },
  wellbeingCard: {
    backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.base, ...Shadows.sm,
  },
  wellbeingHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  wellbeingLabel: { fontSize: Typography.sizes.sm, color: '#64748B', fontWeight: Typography.weights.semibold },
  wellbeingValue: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.weights.extrabold, marginBottom: Spacing.sm },
  progressBarTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm },
  progressBarTrackDark: { backgroundColor: '#334155' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  wellbeingStatus: { fontSize: Typography.sizes.xs, color: '#64748B' },

  // AI Insights
  insightCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.sm,
    gap: Spacing.md, ...Shadows.sm,
  },
  insightIconContainer: {},
  insightIconGradient: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  insightText: { flex: 1, fontSize: Typography.sizes.sm, color: '#334155', lineHeight: 20 },

  // Emails
  emailCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.sm,
    gap: Spacing.md, ...Shadows.sm,
  },
  emailIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: BrandColors.accent + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  emailContent: { flex: 1 },
  emailFrom: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginBottom: 2 },
  emailSubject: { fontSize: Typography.sizes.sm, color: '#64748B' },
  emailMeta: { alignItems: 'flex-end', gap: 4 },
  emailTime: { fontSize: Typography.sizes.xs, color: '#94A3B8' },
  aiDraftBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: BrandColors.secondary + '12', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm,
  },
  aiDraftText: { fontSize: 10, color: BrandColors.secondary, fontWeight: Typography.weights.bold },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: Spacing.md,
  },
  quickAction: {
    width: '30%',
    minWidth: 80,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  quickActionLabel: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold, color: '#334155' },
});
