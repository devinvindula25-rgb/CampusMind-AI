/**
 * CampusMind AI - Programmes Screen
 * Academic Programme Monitoring Module.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeProgrammes } from '@/services/firestore';
import type { AcademicProgramme } from '@/services/firestoreTypes';



const FILTERS = ['All', 'Undergraduate', 'Postgraduate', 'Doctoral'];

export default function ProgrammesScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [programmes, setProgrammes] = useState<AcademicProgramme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, departmentId would be derived from the user profile.
    const departmentId = 'cs-dept';
    const unsub = subscribeProgrammes(departmentId, (data) => {
      setProgrammes(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filtered = programmes.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' ||
      p.level === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1B2A4A', '#0F172A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Programmes</Text>
          <Text style={styles.headerSubtitle}>{programmes.length} programmes registered</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <MaterialIcons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search programmes..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Programme Cards */}
        {filtered.map((prog) => (
          <TouchableOpacity key={prog.id} style={styles.programmeCard} activeOpacity={0.7}>
            <View style={styles.programmeHeader}>
              <View style={styles.programmeInfo}>
                <View style={styles.programmeNameRow}>
                  <Text style={styles.programmeName}>{prog.name}</Text>
                  <StatusBadge status={prog.accreditationStatus} />
                </View>
                <Text style={styles.programmeCode}>{prog.code} • {prog.department}</Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <StatItem icon="school" label="Enrolment" value={String(prog.enrolment)} />
              <StatItem icon="trending-up" label="Completion" value={`${prog.completionRate}%`} />
              <StatItem icon="star" label="Satisfaction" value={`${prog.satisfaction}/5`} />
            </View>

            {/* Review Status */}
            <View style={styles.reviewRow}>
              <View style={styles.reviewStatusContainer}>
                <View style={[styles.reviewDot, { backgroundColor: getReviewColor(prog.reviewStatus) }]} />
                <Text style={styles.reviewStatusText}>{formatReviewStatus(prog.reviewStatus)}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    accredited: { bg: BrandColors.successBg, color: BrandColors.success, label: 'Accredited' },
    pending: { bg: BrandColors.warningBg, color: BrandColors.warning, label: 'Pending' },
    expired: { bg: BrandColors.errorBg, color: BrandColors.error, label: 'Expired' },
    not_applied: { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'N/A' },
  }[status] || { bg: '#eee', color: '#888', label: status };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

function StatItem({ icon, label, value }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <MaterialIcons name={icon} size={16} color="#94A3B8" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getReviewColor(status: string) {
  switch (status) {
    case 'up_to_date': return BrandColors.success;
    case 'under_review': return BrandColors.info;
    case 'review_due': return BrandColors.warning;
    case 'overdue': return BrandColors.error;
    default: return '#94A3B8';
  }
}

function formatReviewStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 56,
    paddingLeft: 68, paddingRight: Spacing.xl,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerContent: {},
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: BrandColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: '#1A1A2E',
  },
  filterRow: { marginBottom: Spacing.base },
  filterChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: '#fff',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: BrandColors.accent,
    borderColor: BrandColors.accent,
  },
  filterChipText: {
    fontSize: Typography.sizes.sm,
    color: '#64748B',
    fontWeight: Typography.weights.medium,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: Typography.weights.bold,
  },
  programmeCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  programmeHeader: {
    marginBottom: Spacing.md,
  },
  programmeInfo: {},
  programmeNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  programmeName: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: '#1A1A2E',
  },
  programmeCode: {
    fontSize: Typography.sizes.sm,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: '#1A1A2E',
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: '#94A3B8',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reviewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reviewStatusText: {
    fontSize: Typography.sizes.sm,
    color: '#64748B',
  },
});
