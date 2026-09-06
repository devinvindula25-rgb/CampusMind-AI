import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { UserProfile } from '@/services/firestoreTypes';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import GlassCard from '@/components/GlassCard';

export default function DirectoryDepartmentsScreen() {
  const [faculty, setFaculty] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { Typography, BrandColors, isDark } = useThemeEngine();
  const router = useRouter();

  useEffect(() => {
    async function loadDirectory() {
      try {
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          users.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        setFaculty(users);
      } catch (err) {
        console.error('Failed to load directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  const departments = useMemo(() => {
    const deptMap = new Map<string, number>();
    faculty.forEach(f => {
      const d = f.department || 'Unassigned';
      deptMap.set(d, (deptMap.get(d) || 0) + 1);
    });
    
    return Array.from(deptMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [faculty]);

  const renderDepartmentCard = ({ item }: { item: { name: string, count: number } }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => router.push({ pathname: '/(tabs)/directory', params: { department: item.name } })}
    >
      <GlassCard 
        style={styles.card}
        isDark={isDark}
        intensity={isDark ? 30 : 70}
      >
        <View style={styles.cardContent}>
          <LinearGradient
            colors={[BrandColors.accent, BrandColors.secondary]}
            style={styles.iconContainer}
          >
            <FontAwesome5 name="building" size={24} color="#FFF" />
          </LinearGradient>
          
          <View style={styles.textContainer}>
            <Text style={[styles.deptName, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
              {item.name}
            </Text>
            <Text style={[styles.deptCount, { fontSize: Typography.sizes.sm, color: isDark ? '#94A3B8' : '#64748B' }]}>
              {item.count} Member{item.count !== 1 ? 's' : ''}
            </Text>
          </View>

          <MaterialIcons name="chevron-right" size={28} color={isDark ? '#475569' : '#CBD5E1'} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: Typography.sizes['3xl'], fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
          Departments
        </Text>
        <Text style={[styles.subtitle, { fontSize: Typography.sizes.md, color: isDark ? '#94A3B8' : '#64748B' }]}>
          Browse faculty by their organizational units.
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => item.name}
          renderItem={renderDepartmentCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="domain-disabled" size={64} color={isDark ? '#334155' : '#E2E8F0'} />
              <Text style={[styles.emptyText, { fontSize: Typography.sizes.lg, color: isDark ? '#94A3B8' : '#64748B' }]}>
                No departments found.
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
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100, // For floating tab bar
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  textContainer: {
    flex: 1,
  },
  deptName: {
    marginBottom: 4,
  },
  deptCount: {
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
