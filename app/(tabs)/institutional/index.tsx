/**
 * CampusMind AI - Institutional Dashboard
 * Highly interactive and attractive dashboard for Institutional QA Hub.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSettings, useThemeEngine } from '@/contexts/SettingsContext';
import { BorderRadius, Spacing, Shadows, BrandColors } from '@/constants/theme';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { seedInstitutionalData } from '@/services/seedInstitutionalData';
import { subscribeInstitutionalActivities } from '@/services/firestore';
import { InstitutionalActivity } from '@/services/firestoreTypes';
import { useAuth } from '@/contexts/AuthContext';
import ActivityDetailsModal from '@/components/ActivityDetailsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Interactive Animated Card Component ─────────────────────────────
const InteractiveCard = ({ children, onPress, style, delay = 0 }: any) => {
  const scale = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
      delay,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scale }, { scale: pressScale }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Circular Progress Component ─────────────────────────────────────
const CircularProgress = ({ progress, size, strokeWidth, color, label }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" originX={size / 2} originY={size / 2}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color + '30'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
        <SvgText
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={size / 4}
          fontWeight="bold"
          fill="#FFFFFF"
        >
          {`${progress}%`}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 15}
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={size / 8}
          fill="rgba(255,255,255,0.8)"
        >
          {label}
        </SvgText>
      </Svg>
    </View>
  );
};

// ─── Main Dashboard Screen ─────────────────────────────────────────
export default function InstitutionalDashboard() {
  const { isDark, Typography, BrandColors: localColors } = useThemeEngine();
  const { user } = useAuth();
  const [activities, setActivities] = React.useState<InstitutionalActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = React.useState<InstitutionalActivity | null>(null);

  React.useEffect(() => {
    if (!user?.uid) return;
    // Using a default department ID for demo purposes. 
    // In a real app, this would be tied to the user's institution/department profile.
    const deptId = 'DEPT_CS_01'; 
    const unsub = subscribeInstitutionalActivities(deptId, (data) => {
      setActivities(data);
    }, 5);
    return () => unsub();
  }, [user?.uid]);

  // Mock data for the dashboard
  const overallHealth = 86;
  const alerts = [
    { id: '1', type: 'warning', text: 'ABET Accreditation expires in 45 days', icon: 'warning' },
    { id: '2', type: 'error', text: '3 Curriculum reviews overdue', icon: 'error-outline' },
    { id: '3', type: 'info', text: 'Annual ISO Audit scheduled for next month', icon: 'info-outline' },
  ];
  return (
    <View style={[styles.container, isDark && { backgroundColor: '#0F172A' }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ─── Header Section ───────────────────────────────────── */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#2563EB', '#1E40AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Institution Hub</Text>
              <Text style={styles.title}>QA Command Center</Text>
            </View>
            <TouchableOpacity 
              style={styles.headerIcon}
              onPress={async () => {
                try {
                  await seedInstitutionalData();
                  alert('Data seeded!');
                } catch (e) {
                  alert('Error seeding');
                }
              }}
            >
              <MaterialIcons name="science" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.healthSection}>
            <CircularProgress progress={overallHealth} size={140} strokeWidth={12} color="#10B981" label="Health Score" />
            <View style={styles.healthStats}>
              <View style={styles.statRow}>
                <MaterialIcons name="verified" size={20} color="#10B981" />
                <Text style={styles.statText}>12 Accredited</Text>
              </View>
              <View style={styles.statRow}>
                <MaterialIcons name="pending-actions" size={20} color="#F59E0B" />
                <Text style={styles.statText}>4 Under Review</Text>
              </View>
              <View style={styles.statRow}>
                <MaterialIcons name="fact-check" size={20} color="#3B82F6" />
                <Text style={styles.statText}>2 Active Audits</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ─── Critical Alerts ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.lg }, isDark && { color: '#F1F5F9' }]}>
            Critical Alerts
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alertScroll} contentContainerStyle={{ paddingRight: Spacing.xl }}>
            {alerts.map((alert, index) => (
              <InteractiveCard key={alert.id} delay={index * 150} style={{ marginRight: Spacing.md }}>
                <LinearGradient
                  colors={
                    alert.type === 'error' ? ['#FEF2F2', '#FEE2E2'] :
                    alert.type === 'warning' ? ['#FFFBEB', '#FEF3C7'] :
                    ['#EFF6FF', '#DBEAFE']
                  }
                  style={[styles.alertCard, isDark && { backgroundColor: '#1E293B' }]} // We handle dark mode gradient separately if needed, simplified here
                >
                  <MaterialIcons 
                    name={alert.icon as any} 
                    size={24} 
                    color={
                      alert.type === 'error' ? '#EF4444' :
                      alert.type === 'warning' ? '#F59E0B' :
                      '#3B82F6'
                    } 
                  />
                  <Text style={[styles.alertText, { fontSize: Typography.sizes.sm }]}>{alert.text}</Text>
                </LinearGradient>
              </InteractiveCard>
            ))}
          </ScrollView>
        </View>

        {/* ─── Modules Grid ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.lg }, isDark && { color: '#F1F5F9' }]}>
            QA Modules
          </Text>
          <View style={styles.grid}>
            
            <InteractiveCard delay={300} style={styles.gridItem} onPress={() => router.push('/(tabs)/institutional/accreditation')}>
              <View style={[styles.moduleCard, isDark && styles.cardDark]}>
                <View style={[styles.moduleIconContainer, { backgroundColor: '#10B98115' }]}>
                  <MaterialIcons name="verified" size={28} color="#10B981" />
                </View>
                <Text style={[styles.moduleTitle, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}>Accreditation</Text>
                <Text style={[styles.moduleSubtitle, { fontSize: Typography.sizes.xs }, isDark && { color: '#94A3B8' }]}>Manage programmes</Text>
              </View>
            </InteractiveCard>

            <InteractiveCard delay={400} style={styles.gridItem} onPress={() => router.push('/(tabs)/institutional/curriculum')}>
              <View style={[styles.moduleCard, isDark && styles.cardDark]}>
                <View style={[styles.moduleIconContainer, { backgroundColor: '#8B5CF615' }]}>
                  <MaterialIcons name="menu-book" size={28} color="#8B5CF6" />
                </View>
                <Text style={[styles.moduleTitle, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}>Curriculum</Text>
                <Text style={[styles.moduleSubtitle, { fontSize: Typography.sizes.xs }, isDark && { color: '#94A3B8' }]}>Reviews & updates</Text>
              </View>
            </InteractiveCard>

            <InteractiveCard delay={500} style={styles.gridItem} onPress={() => router.push('/(tabs)/institutional/audits')}>
              <View style={[styles.moduleCard, isDark && styles.cardDark]}>
                <View style={[styles.moduleIconContainer, { backgroundColor: '#F59E0B15' }]}>
                  <MaterialIcons name="fact-check" size={28} color="#F59E0B" />
                </View>
                <Text style={[styles.moduleTitle, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}>Audits</Text>
                <Text style={[styles.moduleSubtitle, { fontSize: Typography.sizes.xs }, isDark && { color: '#94A3B8' }]}>Internal & External</Text>
              </View>
            </InteractiveCard>

            <InteractiveCard delay={600} style={styles.gridItem} onPress={() => router.push('/(tabs)/institutional/reports')}>
              <View style={[styles.moduleCard, isDark && styles.cardDark]}>
                <View style={[styles.moduleIconContainer, { backgroundColor: '#3B82F615' }]}>
                  <MaterialIcons name="description" size={28} color="#3B82F6" />
                </View>
                <Text style={[styles.moduleTitle, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}>Reports</Text>
                <Text style={[styles.moduleSubtitle, { fontSize: Typography.sizes.xs }, isDark && { color: '#94A3B8' }]}>Compliance analytics</Text>
              </View>
            </InteractiveCard>

            <InteractiveCard delay={700} style={styles.gridItem} onPress={() => router.push('/(tabs)/institutional/documents')}>
              <View style={[styles.moduleCard, isDark && styles.cardDark]}>
                <View style={[styles.moduleIconContainer, { backgroundColor: '#EC489915' }]}>
                  <MaterialIcons name="folder" size={28} color="#EC4899" />
                </View>
                <Text style={[styles.moduleTitle, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}>Documents</Text>
                <Text style={[styles.moduleSubtitle, { fontSize: Typography.sizes.xs }, isDark && { color: '#94A3B8' }]}>Policies & guidelines</Text>
              </View>
            </InteractiveCard>

          </View>
        </View>

        {/* ─── Recent Activity ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.lg }, isDark && { color: '#F1F5F9' }]}>
            Recent Activity
          </Text>
          <View style={[styles.activityCard, isDark && styles.cardDark]}>
            {activities.length > 0 ? activities.map((activity, index) => {
              const dotColor = 
                activity.type === 'accreditation' ? '#10B981' :
                activity.type === 'curriculum' ? '#F59E0B' :
                activity.type === 'document' ? '#3B82F6' :
                '#8B5CF6';

              return (
                <React.Fragment key={activity.id}>
                  <TouchableOpacity 
                    style={styles.activityRow} 
                    activeOpacity={0.7}
                    onPress={() => setSelectedActivity(activity)}
                  >
                    <View style={[styles.activityDot, { backgroundColor: dotColor }]} />
                    <View style={styles.activityContent}>
                      <Text style={[styles.activityText, isDark && { color: '#F1F5F9' }]}>{activity.title}</Text>
                      <Text style={[styles.activityTime, isDark && { color: '#94A3B8' }]}>{activity.timeAgo}</Text>
                    </View>
                  </TouchableOpacity>
                  {index < activities.length - 1 && <View style={styles.activityLine} />}
                </React.Fragment>
              );
            }) : (
              <Text style={{ textAlign: 'center', color: '#94A3B8', padding: 20 }}>No recent activity.</Text>
            )}
          </View>
        </View>
        
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>

      <ActivityDetailsModal 
        visible={!!selectedActivity} 
        activity={selectedActivity} 
        onClose={() => setSelectedActivity(null)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 120 },
  
  // Header
  header: {
    paddingTop: 60,
    paddingLeft: 68, paddingRight: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    ...Shadows.md,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 2 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  healthSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.xl,
  },
  healthStats: { flex: 1, marginLeft: Spacing.xl, gap: Spacing.md },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Sections
  section: { paddingHorizontal: Spacing.xl, marginTop: Spacing.xl },
  sectionTitle: { fontWeight: '700', color: '#1A1A2E', marginBottom: Spacing.base },
  
  // Alerts
  alertScroll: { overflow: 'visible' },
  alertCard: {
    width: 240, padding: Spacing.md, borderRadius: BorderRadius.lg,
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'center',
    ...Shadows.sm,
  },
  alertText: { flex: 1, color: '#1A1A2E', fontWeight: '600' },
  
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.md },
  gridItem: { width: '47%', minWidth: 140, marginBottom: Spacing.sm },
  moduleCard: {
    backgroundColor: '#fff', padding: Spacing.lg, borderRadius: BorderRadius.xl,
    alignItems: 'center', ...Shadows.sm,
  },
  cardDark: { backgroundColor: '#1E293B' },
  moduleIconContainer: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  moduleTitle: { fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  moduleSubtitle: { color: '#64748B' },

  // Activity
  activityCard: {
    backgroundColor: '#fff', borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadows.sm,
  },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  activityDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  activityContent: { flex: 1 },
  activityText: { color: '#1A1A2E', fontWeight: '500', lineHeight: 20 },
  activityTime: { fontSize: 12, color: '#64748B', marginTop: 4 },
  activityLine: {
    width: 2, height: 20, backgroundColor: '#E2E8F0',
    marginLeft: 4, marginVertical: 4,
  },
});
