import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { QADocument } from '@/services/firestoreTypes';

interface Props {
  visible: boolean;
  onClose: () => void;
  document: QADocument | null;
}

export default function DocumentDetailsModal({ visible, onClose, document: doc }: Props) {
  const { isDark, BrandColors: Colors } = useThemeEngine();

  if (!doc) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { label: 'Active', color: BrandColors.success, bg: BrandColors.successBg };
      case 'draft': return { label: 'Draft', color: BrandColors.warning, bg: BrandColors.warningBg };
      case 'archived': return { label: 'Archived', color: BrandColors.error, bg: BrandColors.errorBg };
      case 'under_review': return { label: 'Under Review', color: BrandColors.info, bg: BrandColors.infoBg };
      default: return { label: status, color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const statusConfig = getStatusConfig(doc.status);
  const formattedDate = new Date(doc.createdAt).toLocaleDateString();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Header Section */}
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : [BrandColors.primary, '#1E40AF']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.badgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.categoryName}>{doc.category.toUpperCase()}</Text>
              <Text style={styles.title}>{doc.title}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="update" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>v{doc.version}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="person" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>By: {doc.createdBy}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="event" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaText}>{formattedDate}</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.contentSection}>
              
              {/* AI Summary */}
              {doc.aiSummary && (
                <View style={[styles.summaryBox, isDark && styles.summaryBoxDark]}>
                  <View style={styles.summaryHeader}>
                    <MaterialIcons name="auto-awesome" size={20} color={BrandColors.secondary} />
                    <Text style={[styles.summaryTitle, isDark && styles.textDark]}>AI Document Summary</Text>
                  </View>
                  <Text style={[styles.summaryText, isDark && styles.textMutedDark]}>{doc.aiSummary}</Text>
                </View>
              )}

              {/* Version History */}
              {doc.versionHistory && doc.versionHistory.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Version History</Text>
                  <View style={styles.historyList}>
                    {doc.versionHistory.map((vh, idx) => (
                      <View key={idx} style={[styles.historyCard, isDark && styles.historyCardDark]}>
                        <View style={styles.historyHeaderRow}>
                          <Text style={[styles.historyVersion, isDark && styles.textDark]}>Version {vh.version}</Text>
                          <Text style={styles.historyDate}>{new Date(vh.date).toLocaleDateString()}</Text>
                        </View>
                        <Text style={[styles.historyChanges, isDark && styles.textMutedDark]}>{vh.changes}</Text>
                        <View style={styles.historyAuthorRow}>
                          <MaterialIcons name="edit" size={12} color="#94A3B8" />
                          <Text style={styles.historyAuthor}>Modified by: {vh.author}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Evidence Files */}
              {doc.evidenceFiles && doc.evidenceFiles.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, isDark && styles.textDark, { marginTop: Spacing.lg }]}>Supporting Evidence</Text>
                  <View style={styles.evidenceList}>
                    {doc.evidenceFiles.map((ev, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={[styles.evidenceCard, isDark && styles.evidenceCardDark]}
                        onPress={() => Linking.openURL(ev.url).catch(err => console.error("Couldn't load page", err))}
                      >
                        <MaterialIcons name="attach-file" size={20} color={BrandColors.accent} />
                        <Text style={[styles.evidenceName, isDark && styles.textDark]}>{ev.name}</Text>
                        <MaterialIcons name="open-in-new" size={16} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.downloadBtn]}
                  onPress={() => {
                    if (doc.fileUrl) {
                      Linking.openURL(doc.fileUrl).catch(e => console.error(e));
                    } else {
                      if (Platform.OS === 'web') alert('No file attached');
                      else Alert.alert('Error', 'No file attached');
                    }
                  }}
                >
                  <MaterialIcons name="file-download" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Download ({doc.fileSize || 'Unknown'})</Text>
                </TouchableOpacity>

                {doc.status === 'under_review' && (
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => {
                      const msg = `Approve v${doc.version} of "${doc.title}"?`;
                      if (Platform.OS === 'web') {
                        if (window.confirm(msg)) onClose();
                      } else {
                        Alert.alert('Confirm Approval', msg, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Approve', onPress: onClose }
                        ]);
                      }
                    }}
                  >
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>Approve</Text>
                  </TouchableOpacity>
                )}
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
    height: '85%',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.secondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  contentSection: {
    padding: Spacing.xl,
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  summaryBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
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
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: Spacing.lg,
  },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  historyList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.primary,
  },
  historyCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  historyVersion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  historyDate: {
    fontSize: 12,
    color: '#64748B',
  },
  historyChanges: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  historyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyAuthor: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  evidenceList: { gap: Spacing.sm, marginTop: Spacing.sm },
  evidenceCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm,
    backgroundColor: '#F8FAFC', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#E2E8F0'
  },
  evidenceCardDark: { backgroundColor: '#0F172A', borderColor: '#334155' },
  evidenceName: { fontSize: 13, color: '#334155', fontWeight: '500' },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
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
  downloadBtn: {
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
});
