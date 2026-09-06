import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { UserProfile } from '@/services/firestoreTypes';
import { seedDirectoryDatabase } from '@/services/seedDirectoryData';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { Spacing, BorderRadius, Shadows, RoleLabels } from '@/constants/theme';
import GlassCard from '@/components/GlassCard';

export default function DirectoryScreen() {
  const [faculty, setFaculty] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { Typography, BrandColors, isDark } = useThemeEngine();
  const router = useRouter();
  const params = useLocalSearchParams<{ department?: string }>();

  // If a department param is passed, pre-fill the search query
  useEffect(() => {
    if (params.department) {
      setSearchQuery(params.department);
    }
  }, [params.department]);

  useEffect(() => {
    async function loadDirectory() {
      try {
        await seedDirectoryDatabase();
        
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          users.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        
        // Remove duplicates by name
        const uniqueUsers = Array.from(new Map(users.map(item => [item.name, item])).values());
        
        // Sort alphabetically
        uniqueUsers.sort((a, b) => a.name.localeCompare(b.name));
        setFaculty(uniqueUsers);
      } catch (err) {
        console.error('Failed to load directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFacultyCard = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => router.push(`/directory/faculty/${item.uid}` as any)}
    >
      <GlassCard 
        style={styles.card}
        isDark={isDark}
        intensity={isDark ? 30 : 70}
      >
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={[BrandColors.accent, BrandColors.secondary]}
            style={styles.avatar}
          >
            <Text style={[styles.avatarText, { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.cardInfo}>
            <Text style={[styles.name, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
              {item.name}
            </Text>
            <Text style={[styles.role, { fontSize: Typography.sizes.sm, color: BrandColors.accent }]}>
              {item.role ? RoleLabels[item.role] : 'Lecturer'}
            </Text>
            <View style={styles.deptContainer}>
              <MaterialIcons name="business" size={14} color={isDark ? '#94A3B8' : '#64748B'} />
              <Text style={[styles.dept, { fontSize: Typography.sizes.sm, color: isDark ? '#94A3B8' : '#64748B' }]}>
                {item.department}
              </Text>
            </View>
            
            {/* Expertise Chips */}
            {item.expertise && item.expertise.length > 0 && (
              <View style={styles.expertiseContainer}>
                {item.expertise.slice(0, 2).map((exp, idx) => (
                  <View key={idx} style={[styles.expertiseChip, isDark && styles.expertiseChipDark]}>
                    <Text style={[styles.expertiseText, isDark && styles.expertiseTextDark]} numberOfLines={1}>{exp}</Text>
                  </View>
                ))}
                {item.expertise.length > 2 && (
                  <View style={[styles.expertiseChip, isDark && styles.expertiseChipDark]}>
                    <Text style={[styles.expertiseText, isDark && styles.expertiseTextDark]}>+{item.expertise.length - 2}</Text>
                  </View>
                )}
              </View>
            )}
            
          </View>
          <MaterialIcons name="chevron-right" size={24} color={isDark ? '#475569' : '#CBD5E1'} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: Typography.sizes['3xl'], fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
          Faculty Directory
        </Text>
        <Text style={[styles.subtitle, { fontSize: Typography.sizes.md, color: isDark ? '#94A3B8' : '#64748B' }]}>
          Find and connect with colleagues across the institution.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isDark && styles.searchBarDark]}>
          <MaterialIcons name="search" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FFF' : '#0F172A' }]}
            placeholder="Search by name or department..."
            placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredFaculty}
          keyExtractor={(item) => item.uid}
          renderItem={renderFacultyCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={64} color={isDark ? '#334155' : '#E2E8F0'} />
              <Text style={[styles.emptyText, { fontSize: Typography.sizes.lg, color: isDark ? '#94A3B8' : '#64748B' }]}>
                No faculty members found.
              </Text>
            </View>
          }
        />
      )}
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
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    height: 48,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchBarDark: {
    backgroundColor: '#1E293B',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100, // For floating tab bar
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    marginBottom: 2,
  },
  role: {
    marginBottom: 4,
  },
  deptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  expertiseChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expertiseChipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  expertiseText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    maxWidth: 100,
  },
  expertiseTextDark: {
    color: '#94A3B8',
  },
  dept: {},
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
