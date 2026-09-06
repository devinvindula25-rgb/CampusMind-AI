import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { Publication, UserProfile } from '@/services/firestoreTypes';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import GlassCard from '@/components/GlassCard';
import PublicationDetailsModal from '@/components/PublicationDetailsModal';

type PopulatedPublication = Publication & { authorName?: string };

export default function DirectoryPublicationsScreen() {
  const [publications, setPublications] = useState<PopulatedPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPublication, setSelectedPublication] = useState<PopulatedPublication | null>(null);
  
  const { Typography, BrandColors, isDark } = useThemeEngine();

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch Users to map author names
        const usersSnap = await getDocs(query(collection(db, 'users')));
        const userMap = new Map<string, string>();
        usersSnap.forEach((doc) => {
          userMap.set(doc.id, doc.data().name);
        });

        // Fetch Publications
        const pubsSnap = await getDocs(query(collection(db, 'publications')));
        const pubs: PopulatedPublication[] = [];
        pubsSnap.forEach((doc) => {
          const data = doc.data() as Publication;
          pubs.push({
            ...data,
            id: doc.id,
            authorName: userMap.get(data.userId) || 'Unknown Author'
          });
        });

        // Sort descending by year
        pubs.sort((a, b) => b.year - a.year);
        setPublications(pubs);
      } catch (err) {
        console.error('Failed to load publications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenDOI = (doi?: string) => {
    if (doi) {
      const url = doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
      Linking.openURL(url).catch(() => console.log('Invalid URL'));
    }
  };

  const renderPublicationCard = ({ item }: { item: PopulatedPublication }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => setSelectedPublication(item)}
    >
      <GlassCard 
        style={styles.card}
        isDark={isDark}
        intensity={isDark ? 30 : 70}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.titleText, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
              {item.title}
            </Text>
            <Text style={[styles.authorText, { fontSize: Typography.sizes.sm, color: BrandColors.accent }]}>
              {item.authorName} {item.coAuthors && item.coAuthors.length > 0 ? `et al.` : ''}
            </Text>
          </View>
          <View style={styles.yearBadge}>
            <Text style={[styles.yearText, { color: BrandColors.accent, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold }]}>
              {item.year}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.journalContainer}>
            <MaterialIcons name="menu-book" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={[styles.journalText, { fontSize: Typography.sizes.sm, color: isDark ? '#94A3B8' : '#64748B' }]}>
              {item.journal}
            </Text>
          </View>
          {item.doi && (
            <TouchableOpacity onPress={() => handleOpenDOI(item.doi)} style={styles.doiButton}>
              <Text style={[styles.doiText, { color: BrandColors.accent, fontSize: Typography.sizes.xs }]}>
                DOI <MaterialIcons name="open-in-new" size={12} color={BrandColors.accent} />
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: Typography.sizes['3xl'], fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
          Publications Feed
        </Text>
        <Text style={[styles.subtitle, { fontSize: Typography.sizes.md, color: isDark ? '#94A3B8' : '#64748B' }]}>
          Latest research from across the institution.
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <FlatList
          data={publications}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderPublicationCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="article" size={64} color={isDark ? '#334155' : '#E2E8F0'} />
              <Text style={[styles.emptyText, { fontSize: Typography.sizes.lg, color: isDark ? '#94A3B8' : '#64748B' }]}>
                No publications found.
              </Text>
            </View>
          }
        />
      )}
      
      <PublicationDetailsModal 
        visible={!!selectedPublication}
        publication={selectedPublication}
        onClose={() => setSelectedPublication(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingLeft: 68, paddingRight: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {},
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100, // For floating tab bar
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  titleText: {
    marginBottom: 4,
  },
  authorText: {},
  yearBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  yearText: {},
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  journalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  journalText: {
    flex: 1,
  },
  doiButton: {
    padding: 4,
  },
  doiText: {
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: Spacing['4xl'],
  },
  emptyText: {
    marginTop: Spacing.md,
  },
});
