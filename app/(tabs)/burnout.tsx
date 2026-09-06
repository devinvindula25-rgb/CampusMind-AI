/**
 * CampusMind AI - Burnout Monitoring System
 * Tracks working hours, stress levels, and provides burnout risk assessment.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeWellnessLogs, createWellnessLog, subscribeNotifications } from '@/services/firestore';
import type { WellnessLog, Notification } from '@/services/firestoreTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STRESS_EMOJIS = ['😊', '🙂', '😐', '😓', '😰'];
const STRESS_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];



export default function BurnoutScreen() {
  const { user } = useAuth();
  const [selectedStress, setSelectedStress] = useState<number | null>(null);
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    let loaded = 0;
    const checkDone = () => { loaded++; if (loaded >= 2) setLoading(false); };

    const unsub1 = subscribeWellnessLogs(user.uid, (data) => {
      setLogs(data);
      checkDone();
    }, 7); // only need last 7 for chart
    
    const unsub2 = subscribeNotifications(user.uid, (data) => {
      setNotifications(data);
      checkDone();
    });

    return () => { unsub1(); unsub2(); };
  }, [user?.uid]);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasLoggedToday = logs.some((l) => l.date === todayStr);

  const handleLogToday = async () => {
    if (!user?.uid || !selectedStress) return;
    setSaving(true);
    await createWellnessLog(user.uid, {
      date: todayStr,
      stressLevel: selectedStress,
      workingHours: 8, // Default or prompt
      meetingsCount: 0,
    });
    setSaving(false);
    setSelectedStress(null);
  };

  // Compute metrics from logs
  const stats = useMemo(() => {
    if (logs.length === 0) return { riskScore: 0, avgHours: 0, totalMeetings: 0, avgStress: 0, trend: 'stable', trendChange: 0, chartData: [] };
    const avgStress = logs.reduce((sum, l) => sum + l.stressLevel, 0) / logs.length;
    const avgHours = logs.reduce((sum, l) => sum + (l.workingHours || 0), 0) / logs.length;
    const totalMeetings = logs.reduce((sum, l) => sum + (l.meetingsCount || 0), 0);
    const riskScore = Math.min(Math.round((avgStress / 5) * 50 + (avgHours / 12) * 50), 100);

    const chartData = logs.slice().reverse().map(l => {
      const d = new Date(l.date);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return { day: dayNames[d.getDay()], hours: l.workingHours || 0, stress: l.stressLevel, meetings: l.meetingsCount || 0 };
    });

    return { riskScore, avgHours: Math.round(avgHours), totalMeetings, avgStress, trend: 'improving', trendChange: 5, chartData };
  }, [logs]);

  const getBurnoutColor = (score: number) => {
    if (score <= 30) return BrandColors.success;
    if (score <= 60) return BrandColors.warning;
    return BrandColors.error;
  };

  const getBurnoutLabel = (score: number) => {
    if (score <= 20) return 'Excellent';
    if (score <= 40) return 'Good';
    if (score <= 60) return 'Moderate';
    if (score <= 80) return 'High Risk';
    return 'Critical';
  };

  const maxHours = stats.chartData.length > 0 ? Math.max(...stats.chartData.map((d) => d.hours)) : 10;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <Text style={styles.headerTitle}>Workload & Burnout</Text>
        <Text style={styles.headerSubtitle}>Monitor your well-being</Text>

        {/* Burnout Score Ring */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreRingOuter}>
            <LinearGradient
              colors={[getBurnoutColor(stats.riskScore), getBurnoutColor(stats.riskScore) + '60']}
              style={styles.scoreRingGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.scoreInner}>
                <Text style={styles.scoreValue}>{stats.riskScore}</Text>
                <Text style={styles.scoreUnit}>/ 100</Text>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.scoreMeta}>
            <Text style={[styles.scoreLabel, { color: getBurnoutColor(stats.riskScore) }]}>
              {getBurnoutLabel(stats.riskScore)} Risk
            </Text>
            <View style={styles.trendRow}>
              <MaterialIcons
                name={stats.trend === 'improving' ? 'trending-down' : 'trending-up'}
                size={18}
                color={stats.trend === 'improving' ? BrandColors.success : BrandColors.error}
              />
              <Text style={[styles.trendText, {
                color: stats.trend === 'improving' ? BrandColors.success : BrandColors.error,
              }]}>
                {Math.abs(stats.trendChange)}% {stats.trend === 'improving' ? 'better' : 'worse'} this week
              </Text>
            </View>
            <View style={styles.metaStats}>
              <View style={styles.metaStat}>
                <Text style={styles.metaStatValue}>{stats.avgHours}h</Text>
                <Text style={styles.metaStatLabel}>Work/wk</Text>
              </View>
              <View style={styles.metaStat}>
                <Text style={styles.metaStatValue}>{stats.totalMeetings}</Text>
                <Text style={styles.metaStatLabel}>Meetings</Text>
              </View>
              <View style={styles.metaStat}>
                <Text style={styles.metaStatValue}>{stats.avgStress.toFixed(1)}</Text>
                <Text style={styles.metaStatLabel}>Avg Stress</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Daily Stress Check-in */}
          {!hasLoggedToday && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How are you feeling today?</Text>
              <View style={styles.stressSelector}>
                {STRESS_EMOJIS.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.stressOption, selectedStress === index + 1 && styles.stressOptionSelected]}
                    onPress={() => setSelectedStress(index + 1)}
                  >
                    <Text style={styles.stressEmoji}>{emoji}</Text>
                    <Text style={[styles.stressLabel, selectedStress === index + 1 && styles.stressLabelSelected]}>
                      {STRESS_LABELS[index]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedStress && (
                <TouchableOpacity style={styles.logButton} activeOpacity={0.7} onPress={handleLogToday} disabled={saving}>
                  <LinearGradient colors={[BrandColors.accent, BrandColors.accentDark]} style={styles.logButtonGradient}>
                    <MaterialIcons name="check" size={18} color="#fff" />
                    <Text style={styles.logButtonText}>{saving ? 'Saving...' : "Log Today's Check-in"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Weekly Hours Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week&apos;s Working Hours</Text>
            {stats.chartData.length > 0 ? (
              <View style={styles.chartCard}>
                <View style={styles.chartContainer}>
                  {stats.chartData.map((day, i) => (
                    <View key={i} style={styles.chartBar}>
                      <Text style={styles.chartValue}>{day.hours}h</Text>
                      <View style={styles.barTrack}>
                        <LinearGradient
                          colors={day.hours > 9 ? [BrandColors.warning, '#D97706'] : [BrandColors.accent, BrandColors.accentDark]}
                          style={[styles.barFill, { height: `${(day.hours / maxHours) * 100}%` }]}
                        />
                      </View>
                      <Text style={styles.chartDay}>{day.day}</Text>
                      <Text style={styles.chartStress}>{STRESS_EMOJIS[day.stress - 1]}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: BrandColors.accent }]} />
                    <Text style={styles.legendText}>Within target (≤9h)</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: BrandColors.warning }]} />
                    <Text style={styles.legendText}>Over target (&gt;9h)</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingTop: 20 }}>
                <Text style={{ color: '#94A3B8' }}>No data logged yet this week.</Text>
              </View>
            )}
          </View>

        {/* AI Well-being Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Well-being Insights</Text>
          {notifications.filter(n => n.type === 'ai_recommendation').map((tip) => {
            const type = tip.priority === 'high' || tip.priority === 'urgent' ? 'warning' :
                         tip.priority === 'medium' ? 'success' : 'info';
            return (
              <View
                key={tip.id}
                style={[styles.tipCard, {
                  borderLeftColor: type === 'warning' ? BrandColors.warning :
                    type === 'success' ? BrandColors.success : BrandColors.info,
                }]}
              >
                <MaterialIcons
                  name={type === 'warning' ? 'warning' : type === 'success' ? 'check-circle' : 'lightbulb'}
                  size={20}
                  color={type === 'warning' ? BrandColors.warning :
                    type === 'success' ? BrandColors.success : BrandColors.info}
                />
                <Text style={styles.tipText}>{tip.message}</Text>
              </View>
            );
          })}
          {notifications.filter(n => n.type === 'ai_recommendation').length === 0 && (
            <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 10 }}>No new AI insights.</Text>
          )}
        </View>

        <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 56, paddingLeft: 68, paddingRight: Spacing.xl, paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'], borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: '#fff' },
  headerSubtitle: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginTop: 2, marginBottom: Spacing.xl },

  // Score Section
  scoreSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  scoreRingOuter: {},
  scoreRingGradient: {
    width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', padding: 4,
  },
  scoreInner: {
    width: 92, height: 92, borderRadius: 46, backgroundColor: '#1B2A4A',
    justifyContent: 'center', alignItems: 'center',
  },
  scoreValue: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.weights.extrabold, color: '#fff' },
  scoreUnit: { fontSize: Typography.sizes.xs, color: '#94A3B8' },
  scoreMeta: { flex: 1 },
  scoreLabel: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, marginBottom: 4 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
  trendText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  metaStats: { flexDirection: 'row', gap: Spacing.lg },
  metaStat: { alignItems: 'center' },
  metaStatValue: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#fff' },
  metaStatLabel: { fontSize: Typography.sizes.xs, color: '#94A3B8' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginBottom: Spacing.base },

  // Stress Selector
  stressSelector: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  stressOption: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg, backgroundColor: '#fff', borderWidth: 2, borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  stressOptionSelected: { borderColor: BrandColors.accent, backgroundColor: BrandColors.accent + '08' },
  stressEmoji: { fontSize: 28, marginBottom: 4 },
  stressLabel: { fontSize: 10, color: '#64748B', fontWeight: Typography.weights.medium, textAlign: 'center' },
  stressLabelSelected: { color: BrandColors.accent, fontWeight: Typography.weights.bold },

  logButton: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.md },
  logButtonGradient: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: Spacing.md, gap: Spacing.sm,
  },
  logButtonText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#fff' },

  // Chart
  chartCard: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadows.sm },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, marginBottom: Spacing.md },
  chartBar: { alignItems: 'center', flex: 1, gap: 4 },
  chartValue: { fontSize: 10, fontWeight: Typography.weights.bold, color: '#334155' },
  barTrack: {
    width: 28, height: 120, backgroundColor: '#F1F5F9', borderRadius: BorderRadius.sm,
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: BorderRadius.sm },
  chartDay: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold, color: '#64748B' },
  chartStress: { fontSize: 14 },
  chartLegend: { flexDirection: 'row', gap: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: Typography.sizes.xs, color: '#64748B' },

  // Tips
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff',
    borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.sm,
    borderLeftWidth: 3, gap: Spacing.md, ...Shadows.sm,
  },
  tipText: { flex: 1, fontSize: Typography.sizes.sm, color: '#334155', lineHeight: 20 },
});
