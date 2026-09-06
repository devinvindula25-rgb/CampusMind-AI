/**
 * CampusMind AI - Compliance Reports
 * AI-assisted report generation for governing educational bodies.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { subscribeComplianceReports, updateComplianceReport, createComplianceReport } from '@/services/firestore';
import type { ComplianceReport } from '@/services/firestoreTypes';
import { generateComplianceReport } from '@/services/gemini';
import { getMockRichReport } from '@/services/mockReportData';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import GlassCard from '@/components/GlassCard';
import ReportDetailsModal from '@/components/ReportDetailsModal';

const REPORT_TEMPLATES = [
  { id: '1', name: 'Annual Programme Monitoring Report', body: 'QAA', icon: 'assessment' as const },
  { id: '2', name: 'Self-Evaluation Document (SED)', body: 'QAA', icon: 'rate-review' as const },
  { id: '3', name: 'ABET Self-Study Report', body: 'ABET', icon: 'school' as const },
  { id: '4', name: 'External Examiner Response', body: 'University', icon: 'reply' as const },
  { id: '5', name: 'Student Satisfaction Action Plan', body: 'NSS', icon: 'feedback' as const },
];

export default function ReportsScreen() {
  const { user } = useAuth();
  const { isDark, Typography, BrandColors: localColors } = useThemeEngine();
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [previewReport, setPreviewReport] = useState<ComplianceReport | null>(null);

  React.useEffect(() => {
    const departmentId = 'cs-dept';
    const unsub = subscribeComplianceReports(departmentId, async (data) => {
      let needsUpdate = false;
      
      const workingData = await Promise.all(data.map(async (item) => {
        if (!item.executiveSummary) {
          const rich = getMockRichReport(item);
          try {
            await updateDoc(doc(db, 'complianceReports', item.id!), {
              executiveSummary: rich.executiveSummary,
              aiConfidenceScore: rich.aiConfidenceScore,
              sections: rich.sections,
              generationDate: rich.generationDate
            });
            needsUpdate = true;
          } catch (e) {
            console.error('Failed to auto-patch report', e);
          }
          return { ...item, ...rich };
        }
        return item;
      }));

      if (!needsUpdate) {
        setReports(workingData);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleSendToQA = (report: ComplianceReport) => {
    const actionName = 'Approve & Send to QA';
    const message = `Are you sure you want to finalize "${report.title}" and send it to QA?`;

    const confirmAction = async () => {
      if (report.id) {
        await updateComplianceReport(report.id, { status: 'submitted' }); // using 'submitted' as per interface
        if (Platform.OS !== 'web') Alert.alert('Success', 'Report finalized and sent to QA Docs.');
        setPreviewReport(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(message)) confirmAction();
    } else {
      Alert.alert(`Confirm ${actionName}`, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'default', onPress: confirmAction }
      ]);
    }
  };

  const handleGenerate = (template: typeof REPORT_TEMPLATES[0]) => {
    const message = `Generate a "${template.name}" using AI?\n\nThis will create a draft based on your department data and the ${template.body} template.`;
    
    const confirmAction = async () => {
      setLoading(true);
      try {
        const content = await generateComplianceReport(template.name, {
          name: 'Computer Science BSc',
          department: 'Computer Science',
          metrics: { studentSatisfaction: '85%', dropoutRate: '2%' }
        });
        
        const newDraft = {
          departmentId: 'cs-dept',
          title: `${template.name} - ${new Date().getFullYear()}`,
          reportType: 'annual' as const,
          status: 'draft' as const,
          period: new Date().getFullYear().toString(),
          summary: content,
          createdBy: 'System AI',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Note: the auto-patcher will catch this new report and inject the rich sections!
        await createComplianceReport('cs-dept', newDraft as any);
        
        setActiveTab('history');
      } catch (e) {
        if (Platform.OS !== 'web') Alert.alert('Error', 'Failed to generate report.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(message)) confirmAction();
    } else {
      Alert.alert(
        'Generate Report',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Generate', onPress: confirmAction },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <Text style={styles.headerTitle}>Compliance Reports</Text>
        <Text style={styles.headerSubtitle}>AI-assisted report generation</Text>
      </LinearGradient>

      <View style={[styles.tabRow, isDark && styles.tabRowDark]}>
        <TouchableOpacity style={[styles.tab, activeTab === 'generate' && styles.tabActive, activeTab === 'generate' && isDark && styles.tabActiveDark]} onPress={() => setActiveTab('generate')}>
          <Text style={[styles.tabText, isDark && styles.textMutedDark, activeTab === 'generate' && styles.tabTextActive]}>Generate New</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.tabActive, activeTab === 'history' && isDark && styles.tabActiveDark]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, isDark && styles.textMutedDark, activeTab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'generate' ? (
          <>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Report Templates</Text>
            <Text style={[styles.sectionSubtitle, isDark && styles.textMutedDark]}>Select a template to generate an AI-drafted compliance report</Text>
            {REPORT_TEMPLATES.map((t) => (
              <TouchableOpacity key={t.id} onPress={() => handleGenerate(t)} activeOpacity={0.7}>
                <GlassCard style={styles.templateCard} isDark={isDark} intensity={isDark ? 30 : 90}>
                  <View style={styles.templateIcon}>
                    <MaterialIcons name={t.icon} size={24} color={BrandColors.secondary} />
                  </View>
                  <View style={styles.templateContent}>
                    <Text style={[styles.templateName, isDark && styles.textDark]}>{t.name}</Text>
                    <Text style={[styles.templateBody, isDark && styles.textMutedDark]}>{t.body}</Text>
                  </View>
                  <LinearGradient colors={[BrandColors.secondary, BrandColors.accent]} style={styles.generateChip}>
                    <MaterialIcons name="auto-awesome" size={14} color="#fff" />
                    <Text style={styles.generateChipText}>AI</Text>
                  </LinearGradient>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Report History</Text>
            {loading ? <ActivityIndicator color={BrandColors.secondary} style={{ marginTop: 20 }} /> : null}
            {reports.map((r) => (
              <TouchableOpacity key={r.id} activeOpacity={0.7} onPress={() => setPreviewReport(r)}>
                <GlassCard style={styles.historyCard} isDark={isDark} intensity={isDark ? 30 : 90}>
                  <View style={styles.historyHeader}>
                    <Text style={[styles.historyName, isDark && styles.textDark]}>{r.title}</Text>
                    <View style={[styles.versionBadge, r.status === 'submitted' ? styles.versionFinal : styles.versionDraft]}>
                      <Text style={[styles.versionText, { color: r.status === 'submitted' ? BrandColors.success : BrandColors.warning }]}>
                        {r.status === 'submitted' ? 'Final' : 'Draft'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.historyMeta, isDark && styles.textMutedDark]}>
                    {r.reportType ? r.reportType.toUpperCase() : 'REPORT'} • {r.generationDate ? new Date(r.generationDate).toLocaleDateString() : r.period}
                  </Text>
                  <View style={styles.historyActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => setPreviewReport(r)}>
                      <MaterialIcons name="visibility" size={16} color={BrandColors.accent} />
                      <Text style={styles.actionText}>Preview</Text>
                    </TouchableOpacity>
                    {r.status === 'draft' && (
                      <TouchableOpacity style={styles.actionButton} onPress={() => handleSendToQA(r)}>
                        <MaterialIcons name="send" size={16} color={BrandColors.success} />
                        <Text style={[styles.actionText, { color: BrandColors.success }]}>Send to QA</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </>
        )}
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>

      {/* Deep Rich Modal */}
      <ReportDetailsModal 
        visible={!!previewReport}
        onClose={() => setPreviewReport(null)}
        report={previewReport}
        onSendToQA={(reportId) => handleSendToQA(reports.find(r => r.id === reportId)!)}
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
  tabRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  tabRowDark: { borderBottomColor: '#1E293B' },
  tab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, alignItems: 'center' },
  tabActive: { backgroundColor: BrandColors.secondary + '15' },
  tabActiveDark: { backgroundColor: '#1E293B' },
  tabText: { fontSize: Typography.sizes.md, color: '#94A3B8', fontWeight: Typography.weights.medium },
  tabTextActive: { color: BrandColors.secondary, fontWeight: Typography.weights.bold },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: 120 },
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginBottom: 4 },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  sectionSubtitle: { fontSize: Typography.sizes.sm, color: '#64748B', marginBottom: Spacing.lg },
  templateCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.md,
    gap: Spacing.md, ...Shadows.sm,
  },
  templateIcon: {
    width: 48, height: 48, borderRadius: BorderRadius.md, backgroundColor: BrandColors.secondary + '12',
    justifyContent: 'center', alignItems: 'center',
  },
  templateContent: { flex: 1 },
  templateName: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: '#1A1A2E' },
  templateBody: { fontSize: Typography.sizes.xs, color: '#94A3B8', marginTop: 2 },
  generateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
  },
  generateChipText: { fontSize: 11, fontWeight: Typography.weights.bold, color: '#fff' },
  historyCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  historyName: { flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginRight: Spacing.sm },
  versionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  versionFinal: { backgroundColor: BrandColors.successBg },
  versionDraft: { backgroundColor: BrandColors.warningBg },
  versionText: { fontSize: 10, fontWeight: Typography.weights.bold },
  historyMeta: { fontSize: Typography.sizes.sm, color: '#64748B', marginBottom: Spacing.md },
  historyActions: { flexDirection: 'row', gap: Spacing.md },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: Typography.sizes.sm, color: BrandColors.accent, fontWeight: Typography.weights.semibold },
});
