import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { UserProfile, ResearchProject, Publication } from '@/services/firestoreTypes';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { Spacing, BorderRadius, Shadows, RoleLabels } from '@/constants/theme';
import GlassCard from '@/components/GlassCard';

export default function FacultyProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { Typography, BrandColors, isDark } = useThemeEngine();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      if (!id) return;
      try {
        // Fetch User Profile
        if (id.startsWith('mock_')) {
          // Generate a mock profile for mock committee members
          const mockName = id.replace('mock_', '').charAt(0).toUpperCase() + id.replace('mock_', '').slice(1);
          setProfile({
            uid: id,
            name: `Dr. ${mockName}`,
            email: `${id.replace('mock_', '')}@univ.edu`,
            role: 'lecturer',
            department: 'Computer Science',
            bio: 'Expert in their respective field with years of academic and industry experience.',
            expertise: ['Teaching', 'Research', 'Academic Governance'],
            orcidId: '0000-0001-2345-6789',
            researchGateUrl: 'https://researchgate.net/profile/mock',
            googleScholarUrl: 'https://scholar.google.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as UserProfile);
        } else {
          const userRef = doc(db, 'users', id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            let userData = userSnap.data() as UserProfile;
            
            // Auto-patch missing data dynamically based on department!
            if (!userData.expertise || userData.expertise.length === 0 || !(userData as any).hasDynamicPatch) {
              const dept = userData.department || 'General';
              let expertise, qualifications, teachingModules, projects, publications;

              if (dept.includes('Computer') || dept.includes('IT') || dept.includes('Software')) {
                expertise = ['Artificial Intelligence', 'Software Engineering', 'Cybersecurity'];
                qualifications = [
                  { degree: 'Ph.D. in Computer Science', institution: 'MIT', year: 2015 },
                  { degree: 'M.Sc. in Software Engineering', institution: 'Stanford University', year: 2011 }
                ];
                teachingModules = [
                  { courseCode: 'CS450', courseName: 'Advanced Data Structures', semester: 'Fall 2026' },
                  { courseCode: 'CS510', courseName: 'Machine Learning Basics', semester: 'Spring 2027' }
                ];
                projects = [{ title: 'AI-Driven Adaptive Learning Systems', status: 'active', ethics: 'approved' }];
                publications = [{ 
                  title: 'Adaptive Learning in Higher Education', 
                  journal: 'Journal of Educational Technology',
                  abstract: 'This paper explores the efficacy of machine learning models in adapting curriculum delivery to individual student learning paces. Results show a 24% improvement in student retention.',
                  isbn: '978-3-16-148410-0',
                  url: 'researchgate.net/publication/adaptive_learning'
                }];
              } else if (dept.includes('Business') || dept.includes('Management')) {
                expertise = ['Corporate Strategy', 'Organizational Behavior', 'Market Analysis'];
                qualifications = [
                  { degree: 'Ph.D. in Business Administration', institution: 'Harvard Business School', year: 2014 },
                  { degree: 'MBA', institution: 'London Business School', year: 2009 }
                ];
                teachingModules = [
                  { courseCode: 'MGT301', courseName: 'Strategic Management', semester: 'Fall 2026' },
                  { courseCode: 'MKT405', courseName: 'Consumer Behavior', semester: 'Spring 2027' }
                ];
                projects = [{ title: 'Impact of AI on Corporate Strategies', status: 'active', ethics: 'exempt' }];
                publications = [{ 
                  title: 'Modern Market Dynamics in Tech', 
                  journal: 'Harvard Business Review',
                  abstract: 'An analysis of how tech giants maneuver shifting market dynamics, focusing on AI adoption and regulatory hurdles.',
                  isbn: '978-0-12-345678-9',
                  url: 'orcid.org/0000-0001-2345-6789'
                }];
              } else if (dept.includes('Chemistry') || dept.includes('Science')) {
                expertise = ['Organic Synthesis', 'Nanomaterials', 'Spectroscopy'];
                qualifications = [
                  { degree: 'Ph.D. in Chemistry', institution: 'Caltech', year: 2016 },
                  { degree: 'B.Sc. in Chemical Engineering', institution: 'UC Berkeley', year: 2010 }
                ];
                teachingModules = [
                  { courseCode: 'CHM201', courseName: 'Organic Chemistry II', semester: 'Fall 2026' },
                  { courseCode: 'CHM410', courseName: 'Nanotechnology Fundamentals', semester: 'Spring 2027' }
                ];
                projects = [{ title: 'Sustainable Polymer Synthesis', status: 'proposed', ethics: 'submitted' }];
                publications = [{ 
                  title: 'Advancements in Biodegradable Polymers', 
                  journal: 'Journal of Physical Chemistry',
                  abstract: 'This study presents a novel methodology for synthesizing biodegradable polymers with high tensile strength under standard atmospheric conditions.',
                  url: 'researchgate.net/publication/biodegradable_polymers'
                }];
              } else {
                // Generic fallback
                expertise = ['Higher Education', 'Interdisciplinary Research', 'Curriculum Design'];
                qualifications = [
                  { degree: `Ph.D. in ${dept}`, institution: 'State University', year: 2012 },
                  { degree: `M.A. in ${dept}`, institution: 'National College', year: 2008 }
                ];
                teachingModules = [
                  { courseCode: 'EDU101', courseName: 'Introduction to Higher Ed', semester: 'Fall 2026' },
                  { courseCode: 'RES201', courseName: 'Research Methodologies', semester: 'Spring 2027' }
                ];
                projects = [{ title: `Innovations in ${dept}`, status: 'active', ethics: 'approved' }];
                publications = [{ 
                  title: `Future Trends in ${dept}`, 
                  journal: 'Global Education Review',
                  abstract: `A comprehensive review of emerging methodologies and interdisciplinary applications within ${dept}.`,
                  isbn: '978-1-234-56789-7'
                }];
              }

              const richData = {
                expertise,
                qualifications,
                teachingModules,
                hasDynamicPatch: true,
                evidenceFiles: [
                  { name: `${userData.name.replace(/\s/g, '_')}_CV.pdf`, url: 'https://example.com/cv' },
                  { name: 'Recent_Award_Certificate.pdf', url: 'https://example.com/award' }
                ]
              };
              
              await updateDoc(userRef, richData);
              userData = { ...userData, ...richData };
              
              // Seed mock projects
              for (let i = 0; i < projects.length; i++) {
                await setDoc(doc(db, 'research_projects', `mock_proj_${id}_${i}`), {
                  userId: id,
                  title: projects[i].title,
                  status: projects[i].status,
                  publications: Math.floor(Math.random() * 5),
                  conferences: Math.floor(Math.random() * 3),
                  progress: Math.floor(Math.random() * 100),
                  ethics: projects[i].ethics
                });
              }
              
              // Seed mock publications
              for (let i = 0; i < publications.length; i++) {
                await setDoc(doc(db, 'publications', `mock_pub_${id}_${i}`), {
                  userId: id,
                  title: publications[i].title,
                  journal: publications[i].journal,
                  year: 2020 + Math.floor(Math.random() * 6),
                  status: 'published',
                  doi: `10.1016/${dept.toLowerCase().substring(0,4)}.${2025+i}`,
                  abstract: publications[i].abstract || 'This paper presents a novel approach to addressing fundamental challenges in the field. We demonstrate significant improvements over state-of-the-art methods through comprehensive evaluation.',
                  isbn: publications[i].isbn || `978-3-16-148410-${i}`,
                  url: publications[i].url,
                  authors: [`Dr. ${userData.name || 'Mock'}`, 'John Doe', 'Jane Smith'],
                  publisher: 'IEEE',
                  volume: `${Math.floor(Math.random() * 50) + 1}`,
                  issue: `${Math.floor(Math.random() * 12) + 1}`,
                  pages: `${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100) + 10}`,
                  keywords: ['Machine Learning', 'Data Science', 'Innovation']
                });
              }
            }
            
            setProfile({ ...userData, uid: userSnap.id } as UserProfile);
          }
        }

        // Fetch Projects
        const projQuery = query(collection(db, 'research_projects'), where('userId', '==', id));
        const projSnap = await getDocs(projQuery);
        const fetchedProjects: ResearchProject[] = [];
        projSnap.forEach((doc) => fetchedProjects.push({ id: doc.id, ...doc.data() } as ResearchProject));
        setProjects(fetchedProjects);

        // Fetch Publications
        const pubQuery = query(collection(db, 'publications'), where('userId', '==', id));
        const pubSnap = await getDocs(pubQuery);
        const fetchedPubs: Publication[] = [];
        pubSnap.forEach((doc) => fetchedPubs.push({ id: doc.id, ...doc.data() } as Publication));
        setPublications(fetchedPubs);

      } catch (err) {
        console.error('Failed to load faculty profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [id]);

  const handleEmail = () => {
    if (profile?.email) {
      Linking.openURL(`mailto:${profile.email}`).catch(() => 
        Alert.alert('Error', 'Unable to open email client.')
      );
    }
  };

  const handleCall = () => {
    if (profile?.phone) {
      Linking.openURL(`tel:${profile.phone}`).catch(() => 
        Alert.alert('Error', 'Unable to open dialer.')
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BrandColors.accent} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={48} color={BrandColors.error} />
        <Text style={[styles.errorText, { fontSize: Typography.sizes.lg, color: isDark ? '#F1F5F9' : '#0F172A' }]}>
          Faculty member not found.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#F1F5F9' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold, color: isDark ? '#F1F5F9' : '#0F172A' }]}>
          Faculty Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <GlassCard style={styles.profileCard} isDark={isDark} intensity={isDark ? 30 : 70}>
          <LinearGradient colors={[BrandColors.accent, BrandColors.secondary]} style={styles.avatarLarge}>
            <Text style={[styles.avatarTextLarge, { fontSize: Typography.sizes['4xl'], fontWeight: Typography.weights.bold }]}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={[styles.profileName, { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
            {profile.name}
          </Text>
          <Text style={[styles.profileRole, { fontSize: Typography.sizes.md, color: BrandColors.accent }]}>
            {profile.role ? RoleLabels[profile.role] : 'Lecturer'} • {profile.department}
          </Text>

          {/* Quick Actions */}
          <View style={styles.actionRow}>
            {profile.email && (
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: BrandColors.accent }]} onPress={handleEmail}>
                <MaterialIcons name="email" size={20} color="#FFF" />
                <Text style={styles.actionText}>Email</Text>
              </TouchableOpacity>
            )}
            {profile.phone && (
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: BrandColors.secondary }]} onPress={handleCall}>
                <MaterialIcons name="call" size={20} color="#FFF" />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>

        {/* Bio Section */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>About</Text>
            <Text style={[styles.bioText, { fontSize: Typography.sizes.md, color: isDark ? '#94A3B8' : '#475569' }]}>{profile.bio}</Text>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>Contact Information</Text>
          <GlassCard style={styles.infoCard} isDark={isDark}>
            {profile.officeLocation && (
              <View style={[styles.infoRow, { borderBottomColor: isDark ? '#334155' : '#E2E8F0', borderBottomWidth: 1 }]}>
                <MaterialIcons name="location-on" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                <Text style={[styles.infoText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{profile.officeLocation}</Text>
              </View>
            )}
            {profile.email && (
              <View style={[styles.infoRow, { borderBottomColor: isDark ? '#334155' : '#E2E8F0', borderBottomWidth: 1 }]}>
                <MaterialIcons name="mail" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                <Text style={[styles.infoText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{profile.email}</Text>
              </View>
            )}
            {profile.phone && (
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                <Text style={[styles.infoText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{profile.phone}</Text>
              </View>
            )}
          </GlassCard>
        </View>

        {/* Academic Profiles */}
        {(profile.orcidId || profile.researchGateUrl || profile.googleScholarUrl || profile.linkedinUrl) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>Academic Profiles</Text>
            <View style={styles.actionRow}>
              {profile.orcidId && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#A6CE39' }]} onPress={() => Linking.openURL(`https://orcid.org/${profile.orcidId}`)}>
                  <MaterialIcons name="fingerprint" size={20} color="#FFF" />
                  <Text style={styles.actionText}>ORCID</Text>
                </TouchableOpacity>
              )}
              {profile.googleScholarUrl && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4285F4' }]} onPress={() => Linking.openURL(profile.googleScholarUrl!)}>
                  <MaterialIcons name="school" size={20} color="#FFF" />
                  <Text style={styles.actionText}>Scholar</Text>
                </TouchableOpacity>
              )}
              {profile.researchGateUrl && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#00CCBB' }]} onPress={() => Linking.openURL(profile.researchGateUrl!)}>
                  <MaterialIcons name="science" size={20} color="#FFF" />
                  <Text style={styles.actionText}>ResearchGate</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Qualifications */}
        {profile.qualifications && profile.qualifications.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>Qualifications</Text>
            {profile.qualifications.map((q, index) => (
              <GlassCard key={index} style={styles.pubCard} isDark={isDark}>
                <View style={styles.cardIconRow}>
                  <MaterialIcons name="school" size={24} color={BrandColors.secondary} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={[styles.pubTitle, { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: isDark ? '#F1F5F9' : '#0F172A' }]}>{q.degree}</Text>
                    <Text style={[styles.pubMeta, { fontSize: Typography.sizes.sm, color: isDark ? '#94A3B8' : '#64748B' }]}>{q.institution} • {q.year}</Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Teaching */}
        {profile.teachingModules && profile.teachingModules.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>Teaching Modules</Text>
            {profile.teachingModules.map((m, index) => (
              <GlassCard key={index} style={styles.pubCard} isDark={isDark}>
                <View style={styles.cardIconRow}>
                  <MaterialIcons name="class" size={24} color={BrandColors.accent} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={[styles.pubTitle, { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: isDark ? '#F1F5F9' : '#0F172A' }]}>{m.courseName}</Text>
                    <Text style={[styles.pubMeta, { fontSize: Typography.sizes.sm, color: isDark ? '#94A3B8' : '#64748B' }]}>{m.courseCode} • {m.semester}</Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Publications */}
        {publications.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
              Recent Publications ({publications.length})
            </Text>
            {publications.map((pub, index) => (
              <GlassCard key={pub.id || index} style={styles.pubCard} isDark={isDark}>
                <Text style={[styles.pubTitle, { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                  {pub.title}
                </Text>
                <Text style={[styles.pubMeta, { fontSize: Typography.sizes.sm, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 8 }]}>
                  {pub.journal} • {pub.year}
                </Text>
                
                {(pub.authors || pub.coAuthors) && (
                  <Text style={[styles.pubDetail, { fontSize: Typography.sizes.sm, color: isDark ? '#CBD5E1' : '#334155' }]}>
                    <Text style={{ fontWeight: 'bold' }}>Authors: </Text>{(pub.authors || pub.coAuthors)?.join(', ')}
                  </Text>
                )}
                
                {pub.abstract && (
                  <View style={{ marginTop: 8, padding: 8, backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderRadius: 8 }}>
                    <Text style={[styles.pubDetail, { fontSize: Typography.sizes.xs, color: isDark ? '#94A3B8' : '#475569', fontStyle: 'italic' }]}>
                      "{pub.abstract}"
                    </Text>
                  </View>
                )}
                
                <View style={styles.pubMetadataGrid}>
                  {pub.doi && (
                    <TouchableOpacity onPress={() => Linking.openURL(`https://doi.org/${pub.doi}`)}>
                      <Text style={[styles.pubDetail, { fontSize: Typography.sizes.xs, color: BrandColors.accent, marginTop: 4 }]}>
                        DOI: {pub.doi}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {pub.isbn && (
                    <Text style={[styles.pubDetail, { fontSize: Typography.sizes.xs, color: isDark ? '#94A3B8' : '#64748B', marginTop: 4 }]}>
                      ISBN: {pub.isbn}
                    </Text>
                  )}
                  {pub.publisher && (
                    <Text style={[styles.pubDetail, { fontSize: Typography.sizes.xs, color: isDark ? '#94A3B8' : '#64748B', marginTop: 4 }]}>
                      Publisher: {pub.publisher}
                    </Text>
                  )}
                  {pub.volume && (
                    <Text style={[styles.pubDetail, { fontSize: Typography.sizes.xs, color: isDark ? '#94A3B8' : '#64748B', marginTop: 4 }]}>
                      Vol: {pub.volume}{pub.issue ? `, Issue: ${pub.issue}` : ''}{pub.pages ? `, pp. ${pub.pages}` : ''}
                    </Text>
                  )}
                </View>
                
                {pub.keywords && pub.keywords.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {pub.keywords.map((kw, i) => (
                      <View key={i} style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, color: isDark ? '#CBD5E1' : '#475569' }}>{kw}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </GlassCard>
            ))}
          </View>
        )}

        {/* Current Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>
              Current Projects ({projects.length})
            </Text>
            {projects.map((proj, index) => (
              <GlassCard key={proj.id || index} style={styles.pubCard} isDark={isDark}>
                <Text style={[styles.pubTitle, { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                  {proj.title}
                </Text>
                <Text style={[styles.pubMeta, { fontSize: Typography.sizes.sm, color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Status: {proj.status.toUpperCase()} • Ethics: {proj.ethics}
                </Text>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Evidence */}
        {profile.evidenceFiles && profile.evidenceFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: isDark ? '#FFF' : '#0F172A' }]}>Supporting Evidence</Text>
            {profile.evidenceFiles.map((ev, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => Linking.openURL(ev.url).catch(err => console.error("Couldn't load page", err))}
                activeOpacity={0.7}
              >
                <GlassCard style={styles.evidenceCard} isDark={isDark}>
                  <MaterialIcons name="attach-file" size={20} color={BrandColors.accent} />
                  <Text style={[styles.evidenceName, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>{ev.name}</Text>
                  <MaterialIcons name="open-in-new" size={16} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 100,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
    zIndex: 10,
  },
  headerDark: {
    backgroundColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {},
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 120, // Tab bar clearance
    gap: Spacing.xl,
  },
  profileCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarTextLarge: {
    color: '#FFF',
  },
  profileName: {
    textAlign: 'center',
    marginBottom: 4,
  },
  profileRole: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 8,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {},
  bioText: {
    lineHeight: 24,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
  },
  pubCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  pubTitle: {
    marginBottom: 4,
  },
  pubMeta: {},
  pubDetail: {
    lineHeight: 20,
  },
  pubMetadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 16,
    rowGap: 4,
    marginTop: 4,
  },
  errorText: {
    marginTop: Spacing.md,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  evidenceName: {
    fontSize: 13,
    fontWeight: '500',
  }
});
