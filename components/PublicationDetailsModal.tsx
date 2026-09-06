import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeEngine } from '@/contexts/SettingsContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Publication } from '@/services/firestoreTypes';

interface PublicationDetailsModalProps {
  visible: boolean;
  publication: (Publication & { authorName?: string }) | null;
  onClose: () => void;
}

export default function PublicationDetailsModal({ visible, publication, onClose }: PublicationDetailsModalProps) {
  const { Typography, BrandColors, isDark } = useThemeEngine();

  if (!publication) return null;

  const handleOpenLink = (url?: string) => {
    if (url) {
      const validUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(validUrl).catch(err => console.error("Couldn't load page", err));
    }
  };

  const handleOpenDOI = (doi?: string) => {
    if (doi) {
      const url = doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
      Linking.openURL(url).catch(() => console.log('Invalid URL'));
    }
  };

  const allAuthors = publication.authors && publication.authors.length > 0 
    ? publication.authors 
    : [
        publication.authorName || 'Unknown Author',
        ...(publication.coAuthors || [])
      ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={[styles.badge, { backgroundColor: BrandColors.accent + '20' }]}>
                <Text style={[styles.badgeText, { color: BrandColors.accent, fontSize: Typography.sizes.xs }]}>
                  {publication.status.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
                <MaterialIcons name="close" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.title, { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
              {publication.title}
            </Text>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Metadata Card */}
            <View style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.metaRow}>
                <MaterialIcons name="menu-book" size={20} color={BrandColors.accent} />
                <View style={styles.metaTextContainer}>
                  <Text style={[styles.metaLabel, { fontSize: Typography.sizes.xs, color: isDark ? '#94A3B8' : '#64748B' }]}>Journal / Conference</Text>
                  <Text style={[styles.metaValue, { fontSize: Typography.sizes.md, color: isDark ? '#F1F5F9' : '#0F172A' }]}>{publication.journal}</Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <MaterialIcons name="event" size={20} color={BrandColors.secondary} />
                <View style={styles.metaTextContainer}>
                  <Text style={[styles.metaLabel, { fontSize: Typography.sizes.xs, color: isDark ? '#94A3B8' : '#64748B' }]}>Year</Text>
                  <Text style={[styles.metaValue, { fontSize: Typography.sizes.md, color: isDark ? '#F1F5F9' : '#0F172A' }]}>{publication.year}</Text>
                </View>
              </View>
            </View>

            {/* Authors */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
                Authors
              </Text>
              <View style={styles.authorsContainer}>
                {allAuthors.map((author, index) => (
                  <View key={index} style={[styles.authorChip, isDark && styles.authorChipDark]}>
                    <MaterialIcons name="person" size={16} color={isDark ? '#94A3B8' : '#475569'} />
                    <Text style={[styles.authorText, { fontSize: Typography.sizes.sm, color: isDark ? '#E2E8F0' : '#334155' }]}>
                      {author}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Abstract */}
            {publication.abstract && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
                  Abstract
                </Text>
                <Text style={[styles.abstractText, { fontSize: Typography.sizes.md, color: isDark ? '#CBD5E1' : '#475569' }]}>
                  {publication.abstract}
                </Text>
              </View>
            )}

            {/* Identifiers */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
                Identifiers & Links
              </Text>
              <View style={styles.identifiersContainer}>
                
                {publication.doi && (
                  <TouchableOpacity onPress={() => handleOpenDOI(publication.doi)} activeOpacity={0.7}>
                    <View style={[styles.identifierCard, isDark && styles.cardDark]}>
                      <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                        <MaterialIcons name="link" size={24} color={BrandColors.accent} />
                      </View>
                      <View style={styles.identifierInfo}>
                        <Text style={[styles.identifierLabel, { fontSize: Typography.sizes.xs, color: isDark ? '#94A3B8' : '#64748B' }]}>DOI</Text>
                        <Text style={[styles.identifierValue, { fontSize: Typography.sizes.sm, color: isDark ? '#F1F5F9' : '#0F172A' }]}>{publication.doi}</Text>
                      </View>
                      <MaterialIcons name="open-in-new" size={20} color={isDark ? '#475569' : '#CBD5E1'} />
                    </View>
                  </TouchableOpacity>
                )}

                {publication.isbn && (
                  <View style={[styles.identifierCard, isDark && styles.cardDark]}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                      <MaterialIcons name="qr-code" size={24} color="#EF4444" />
                    </View>
                    <View style={styles.identifierInfo}>
                      <Text style={[styles.identifierLabel, { fontSize: Typography.sizes.xs, color: isDark ? '#94A3B8' : '#64748B' }]}>ISBN</Text>
                      <Text style={[styles.identifierValue, { fontSize: Typography.sizes.sm, color: isDark ? '#F1F5F9' : '#0F172A' }]}>{publication.isbn}</Text>
                    </View>
                  </View>
                )}

                {publication.url && (
                  <TouchableOpacity onPress={() => handleOpenLink(publication.url)} activeOpacity={0.7}>
                    <View style={[styles.identifierCard, isDark && styles.cardDark]}>
                      <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <FontAwesome5 name="external-link-alt" size={20} color="#10B981" />
                      </View>
                      <View style={styles.identifierInfo}>
                        <Text style={[styles.identifierLabel, { fontSize: Typography.sizes.xs, color: isDark ? '#94A3B8' : '#64748B' }]}>External Source</Text>
                        <Text style={[styles.identifierValue, { fontSize: Typography.sizes.sm, color: isDark ? '#F1F5F9' : '#0F172A' }]}>View on ResearchGate/ORCID</Text>
                      </View>
                      <MaterialIcons name="open-in-new" size={20} color={isDark ? '#475569' : '#CBD5E1'} />
                    </View>
                  </TouchableOpacity>
                )}
                
                {!publication.doi && !publication.isbn && !publication.url && (
                  <Text style={[styles.metaLabel, { fontSize: Typography.sizes.sm, color: isDark ? '#94A3B8' : '#64748B' }]}>No identifiers available.</Text>
                )}
              </View>
            </View>

            {/* Publication Details */}
            {(publication.publisher || publication.volume || publication.issue || publication.pages) && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
                  Publication Details
                </Text>
                <View style={[styles.detailsCard, isDark && styles.cardDark]}>
                  {publication.publisher && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Publisher:</Text>
                      <Text style={[styles.detailValue, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{publication.publisher}</Text>
                    </View>
                  )}
                  {publication.volume && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Volume:</Text>
                      <Text style={[styles.detailValue, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{publication.volume}</Text>
                    </View>
                  )}
                  {publication.issue && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Issue:</Text>
                      <Text style={[styles.detailValue, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{publication.issue}</Text>
                    </View>
                  )}
                  {publication.pages && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Pages:</Text>
                      <Text style={[styles.detailValue, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{publication.pages}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Keywords */}
            {publication.keywords && publication.keywords.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
                  Keywords
                </Text>
                <View style={styles.keywordsContainer}>
                  {publication.keywords.map((kw, i) => (
                    <View key={i} style={[styles.keywordBadge, isDark && styles.keywordBadgeDark]}>
                      <Text style={[styles.keywordText, { color: isDark ? '#CBD5E1' : '#475569' }]}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    height: '85%',
    ...Shadows.lg,
  },
  modalContentDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    padding: 6,
    borderRadius: 20,
  },
  title: {
    lineHeight: 32,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
    gap: Spacing.xl,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaTextContainer: {
    flex: 1,
  },
  metaLabel: {
    marginBottom: 2,
  },
  metaValue: {
    fontWeight: '500',
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {},
  authorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  authorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  authorChipDark: {
    backgroundColor: '#1E293B',
  },
  authorText: {
    fontWeight: '500',
  },
  abstractText: {
    lineHeight: 24,
  },
  identifiersContainer: {
    gap: Spacing.sm,
  },
  identifierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  identifierInfo: {
    flex: 1,
  },
  identifierLabel: {
    marginBottom: 2,
  },
  identifierValue: {
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#F8FAFC',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontWeight: '500',
  },
  detailValue: {
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.md,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  keywordBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  keywordBadgeDark: {
    backgroundColor: '#334155',
  },
  keywordText: {
    fontSize: 13,
    fontWeight: '500',
  }
});
