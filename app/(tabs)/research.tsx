/**
 * CampusMind AI - Research Progress Assistant
 * Tracks publications, grants, conferences, ethics with AI delay predictions.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings, useThemeEngine } from '@/contexts/SettingsContext';
import { ProjectDetailsModal, PublicationDetailsModal, ConferenceDetailsModal } from '@/components/ResearchModals';
import {
  subscribeResearchProjects,
  subscribePublications,
  subscribeConferenceEvents,
  deleteResearchProject,
  deletePublication,
  deleteConferenceEvent,
} from '@/services/firestore';
import type { ResearchProject, Publication, ConferenceEvent, ConferenceEventType } from '@/services/firestoreTypes';

const EVENT_TYPE_LABELS: Record<ConferenceEventType, string> = {
  international_conference: 'International Conference',
  national_conference: 'National Conference',
  research_symposium: 'Research Symposium',
  scientific_meeting: 'Scientific Meeting',
  workshop_seminar: 'Workshop / Seminar',
  webinar_forum: 'Webinar / Forum',
  congress_meeting: 'Congress Meeting',
  methodology_workshop: 'Methodology Workshop',
  grant_writing_workshop: 'Grant-Writing Workshop',
  teaching_learning_conference: 'Teaching & Learning',
  curriculum_workshop: 'Curriculum Workshop',
  poster_presentation: 'Poster Presentation',
  oral_presentation: 'Oral Presentation',
  keynote_lecture: 'Keynote Lecture',
  panel_discussion: 'Panel Discussion',
};

const EVENT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: '#DBEAFE', text: '#2563EB' },
  attended: { bg: '#D1FAE5', text: '#059669' },
  presented: { bg: '#E0E7FF', text: '#4F46E5' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function ResearchScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'publications' | 'conferences'>('projects');
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [conferences, setConferences] = useState<ConferenceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const { resolvedTheme } = useSettings();
  const { Typography: ThemeTypography } = useThemeEngine();
  const isDark = resolvedTheme === 'dark';

  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [selectedConf, setSelectedConf] = useState<ConferenceEvent | null>(null);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    let loaded = 0;
    const checkDone = () => { loaded++; if (loaded >= 3) setLoading(false); };
    const unsub1 = subscribeResearchProjects(user.uid, (data) => { setProjects(data); checkDone(); });
    const unsub2 = subscribePublications(user.uid, (data) => { setPublications(data); checkDone(); });
    const unsub3 = subscribeConferenceEvents(user.uid, (data) => { setConferences(data); checkDone(); });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user?.uid]);

  const stats = {
    totalPublications: publications.length,
    hIndex: Math.min(publications.filter(p => p.status === 'published').length, 20),
    activeGrants: projects.filter(p => p.grant?.status === 'awarded').length,
    pendingEthics: projects.filter(p => p.ethics === 'submitted').length,
  };

  const handleDeleteProject = (p: ResearchProject) => {
    Alert.alert('Delete Project', `Delete "${p.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => p.id && deleteResearchProject(p.id) },
    ]);
  };

  const handleDeletePub = (p: Publication) => {
    Alert.alert('Delete Publication', `Delete "${p.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => p.id && deletePublication(p.id) },
    ]);
  };

  const handleDeleteConf = (e: ConferenceEvent) => {
    Alert.alert('Delete Event', `Delete "${e.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => e.id && deleteConferenceEvent(e.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <Text style={styles.headerTitle}>Research Tracker</Text>
        <Text style={styles.headerSubtitle}>Track publications, grants & ethics</Text>

        {/* Research Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="description" label="Publications" value={String(stats.totalPublications)} color={BrandColors.accent} onPress={() => setActiveTab('publications')} />
          <StatCard icon="trending-up" label="h-index" value={String(stats.hIndex)} color={BrandColors.secondary} onPress={() => setActiveTab('publications')} />
          <StatCard icon="account-balance" label="Active Grants" value={String(stats.activeGrants)} color={BrandColors.success} onPress={() => setActiveTab('projects')} />
          <StatCard icon="pending" label="Ethics Pending" value={String(stats.pendingEthics)} color={BrandColors.warning} onPress={() => setActiveTab('projects')} />
        </View>
      </LinearGradient>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'projects' && styles.tabActive]}
          onPress={() => setActiveTab('projects')}
        >
          <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'publications' && styles.tabActive]}
          onPress={() => setActiveTab('publications')}
        >
          <Text style={[styles.tabText, activeTab === 'publications' && styles.tabTextActive]}>Publications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'conferences' && styles.tabActive]}
          onPress={() => setActiveTab('conferences')}
        >
          <Text style={[styles.tabText, activeTab === 'conferences' && styles.tabTextActive]}>Conferences & Other</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'projects' ? (
            <>
              {projects.map((project) => (
                <TouchableOpacity 
                  key={project.id} 
                  style={styles.projectCard} 
                  activeOpacity={0.7} 
                  onPress={() => setSelectedProject(project)}
                  onLongPress={() => handleDeleteProject(project)}
                >
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <StatusBadge status={project.status} />
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressValue}>{project.progress}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <LinearGradient colors={[BrandColors.accent, BrandColors.secondary]} style={[styles.progressFill, { width: `${project.progress}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                    </View>
                  </View>

                  <View style={styles.metricsRow}>
                    <MetricItem icon="description" label="Pubs" value={String(project.publications)} />
                    <MetricItem icon="event" label="Conf." value={String(project.conferences)} />
                    <MetricItem icon="account-balance" label="Grant" value={project.grant?.status === 'awarded' ? '✅' : '⏳'} />
                    <MetricItem icon="policy" label="Ethics" value={project.ethics === 'approved' ? '✅' : '⏳'} />
                  </View>

                  {project.predictedDelay !== null && project.predictedDelay !== undefined && project.predictedDelay > 0 && (
                    <View style={styles.delayWarning}>
                      <MaterialIcons name="smart-toy" size={16} color={BrandColors.warning} />
                      <Text style={styles.delayWarningText}>
                        AI predicts a {project.predictedDelay}-day delay. Consider prioritizing research writing.
                      </Text>
                    </View>
                  )}

                  <View style={styles.projectFooter}>
                    <View style={styles.deadlineRow}>
                      <MaterialIcons name="schedule" size={14} color="#64748B" />
                      <Text style={styles.deadlineText}>Deadline: {project.deadline}</Text>
                    </View>
                    <Text style={styles.grantAmount}>{project.grant?.amount || '—'}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {projects.length === 0 && (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <MaterialIcons name="science" size={48} color="#CBD5E1" />
                  <Text style={{ color: '#94A3B8', marginTop: 8 }}>No research projects yet</Text>
                </View>
              )}
            </>
          ) : activeTab === 'publications' ? (
            <>
              {publications.map((pub) => (
                <TouchableOpacity 
                  key={pub.id} 
                  style={styles.pubCard} 
                  activeOpacity={0.7} 
                  onPress={() => setSelectedPub(pub)}
                  onLongPress={() => handleDeletePub(pub)}
                >
                  <View style={styles.pubIcon}>
                    <MaterialIcons name="article" size={20} color={BrandColors.secondary} />
                  </View>
                  <View style={styles.pubContent}>
                    <Text style={styles.pubTitle}>{pub.title}</Text>
                    <Text style={styles.pubJournal}>{pub.journal} • {pub.year}</Text>
                  </View>
                  <PubStatusBadge status={pub.status} />
                </TouchableOpacity>
              ))}

              {publications.length === 0 && (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <MaterialIcons name="article" size={48} color="#CBD5E1" />
                  <Text style={{ color: '#94A3B8', marginTop: 8 }}>No publications yet</Text>
                </View>
              )}
            </>
          ) : activeTab === 'conferences' ? (
            <View style={styles.conferencesContainer}>
              {conferences.length > 0 && (
                <View style={styles.liveRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE · {conferences.length} events</Text>
                </View>
              )}
              {conferences.map((evt) => {
                const statusStyle = EVENT_STATUS_COLORS[evt.status] || EVENT_STATUS_COLORS.upcoming;
                return (
                  <TouchableOpacity 
                    key={evt.id} 
                    style={styles.eventCard} 
                    activeOpacity={0.7} 
                    onPress={() => setSelectedConf(evt)}
                    onLongPress={() => handleDeleteConf(evt)}
                  >
                    <View style={styles.eventIcon}>
                      <MaterialIcons name="event" size={20} color={BrandColors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{evt.title}</Text>
                      <Text style={styles.eventMeta}>{EVENT_TYPE_LABELS[evt.eventType] || evt.eventType}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        {evt.location && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <MaterialIcons name="location-on" size={12} color="#94A3B8" />
                            <Text style={{ fontSize: 11, color: '#94A3B8' }}>{evt.location}</Text>
                          </View>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                          <MaterialIcons name="event" size={12} color="#94A3B8" />
                          <Text style={{ fontSize: 11, color: '#94A3B8' }}>{evt.date}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.confStatusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: statusStyle.text }}>
                        {evt.status.toUpperCase()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {conferences.length === 0 && (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <MaterialIcons name="event" size={48} color="#CBD5E1" />
                  <Text style={{ color: '#94A3B8', marginTop: 8 }}>No conference events yet</Text>
                </View>
              )}
            </View>
          ) : null}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      )}

      <ProjectDetailsModal visible={!!selectedProject} onClose={() => setSelectedProject(null)} isDark={isDark} Typography={ThemeTypography} project={selectedProject} />
      <PublicationDetailsModal visible={!!selectedPub} onClose={() => setSelectedPub(null)} isDark={isDark} Typography={ThemeTypography} pub={selectedPub} />
      <ConferenceDetailsModal visible={!!selectedConf} onClose={() => setSelectedConf(null)} isDark={isDark} Typography={ThemeTypography} conf={selectedConf} />
    </View>
  );
}

function StatCard({ icon, label, value, color, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string; color: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.statCard} activeOpacity={0.7} onPress={onPress}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MetricItem({ icon, label, value }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metricItem}>
      <MaterialIcons name={icon} size={16} color="#94A3B8" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { bg: BrandColors.successBg, color: BrandColors.success, label: 'Active' },
    proposed: { bg: BrandColors.infoBg, color: BrandColors.info, label: 'Proposed' },
    completed: { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'Completed' },
    delayed: { bg: BrandColors.errorBg, color: BrandColors.error, label: 'Delayed' },
  }[status] || { bg: '#eee', color: '#888', label: status };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

function PubStatusBadge({ status }: { status: string }) {
  const config = {
    published: { bg: BrandColors.successBg, color: BrandColors.success, label: 'Published' },
    accepted: { bg: BrandColors.infoBg, color: BrandColors.info, label: 'Accepted' },
    under_review: { bg: BrandColors.warningBg, color: BrandColors.warning, label: 'Under Review' },
    submitted: { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'Submitted' },
  }[status] || { bg: '#eee', color: '#888', label: status };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
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
  headerSubtitle: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginTop: 2, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.extrabold, color: '#fff' },
  statLabel: { fontSize: 10, color: '#94A3B8' },

  // Tabs
  tabContainer: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.full },
  tabActive: { backgroundColor: BrandColors.accent + '18' },
  tabText: { fontSize: Typography.sizes.md, color: '#64748B', fontWeight: Typography.weights.medium },
  tabTextActive: { color: BrandColors.accent, fontWeight: Typography.weights.bold },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },

  // Project Card
  projectCard: {
    backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md, ...Shadows.sm,
  },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  projectTitle: { flex: 1, fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginRight: Spacing.sm },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 10, fontWeight: Typography.weights.bold, textTransform: 'uppercase' },

  // Progress
  progressSection: { marginBottom: Spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: Typography.sizes.sm, color: '#64748B' },
  progressValue: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: BrandColors.accent },
  progressTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  // Metrics
  metricsRow: {
    flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: BorderRadius.md,
    padding: Spacing.md, justifyContent: 'space-around', marginBottom: Spacing.md,
  },
  metricItem: { alignItems: 'center', gap: 2 },
  metricValue: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  metricLabel: { fontSize: Typography.sizes.xs, color: '#94A3B8' },

  // Delay Warning
  delayWarning: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: BrandColors.warningBg,
    padding: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.sm, marginBottom: Spacing.md,
  },
  delayWarningText: { flex: 1, fontSize: Typography.sizes.sm, color: '#92400E', lineHeight: 20 },

  // Footer
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: Typography.sizes.sm, color: '#64748B' },
  grantAmount: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: BrandColors.success },

  // Add Button
  addButton: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.sm },
  addButtonGradient: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: Spacing.base, gap: Spacing.sm,
  },
  addButtonText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#fff' },

  // Publication Card
  pubCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.sm,
    gap: Spacing.md, ...Shadows.sm,
  },
  pubIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: BrandColors.secondary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  pubContent: { flex: 1 },
  pubTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: '#1A1A2E', marginBottom: 2 },
  pubJournal: { fontSize: Typography.sizes.xs, color: '#64748B' },

  // Conferences
  conferencesContainer: { gap: Spacing.sm },
  eventCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: BorderRadius.lg, padding: Spacing.base,
    gap: Spacing.md, ...Shadows.sm,
  },
  eventIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: BrandColors.accent + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  eventTitle: { flex: 1, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, color: '#1A1A2E' },
  eventMeta: { fontSize: Typography.sizes.xs, color: '#64748B', marginTop: 2 },
  confStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.sm, marginBottom: Spacing.sm },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { fontSize: 11, fontWeight: 'bold', color: '#EF4444', letterSpacing: 0.5 },
});
