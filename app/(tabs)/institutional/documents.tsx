/**
 * CampusMind AI - QA Documents Repository
 * Centralized, searchable repository for QA evidence and policies.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { subscribeQADocuments } from '@/services/firestore';
import type { QADocument } from '@/services/firestoreTypes';
import GlassCard from '@/components/GlassCard';
import DocumentDetailsModal from '@/components/DocumentDetailsModal';

const CATEGORIES = ['All', 'policy', 'procedure', 'template', 'guideline', 'evidence'];

const FILE_ICONS: Record<string, { icon: keyof typeof MaterialIcons.glyphMap; color: string }> = {
  pdf: { icon: 'picture-as-pdf', color: '#EF4444' },
  docx: { icon: 'description', color: '#3B82F6' },
  xlsx: { icon: 'table-chart', color: '#10B981' },
  zip: { icon: 'folder-zip', color: '#F59E0B' },
};

export default function DocumentsScreen() {
  const { user } = useAuth();
  const { isDark, Typography, BrandColors: localColors } = useThemeEngine();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<QADocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<QADocument | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const departmentId = 'cs-dept';
    const unsub = subscribeQADocuments(departmentId, (data) => {
      setDocuments(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filtered = documents.filter((doc) => {
    const matchesCategory = activeCategory === 'All' || doc.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <Text style={styles.headerTitle}>QA Documents</Text>
        <Text style={styles.headerSubtitle}>{documents.length} documents • Centralized repository</Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, isDark && styles.categoryChipDark, activeCategory === cat && styles.categoryChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.categoryText, isDark && styles.textMutedDark, activeCategory === cat && styles.categoryTextActive]}>
              {cat === 'All' ? cat : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Document List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No documents found</Text>
          </View>
        ) : (
          filtered.map((doc) => {
            const fileType = doc.category === 'template' ? 'docx' : 'pdf';
            const fileConfig = FILE_ICONS[fileType] || { icon: 'insert-drive-file', color: '#64748B' };
            const formattedDate = new Date(doc.createdAt).toISOString().split('T')[0];

            return (
              <TouchableOpacity key={doc.id} activeOpacity={0.7} onPress={() => setSelectedDoc(doc)}>
                <GlassCard 
                  style={styles.docCard} 
                  isDark={isDark} 
                  intensity={isDark ? 30 : 90}
                >
                  <View style={[styles.fileIcon, { backgroundColor: fileConfig.color + '12' }]}>
                    <MaterialIcons name={fileConfig.icon} size={22} color={fileConfig.color} />
                  </View>
                  <View style={styles.docContent}>
                    <Text style={[styles.docName, isDark && styles.textDark]} numberOfLines={1}>{doc.title}</Text>
                    <Text style={[styles.docMeta, isDark && styles.textMutedDark]}>{doc.category.charAt(0).toUpperCase() + doc.category.slice(1)} • v{doc.version} • {formattedDate}</Text>
                    <Text style={[styles.docUploader, isDark && { color: '#475569' }]}>Uploaded by Admin</Text>
                  </View>
                  <TouchableOpacity style={styles.downloadButton}>
                    <MaterialIcons name="download" size={20} color={BrandColors.accent} />
                  </TouchableOpacity>
                </GlassCard>
              </TouchableOpacity>
            );
          })
        )}

        {/* Upload Button */}
        <TouchableOpacity 
          style={styles.uploadButton} 
          activeOpacity={0.8}
          onPress={() => {
            if (Platform.OS === 'web') alert('Upload dialog opened');
            else Alert.alert('Upload', 'Upload dialog opened');
          }}
        >
          <LinearGradient colors={[BrandColors.secondary, BrandColors.accent]} style={styles.uploadGradient}>
            <MaterialIcons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.uploadText}>Upload Document</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
      
      <DocumentDetailsModal 
        visible={!!selectedDoc} 
        document={selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
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
  headerSubtitle: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginTop: 2, marginBottom: Spacing.lg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, gap: Spacing.sm,
  },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontSize: Typography.sizes.md, color: '#fff' },
  categoryScroll: { maxHeight: 48 },
  categoryContent: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, gap: Spacing.sm },
  categoryChip: {
    paddingHorizontal: Spacing.base, paddingVertical: 6,
    borderRadius: BorderRadius.full, backgroundColor: '#F1F5F9',
  },
  categoryChipDark: { backgroundColor: '#1E293B' },
  categoryChipActive: { backgroundColor: BrandColors.secondary },
  categoryText: { fontSize: Typography.sizes.sm, color: '#64748B', fontWeight: Typography.weights.medium },
  categoryTextActive: { color: '#fff', fontWeight: Typography.weights.bold },
  scroll: { flex: 1, paddingHorizontal: Spacing.xl },
  scrollContent: { paddingVertical: Spacing.xl, paddingBottom: 180, gap: Spacing.md },
  docCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  fileIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center',
  },
  docContent: { flex: 1 },
  docName: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: '#1A1A2E' },
  textDark: { color: '#F1F5F9' },
  textMutedDark: { color: '#94A3B8' },
  docMeta: { fontSize: Typography.sizes.xs, color: '#94A3B8', marginTop: 2 },
  docUploader: { fontSize: Typography.sizes.xs, color: '#CBD5E1', marginTop: 1 },
  downloadButton: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    backgroundColor: BrandColors.accent + '12', justifyContent: 'center', alignItems: 'center',
  },
  uploadButton: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.lg },
  uploadGradient: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: Spacing.base, gap: Spacing.sm,
  },
  uploadText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.sizes.md, color: '#94A3B8' },
});
