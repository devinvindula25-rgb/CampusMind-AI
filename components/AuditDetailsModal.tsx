import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, LayoutAnimation, UIManager, Platform, Linking } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { AuditRecord } from '@/services/firestoreTypes';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  audit: AuditRecord | null;
}

export default function AuditDetailsModal({ visible, onClose, audit }: Props) {
  const { isDark, Typography: T, BrandColors: Colors } = useThemeEngine();
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  if (!audit) return null;

  const toggleExpand = (clause: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedClause(expandedClause === clause ? null : clause);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'external': return '#3B82F6';
      case 'regulatory': return '#8B5CF6';
      case 'internal': default: return BrandColors.secondary;
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'Compliant': return BrandColors.success;
      case 'Minor Non-Conformity': return BrandColors.warning;
      case 'Major Non-Conformity': return BrandColors.error;
      case 'Observation': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const getComplianceBg = (status: string) => {
    switch (status) {
      case 'Compliant': return BrandColors.successBg;
      case 'Minor Non-Conformity': return BrandColors.warningBg;
      case 'Major Non-Conformity': return BrandColors.errorBg;
      case 'Observation': return 'rgba(59, 130, 246, 0.1)';
      default: return '#F1F5F9';
    }
  };

  const typeColor = getTypeColor(audit.auditType);
  const criteria = audit.criteria || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Header Section */}
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : [typeColor, '#1A1A2E']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.badgeText}>{audit.auditType.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.title}>{audit.auditTitle}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="event" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>{audit.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="person" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>{audit.auditor || 'Unknown Auditor'}</Text>
                </View>
              </View>

              {audit.overallScore !== undefined && (
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Compliance Score</Text>
                  <Text style={styles.scoreValue}>{audit.overallScore}%</Text>
                </View>
              )}
            </LinearGradient>

            <View style={styles.contentSection}>
              
              {audit.auditScope && (
                <View style={styles.scopeSection}>
                  <Text style={styles.detailLabel}>Audit Scope</Text>
                  <Text style={[styles.scopeText, isDark && styles.textDark]}>{audit.auditScope}</Text>
                </View>
              )}

              {audit.findings && (
                <View style={[styles.summaryBox, isDark && styles.summaryBoxDark]}>
                  <View style={styles.summaryHeader}>
                    <MaterialIcons name="assignment-turned-in" size={20} color={typeColor} />
                    <Text style={[styles.summaryTitle, isDark && styles.textDark]}>Overall Findings</Text>
                  </View>
                  <Text style={[styles.summaryText, isDark && styles.textMutedDark]}>{audit.findings}</Text>
                  
                  {audit.nonConformities !== undefined && audit.nonConformities > 0 && (
                    <View style={styles.ncRow}>
                      <MaterialIcons name="error-outline" size={16} color={BrandColors.error} />
                      <Text style={[styles.ncText, isDark && styles.textDark]}>Identified {audit.nonConformities} Non-Conformities</Text>
                    </View>
                  )}
                </View>
              )}

              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Audit Criteria & Clauses</Text>
              
              <View style={styles.criteriaList}>
                {criteria.map((crit) => {
                  const isExpanded = expandedClause === crit.clause;
                  const cColor = getComplianceColor(crit.complianceStatus);
                  const cBg = getComplianceBg(crit.complianceStatus);
                  
                  return (
                    <View key={crit.clause} style={[styles.criteriaCard, isDark && styles.criteriaCardDark, { borderLeftColor: cColor }]}>
                      <TouchableOpacity 
                        style={styles.criteriaHeader} 
                        activeOpacity={0.7} 
                        onPress={() => toggleExpand(crit.clause)}
                      >
                        <View style={styles.criteriaHeaderContent}>
                          <View style={styles.clauseRow}>
                            <Text style={[styles.clauseText, isDark && styles.textDark]}>{crit.clause}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: cBg }]}>
                              <Text style={[styles.statusBadgeText, { color: cColor }]}>{crit.complianceStatus}</Text>
                            </View>
                          </View>
                          <Text style={[styles.criteriaDesc, isDark && styles.textMutedDark]} numberOfLines={isExpanded ? undefined : 1}>
                            {crit.description}
                          </Text>
                        </View>
                        <MaterialIcons 
                          name={isExpanded ? "expand-less" : "expand-more"} 
                          size={24} 
                          color={isDark ? '#94A3B8' : '#64748B'} 
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={[styles.criteriaDetails, isDark && styles.criteriaDetailsDark]}>
                          <View style={styles.detailBlock}>
                            <Text style={styles.detailLabel}>Auditor Notes</Text>
                            <Text style={[styles.detailText, isDark && styles.textDark]}>{crit.auditorNotes}</Text>
                          </View>

                          {crit.evidenceFiles && crit.evidenceFiles.length > 0 && (
                            <View style={styles.evidenceSection}>
                              <Text style={styles.detailLabel}>Attached Evidence</Text>
                              {crit.evidenceFiles.map((ev, i) => (
                                <TouchableOpacity 
                                  key={i} 
                                  style={[styles.evidenceFile, isDark && styles.evidenceFileDark]}
                                  onPress={() => Linking.openURL(ev.url).catch(err => console.error("Couldn't load page", err))}
                                >
                                  <MaterialIcons name="attach-file" size={16} color={BrandColors.accent} />
                                  <Text style={[styles.evidenceFileName, isDark && styles.textDark]}>{ev.name}</Text>
                                  <MaterialIcons name="open-in-new" size={14} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    height: SCREEN_HEIGHT * 0.9,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  modalContainerDark: {
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  headerGradient: {
    padding: Spacing.xl,
    paddingTop: Spacing.xl + 20,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#fff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  contentSection: {
    padding: Spacing.xl,
  },
  scopeSection: {
    marginBottom: Spacing.lg,
  },
  scopeText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  summaryBoxDark: {
    backgroundColor: '#1E293B',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  summaryText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  ncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.errorBg,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  ncText: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.error,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: Spacing.lg,
  },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  criteriaList: {
    gap: Spacing.md,
  },
  criteriaCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
  },
  criteriaCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  criteriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  criteriaHeaderContent: {
    flex: 1,
  },
  clauseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  clauseText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  criteriaDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  criteriaDetails: {
    padding: Spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  criteriaDetailsDark: {
    borderTopColor: '#334155',
  },
  detailBlock: {
    marginTop: Spacing.lg,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  evidenceSection: {
    marginTop: Spacing.lg,
  },
  evidenceFile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    marginTop: 6,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  evidenceFileDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  evidenceFileName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  }
});
