/**
 * CampusMind AI - Curriculum Reviews
 * Propose → Review → Approve pipeline for syllabus changes.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { subscribeCurriculumReviews, updateCurriculumReview } from '@/services/firestore';
import type { CurriculumReview } from '@/services/firestoreTypes';
import { getMockRichCurriculumReview } from '@/services/mockCurriculumData';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import GlassCard from '@/components/GlassCard';
import CurriculumDetailsModal from '@/components/CurriculumDetailsModal';

const PIPELINE_STAGES = ['pending', 'in_progress', 'approved'];
const PIPELINE_LABELS = ['Proposed', 'Under Review', 'Approved'];

export default function CurriculumScreen() {
  const { user } = useAuth();
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [reviews, setReviews] = useState<CurriculumReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<CurriculumReview | null>(null);
  const { isDark, Typography, BrandColors: localColors } = useThemeEngine();

  React.useEffect(() => {
    const departmentId = 'cs-dept';
    const unsub = subscribeCurriculumReviews(departmentId, async (data) => {
      let needsUpdate = false;
      const patchedData = await Promise.all(data.map(async (review) => {
        // Auto-patch if modules are missing
        if (!review.modules || review.modules.length === 0) {
          const richData = getMockRichCurriculumReview(review);
          try {
            await updateDoc(doc(db, 'curriculumReviews', review.id!), {
              modules: richData.modules,
            });
            needsUpdate = true;
          } catch (e) {
            console.error('Failed to auto-patch curriculum review', e);
          }
          return richData;
        }
        return review;
      }));
      
      if (!needsUpdate) {
        setReviews(data);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const activeStage = PIPELINE_STAGES[activeStageIndex];

  const getPriorityConfig = (dueDate: string) => {
    const daysLeft = (new Date(dueDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (daysLeft < 7) return { label: 'High', color: BrandColors.error, bg: BrandColors.errorBg };
    if (daysLeft < 30) return { label: 'Medium', color: BrandColors.warning, bg: BrandColors.warningBg };
    return { label: 'Low', color: isDark ? '#94A3B8' : '#64748B', bg: isDark ? '#334155' : '#F1F5F9' };
  };

  const handleAdvanceStage = (review: CurriculumReview) => {
    let nextStage: 'pending' | 'in_progress' | 'completed' | 'overdue' = 'pending';
    let actionLabel = 'advance';
    
    if (review.status === 'pending') {
      nextStage = 'in_progress';
      actionLabel = 'Send to Review';
    } else if (review.status === 'in_progress') {
      nextStage = 'completed'; // For this UI we map 'completed' to 'approved' tab
      actionLabel = 'Approve';
    }

    if (review.id) {
      const message = `Are you sure you want to ${actionLabel.toLowerCase()} this curriculum review for ${review.programmeName}?`;
      
      if (Platform.OS === 'web') {
        const confirmed = window.confirm(message);
        if (confirmed) {
          updateCurriculumReview(review.id!, { status: nextStage }).catch((error) => {
            console.error("Error advancing stage:", error);
            window.alert("Failed to update review status.");
          });
        }
      } else {
        Alert.alert(
          `Confirm ${actionLabel}`,
          message,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Confirm', 
              style: 'default',
              onPress: async () => {
                try {
                  await updateCurriculumReview(review.id!, { status: nextStage });
                } catch (error) {
                  console.error("Error advancing stage:", error);
                  Alert.alert("Error", "Failed to update review status.");
                }
              }
            }
          ]
        );
      }
    }
  };

  // Map 'approved' tab to 'completed' status in backend for our kanban
  const mappedActiveStage = activeStage === 'approved' ? 'completed' : activeStage;
  const filteredReviews = reviews.filter((r) => r.status === mappedActiveStage);
  const stageCounts = PIPELINE_STAGES.map((s) => reviews.filter((r) => r.status === (s === 'approved' ? 'completed' : s)).length);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <Text style={styles.headerTitle}>Curriculum Reviews</Text>
        <Text style={styles.headerSubtitle}>Manage syllabus change proposals</Text>
      </LinearGradient>

      {/* Kanban Stage Tabs */}
      <View style={[styles.stageRow, isDark && styles.stageRowDark]}>
        {PIPELINE_LABELS.map((label, i) => (
          <TouchableOpacity
            key={label}
            style={[styles.stageTab, activeStageIndex === i && styles.stageTabActive, activeStageIndex === i && isDark && styles.stageTabActiveDark]}
            onPress={() => setActiveStageIndex(i)}
          >
            <Text style={[styles.stageTabText, isDark && styles.textMutedDark, activeStageIndex === i && styles.stageTabTextActive]}>{label}</Text>
            <View style={[styles.stageBadge, isDark && styles.stageBadgeDark, activeStageIndex === i && styles.stageBadgeActive]}>
              <Text style={[styles.stageBadgeText, activeStageIndex === i && styles.stageBadgeTextActive]}>{stageCounts[i]}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No reviews in this stage</Text>
          </View>
        ) : (
          filteredReviews.map((review) => {
            const priority = getPriorityConfig(review.dueDate);
            const title = `${review.reviewType.charAt(0).toUpperCase() + review.reviewType.slice(1)} Review: ${review.programmeName}`;
            
            return (
              <TouchableOpacity key={review.id} activeOpacity={0.8} onPress={() => setSelectedReview(review)}>
                <GlassCard style={styles.card} isDark={isDark} intensity={isDark ? 30 : 90}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, isDark && styles.textDark]}>{title}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
                    <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
                  </View>
                </View>
                <Text style={styles.programme}>{review.programmeName}</Text>
                
                {review.findings && (
                  <View style={styles.detailsBlock}>
                    <Text style={[styles.detailsTitle, isDark && styles.textDark]}>Findings:</Text>
                    <Text style={[styles.detailsText, isDark && styles.textMutedDark]}>{review.findings}</Text>
                  </View>
                )}
                
                {review.recommendations && review.recommendations.length > 0 && (
                  <View style={styles.detailsBlock}>
                    <Text style={[styles.detailsTitle, isDark && styles.textDark]}>Recommendations:</Text>
                    {review.recommendations.map((rec, idx) => (
                      <Text key={idx} style={[styles.detailsText, isDark && styles.textMutedDark]}>• {rec}</Text>
                    ))}
                  </View>
                )}

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MaterialIcons name="person" size={14} color={isDark ? '#94A3B8' : '#94A3B8'} />
                    <Text style={[styles.metaText, isDark && styles.textMutedDark]}>{review.reviewer || 'Unassigned'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialIcons name="calendar-today" size={14} color={isDark ? '#94A3B8' : '#94A3B8'} />
                    <Text style={[styles.metaText, isDark && styles.textMutedDark]}>Due {review.dueDate}</Text>
                  </View>
                </View>

                {activeStageIndex < 2 && (
                  <View style={[styles.actionRow, isDark && styles.actionRowDark]}>
                    <TouchableOpacity style={styles.approveButton} onPress={() => handleAdvanceStage(review)}>
                      <MaterialIcons name="check" size={16} color={BrandColors.success} />
                      <Text style={styles.approveText}>{activeStageIndex === 0 ? 'Send to Review' : 'Approve'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          );
          })
        )}
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>

      <CurriculumDetailsModal
        visible={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        review={selectedReview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  header: {
    paddingTop: 56, paddingLeft: 68, paddingRight: Spacing.xl, paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'], borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: '#fff' },
  headerSubtitle: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginTop: 2 },
  stageRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  stageRowDark: { borderBottomColor: '#1E293B' },
  stageTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, gap: 6,
  },
  stageTabActive: { backgroundColor: BrandColors.secondary + '15' },
  stageTabActiveDark: { backgroundColor: '#1E293B' },
  stageTabText: { fontSize: Typography.sizes.sm, color: '#94A3B8', fontWeight: Typography.weights.medium },
  stageTabTextActive: { color: BrandColors.secondary, fontWeight: Typography.weights.bold },
  stageBadge: {
    backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8,
  },
  stageBadgeDark: { backgroundColor: '#334155' },
  stageBadgeActive: { backgroundColor: BrandColors.secondary + '25' },
  stageBadgeText: { fontSize: 10, fontWeight: Typography.weights.bold, color: '#94A3B8' },
  stageBadgeTextActive: { color: BrandColors.secondary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  cardTitle: { flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginRight: Spacing.sm },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  priorityText: { fontSize: 10, fontWeight: Typography.weights.bold, textTransform: 'uppercase' },
  programme: { fontSize: Typography.sizes.sm, color: BrandColors.secondary, fontWeight: Typography.weights.medium, marginBottom: Spacing.sm },
  detailsBlock: { marginBottom: Spacing.sm, backgroundColor: 'rgba(148, 163, 184, 0.05)', padding: Spacing.sm, borderRadius: BorderRadius.md },
  detailsTitle: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginBottom: 2 },
  detailsText: { fontSize: Typography.sizes.sm, color: '#64748B', lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md, marginTop: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: Typography.sizes.xs, color: '#94A3B8' },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: Spacing.md },
  actionRowDark: { borderTopColor: '#334155' },
  approveButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, backgroundColor: BrandColors.successBg,
  },
  approveText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: BrandColors.success },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.sizes.md, color: '#94A3B8' },
});
