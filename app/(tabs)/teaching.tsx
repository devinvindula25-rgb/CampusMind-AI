/**
 * CampusMind AI - Teaching Tracker
 * Track courses, assessments, student feedback and evaluations.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTeachingCourses, updateTeachingCourse } from '@/services/firestore';
import type { TeachingCourse, TeachingSession } from '@/services/firestoreTypes';
import { getMockSessionsForCourse, getMockAssessmentsForCourse } from '@/services/mockCourseData';
import CourseDetailsModal from '@/components/CourseDetailsModal';

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

export default function TeachingScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'evaluations'>('courses');
  const [courses, setCourses] = useState<TeachingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<TeachingCourse | null>(null);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const unsub = subscribeTeachingCourses(user.uid, (data) => {
      setCourses(data);
      setLoading(false);

      // Auto-patch missing sessions so older Firebase records get the new detailed fields
      data.forEach(course => {
        let needsUpdate = false;
        const updates: Partial<TeachingCourse> = {};

        if (!course.sessions || course.sessions.length < course.lectures) {
          updates.sessions = getMockSessionsForCourse(course.moduleCode);
          needsUpdate = true;
        }

        // Check if assessments are missing description/score properties
        if (course.assessments && course.assessments.length > 0 && course.assessments[0].description === undefined) {
          updates.assessments = getMockAssessmentsForCourse(course.moduleCode);
          if (updates.assessments.length > 0) {
             needsUpdate = true;
          }
        }

        if (needsUpdate && course.id) {
          updateTeachingCourse(course.id, updates);
        }
      });
    });
    return () => unsub();
  }, [user?.uid]);

  const activeCourses = courses.filter(c => c.status === 'active');
  const completedCourses = courses.filter(c => c.status === 'completed');
  const totalContactHours = courses.reduce((s, c) => s + c.contactHours, 0);
  const avgRating = courses.length > 0
    ? (courses.reduce((s, c) => s + c.averageRating, 0) / courses.length).toFixed(1)
    : '—';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.header}>
        <Text style={styles.headerTitle}>Teaching</Text>
        <Text style={styles.headerSubtitle}>Courses, assessments & evaluations</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => setActiveTab('courses')}>
            <Text style={styles.statValue}>{activeCourses.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => setActiveTab('courses')}>
            <Text style={styles.statValue}>{completedCourses.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalContactHours}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={() => setActiveTab('evaluations')}>
            <Text style={styles.statValue}>{avgRating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'courses' && styles.tabActive]} onPress={() => setActiveTab('courses')}>
          <Text style={[styles.tabText, activeTab === 'courses' && styles.tabTextActive]}>Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'evaluations' && styles.tabActive]} onPress={() => setActiveTab('evaluations')}>
          <Text style={[styles.tabText, activeTab === 'evaluations' && styles.tabTextActive]}>Evaluations</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'courses' ? (
            <>
              {courses.map((course) => (
                <TouchableOpacity key={course.id} style={styles.courseCard} activeOpacity={0.7} onPress={() => setSelectedCourse(course)}>
                  <View style={styles.courseHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseCode}>{course.moduleCode}</Text>
                      <Text style={styles.courseName}>{course.courseName}</Text>
                      <Text style={styles.courseSemester}>{course.semester}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: course.status === 'active' ? '#D1FAE5' : '#E0E7FF' }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: course.status === 'active' ? '#059669' : '#4F46E5' }}>
                        {course.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.hoursRow}>
                    <View style={styles.hourItem}>
                      <MaterialIcons name="menu-book" size={14} color="#7C3AED" />
                      <Text style={styles.hourText}>{course.lectures} Lectures</Text>
                    </View>
                    <View style={styles.hourItem}>
                      <MaterialIcons name="people" size={14} color="#3B82F6" />
                      <Text style={styles.hourText}>{course.tutorials} Tutorials</Text>
                    </View>
                    <View style={styles.hourItem}>
                      <MaterialIcons name="science" size={14} color="#10B981" />
                      <Text style={styles.hourText}>{course.practicals} Practicals</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionLabel}>Assessments</Text>
                  {(course.assessments || []).map((a, i) => (
                    <View key={i} style={styles.assessmentRow}>
                      <MaterialIcons name={ASSESSMENT_ICONS[a.type] || 'assignment'} size={16} color="#64748B" />
                      <Text style={styles.assessmentName}>{a.name}</Text>
                      <Text style={styles.assessmentWeight}>{a.weight}%</Text>
                      {a.status && (
                        <View style={[styles.miniStatus, { backgroundColor: (STATUS_COLORS[a.status] || STATUS_COLORS.upcoming).bg }]}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: (STATUS_COLORS[a.status] || STATUS_COLORS.upcoming).text }}>
                            {(a.status || '').replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {course.averageRating > 0 && (
                    <View style={styles.ratingRow}>
                      <MaterialIcons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingText}>{course.averageRating.toFixed(1)} avg rating</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {courses.length === 0 && (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <MaterialIcons name="menu-book" size={48} color="#CBD5E1" />
                  <Text style={{ color: '#94A3B8', marginTop: 8 }}>No teaching courses yet</Text>
                </View>
              )}
            </>
          ) : (
            <>
              {courses.filter(c => (c.studentFeedback || []).length > 0).map((course) => (
                <View key={course.id} style={styles.courseCard}>
                  <Text style={styles.courseCode}>{course.moduleCode} — {course.courseName}</Text>
                  <View style={styles.evalHeader}>
                    <View style={styles.evalRating}>
                      <MaterialIcons name="star" size={28} color="#F59E0B" />
                      <Text style={styles.evalRatingText}>{course.averageRating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.evalCount}>{(course.studentFeedback || []).length} reviews</Text>
                  </View>
                  {(course.studentFeedback || []).map((fb, i) => (
                    <View key={i} style={styles.feedbackItem}>
                      <View style={styles.fbRatingBadge}>
                        <MaterialIcons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.fbRatingText}>{fb.rating}</Text>
                      </View>
                      <Text style={styles.feedbackText}>&quot;{fb.comment}&quot;</Text>
                    </View>
                  ))}
                </View>
              ))}
              {courses.filter(c => (c.studentFeedback || []).length > 0).length === 0 && (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <MaterialIcons name="rate-review" size={48} color="#CBD5E1" />
                  <Text style={{ color: '#94A3B8', marginTop: 8 }}>No evaluations yet</Text>
                </View>
              )}
            </>
          )}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      )}

      <CourseDetailsModal 
        visible={!!selectedCourse} 
        onClose={() => setSelectedCourse(null)} 
        course={selectedCourse} 
      />
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
  headerSubtitle: { fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', gap: 2 },
  statValue: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.extrabold, color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.full },
  tabActive: { backgroundColor: '#7C3AED18' },
  tabText: { fontSize: Typography.sizes.md, color: '#64748B', fontWeight: Typography.weights.medium },
  tabTextActive: { color: '#7C3AED', fontWeight: Typography.weights.bold },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  courseCard: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  courseCode: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, color: '#7C3AED', marginBottom: 2 },
  courseName: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  courseSemester: { fontSize: Typography.sizes.xs, color: '#64748B', marginTop: 2 },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  hoursRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: BorderRadius.md, padding: Spacing.sm, gap: Spacing.md, marginBottom: Spacing.md },
  hourItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hourText: { fontSize: Typography.sizes.xs, color: '#64748B' },
  sectionLabel: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, color: '#94A3B8', marginBottom: Spacing.sm, letterSpacing: 0.5 },
  assessmentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  assessmentName: { flex: 1, fontSize: Typography.sizes.sm, color: '#1A1A2E' },
  assessmentWeight: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: '#64748B' },
  miniStatus: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  ratingText: { fontSize: Typography.sizes.sm, color: '#F59E0B', fontWeight: Typography.weights.semibold },
  evalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.md },
  evalRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  evalRatingText: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.extrabold, color: '#1A1A2E' },
  evalCount: { fontSize: Typography.sizes.sm, color: '#64748B' },
  feedbackItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  fbRatingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  fbRatingText: { fontSize: 10, fontWeight: '700', color: '#D97706' },
  feedbackText: { flex: 1, fontSize: Typography.sizes.sm, color: '#475569', fontStyle: 'italic', lineHeight: 20 },
});
