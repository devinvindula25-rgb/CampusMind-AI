import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import type { TeachingCourse } from '@/services/firestoreTypes';

interface CourseDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  course: TeachingCourse | null;
}

const ASSESSMENT_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  assignment: 'assignment', quiz: 'quiz', midterm: 'school',
  final_exam: 'grading', viva: 'mic', osce_ospe: 'biotech',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: '#DBEAFE', text: '#2563EB' },
  in_progress: { bg: '#FEF3C7', text: '#D97706' },
  completed: { bg: '#D1FAE5', text: '#059669' },
  graded: { bg: '#E0E7FF', text: '#4F46E5' },
};

export default function CourseDetailsModal({ visible, onClose, course }: CourseDetailsModalProps) {
  const [activeBreakdown, setActiveBreakdown] = useState<'lecture' | 'tutorial' | 'practical' | null>(null);

  React.useEffect(() => {
    if (!visible) setActiveBreakdown(null);
  }, [visible]);

  if (!course) return null;

  const activeSessions = course.sessions?.filter(s => s.type === activeBreakdown) || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{course.status.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.moduleCode}>{course.moduleCode}</Text>
            <Text style={styles.courseName}>{course.courseName}</Text>
            <Text style={styles.semester}>{course.semester} • {course.contactHours} Contact Hours</Text>
          </LinearGradient>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Class Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Class Breakdown</Text>
              <View style={styles.breakdownRow}>
                <TouchableOpacity 
                  style={[styles.breakdownCard, activeBreakdown === 'lecture' && styles.breakdownCardActive]} 
                  activeOpacity={0.7} 
                  onPress={() => setActiveBreakdown(activeBreakdown === 'lecture' ? null : 'lecture')}
                >
                  <MaterialIcons name="menu-book" size={24} color={activeBreakdown === 'lecture' ? '#fff' : '#7C3AED'} />
                  <Text style={[styles.breakdownValue, activeBreakdown === 'lecture' && styles.textWhite]}>{course.lectures}</Text>
                  <Text style={[styles.breakdownLabel, activeBreakdown === 'lecture' && styles.textWhiteMuted]}>Lectures</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.breakdownCard, activeBreakdown === 'tutorial' && styles.breakdownCardActive]} 
                  activeOpacity={0.7} 
                  onPress={() => setActiveBreakdown(activeBreakdown === 'tutorial' ? null : 'tutorial')}
                >
                  <MaterialIcons name="people" size={24} color={activeBreakdown === 'tutorial' ? '#fff' : '#3B82F6'} />
                  <Text style={[styles.breakdownValue, activeBreakdown === 'tutorial' && styles.textWhite]}>{course.tutorials}</Text>
                  <Text style={[styles.breakdownLabel, activeBreakdown === 'tutorial' && styles.textWhiteMuted]}>Tutorials</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.breakdownCard, activeBreakdown === 'practical' && styles.breakdownCardActive]} 
                  activeOpacity={0.7} 
                  onPress={() => setActiveBreakdown(activeBreakdown === 'practical' ? null : 'practical')}
                >
                  <MaterialIcons name="science" size={24} color={activeBreakdown === 'practical' ? '#fff' : '#10B981'} />
                  <Text style={[styles.breakdownValue, activeBreakdown === 'practical' && styles.textWhite]}>{course.practicals}</Text>
                  <Text style={[styles.breakdownLabel, activeBreakdown === 'practical' && styles.textWhiteMuted]}>Practicals</Text>
                </TouchableOpacity>
              </View>

              {activeBreakdown && (
                <View style={styles.sessionsContainer}>
                  <Text style={styles.sessionsTitle}>{activeBreakdown.charAt(0).toUpperCase() + activeBreakdown.slice(1)} Schedule</Text>
                  {activeSessions.length > 0 ? (
                    activeSessions.map((s, i) => (
                      <View key={s.id || i} style={styles.sessionCard}>
                        <View style={styles.sessionIcon}>
                          <MaterialIcons 
                            name={activeBreakdown === 'lecture' ? 'menu-book' : activeBreakdown === 'tutorial' ? 'people' : 'science'} 
                            size={20} 
                            color={BrandColors.accent} 
                          />
                        </View>
                        <View style={styles.sessionInfo}>
                          <Text style={styles.sessionTopic}>
                            {s.order ? `${activeBreakdown.charAt(0).toUpperCase() + activeBreakdown.slice(1)} ${s.order}: ` : ''}{s.topic}
                          </Text>
                          <Text style={styles.sessionDetails}>{s.date} • {s.duration} hours</Text>
                          {s.description && (
                            <Text style={styles.sessionDescription}>{s.description}</Text>
                          )}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: s.status === 'completed' ? '#D1FAE5' : '#E0E7FF' }]}>
                          <Text style={[styles.statusText, { color: s.status === 'completed' ? '#059669' : '#4F46E5' }]}>
                            {s.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No detailed sessions mapped for this type.</Text>
                  )}
                </View>
              )}
            </View>

            {/* Assessments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assessments & Modules</Text>
              {course.assessments?.map((a, i) => (
                <View key={i} style={styles.assessmentCard}>
                  <View style={styles.assessmentIcon}>
                    <MaterialIcons name={ASSESSMENT_ICONS[a.type] || 'assignment'} size={24} color="#64748B" />
                  </View>
                  <View style={styles.assessmentInfo}>
                    <Text style={styles.assessmentName}>{a.name}</Text>
                    {a.description && (
                      <Text style={styles.assessmentDesc}>{a.description}</Text>
                    )}
                    <View style={styles.assessmentMetaRow}>
                      <Text style={styles.assessmentDetails}>Weight: {a.weight}% {a.dueDate ? `• Due: ${a.dueDate}` : ''}</Text>
                      {a.score && (
                        <Text style={styles.assessmentScore}>Score: {a.score}</Text>
                      )}
                    </View>
                  </View>
                  {a.status && (
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[a.status] || STATUS_COLORS.upcoming).bg }]}>
                      <Text style={[styles.statusText, { color: (STATUS_COLORS[a.status] || STATUS_COLORS.upcoming).text }]}>
                        {(a.status || '').replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              {(!course.assessments || course.assessments.length === 0) && (
                <Text style={styles.emptyText}>No assessments mapped yet.</Text>
              )}
            </View>

            {/* Student Feedback */}
            <View style={styles.section}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.sectionTitle}>Student Feedback</Text>
                {course.averageRating > 0 && (
                  <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={16} color="#F59E0B" />
                    <Text style={styles.ratingText}>{course.averageRating.toFixed(1)} Avg</Text>
                  </View>
                )}
              </View>
              {course.studentFeedback?.map((f, i) => (
                <View key={i} style={styles.feedbackCard}>
                  <View style={styles.feedbackTop}>
                    <View style={styles.starsRow}>
                      {[1,2,3,4,5].map(star => (
                        <MaterialIcons key={star} name={star <= f.rating ? 'star' : 'star-border'} size={16} color="#F59E0B" />
                      ))}
                    </View>
                    <Text style={styles.feedbackDate}>{f.date}</Text>
                  </View>
                  <Text style={styles.feedbackComment}>"{f.comment}"</Text>
                </View>
              ))}
              {(!course.studentFeedback || course.studentFeedback.length === 0) && (
                <Text style={styles.emptyText}>No feedback available yet.</Text>
              )}
            </View>


            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => {
                  const msg = `Mark attendance for ${course.courseName}?`;
                  if (Platform.OS === 'web') {
                    if (window.confirm(msg)) onClose();
                  } else {
                    Alert.alert('Mark Attendance', msg, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Confirm', onPress: onClose }
                    ]);
                  }
                }}
              >
                <MaterialIcons name="fact-check" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Mark Attendance</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionBtn, styles.submitBtn]}
                onPress={() => {
                  const msg = `Submit grades for ${course.courseName}?`;
                  if (Platform.OS === 'web') {
                    if (window.confirm(msg)) onClose();
                  } else {
                    Alert.alert('Submit Grades', msg, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Submit', onPress: onClose }
                    ]);
                  }
                }}
              >
                <MaterialIcons name="publish" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Submit Grades</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: '90%',
    overflow: 'hidden',
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.full,
  },
  moduleCode: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  semester: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  breakdownValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: '#1A1A2E',
  },
  breakdownLabel: {
    fontSize: Typography.sizes.xs,
    color: '#64748B',
  },
  breakdownCardActive: {
    backgroundColor: BrandColors.primary,
  },
  textWhite: {
    color: '#fff',
  },
  textWhiteMuted: {
    color: 'rgba(255,255,255,0.7)',
  },
  sessionsContainer: {
    marginTop: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  sessionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: Spacing.md,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  sessionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTopic: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  sessionDetails: {
    fontSize: 12,
    color: '#64748B',
  },
  sessionDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontStyle: 'italic',
  },
  assessmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  assessmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  assessmentDesc: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 18,
  },
  assessmentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  assessmentDetails: {
    fontSize: 12,
    color: '#64748B',
  },
  assessmentScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: Spacing.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: BrandColors.primary,
  },
  approveBtn: {
    backgroundColor: BrandColors.success,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  ratingText: {
    color: '#D97706',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  feedbackTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  feedbackComment: {
    fontSize: 14,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 20,
  }
});
