import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type EmailSource = 'outlook' | 'gmail';

interface PendingEmail {
  id: string;
  source: EmailSource;
  sender: string;
  emailAddress: string;
  subject: string;
  snippet: string;
  time: string;
  isImportant: boolean;
  type: 'student_inquiry' | 'extension_request' | 'general' | 'committee_response';
}

const MOCK_EMAILS: PendingEmail[] = [
  {
    id: 'out-1',
    source: 'outlook',
    sender: 'Jane Doe',
    emailAddress: 'jane.doe@university.edu',
    subject: 'Question regarding CS301 Assignment 2',
    snippet: 'Dear Professor, I am struggling with the time complexity analysis in question 3. Could you please clarify if we should consider worst-case or average-case?',
    time: '10:45 AM',
    isImportant: true,
    type: 'student_inquiry',
  },
  {
    id: 'out-2',
    source: 'outlook',
    sender: 'Faculty Board',
    emailAddress: 'faculty.board@university.edu',
    subject: 'URGENT: Curriculum Review Feedback Required',
    snippet: 'Please provide your feedback on the proposed curriculum changes by EOD tomorrow. We need to finalize the modules for next semester.',
    time: 'Yesterday',
    isImportant: true,
    type: 'committee_response',
  },
  {
    id: 'out-3',
    source: 'outlook',
    sender: 'John Smith',
    emailAddress: 'john.smith@university.edu',
    subject: 'Extension Request - Medical Reason',
    snippet: 'I have attached my medical certificate. I was hoping to get a 3-day extension for the upcoming research paper deadline.',
    time: 'Yesterday',
    isImportant: false,
    type: 'extension_request',
  },
  {
    id: 'gm-1',
    source: 'gmail',
    sender: 'Conference Organizers',
    emailAddress: 'contact@techconf2026.org',
    subject: 'Speaker Confirmation & Schedule',
    snippet: 'Thank you for agreeing to speak at our upcoming conference. Please find the attached preliminary schedule and confirm your availability for the panel.',
    time: '09:12 AM',
    isImportant: false,
    type: 'general',
  },
  {
    id: 'gm-2',
    source: 'gmail',
    sender: 'Research Partner (External)',
    emailAddress: 'dr.rodriguez@external-institute.edu',
    subject: 'Draft review for our joint paper',
    snippet: 'I have finished reviewing section 4. The statistical analysis looks solid but we might need to expand on the methodology. What do you think?',
    time: 'Yesterday',
    isImportant: true,
    type: 'general',
  }
];

export default function EmailAssistantScreen() {
  const { BrandColors, isDark, Typography } = useThemeEngine();
  const [activeTab, setActiveTab] = useState<EmailSource>('outlook');
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  const filteredEmails = MOCK_EMAILS.filter(email => email.source === activeTab);

  const toggleExpand = (id: string) => {
    setExpandedEmailId(prev => (prev === id ? null : id));
  };

  const handleDraftReply = (email: PendingEmail) => {
    // Generate a basic quoted body so the AI has context
    const quotedBody = `\n\n--- Original Message from ${email.sender} ---\n${email.snippet}`;
    
    router.push({
      pathname: '/email-draft',
      params: {
        recipient: email.emailAddress,
        subject: `Re: ${email.subject}`,
        body: quotedBody
      }
    });
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <LinearGradient colors={isDark ? ['#1E293B', '#0F172A'] : ['#1B2A4A', '#0F172A']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { fontSize: Typography.sizes.lg }]}>Email Assistant</Text>
            <Text style={[styles.headerSubtitle, { fontSize: Typography.sizes.sm }]}>Unified Inbox Sync</Text>
          </View>
          <View style={{ width: 40 }} /> {/* Placeholder for balance */}
        </View>

        {/* Source Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'outlook' && styles.tabActive]}
            onPress={() => setActiveTab('outlook')}
          >
            <MaterialCommunityIcons 
              name="microsoft-outlook" 
              size={18} 
              color={activeTab === 'outlook' ? '#fff' : '#94A3B8'} 
            />
            <Text style={[styles.tabText, { fontSize: Typography.sizes.md }, activeTab === 'outlook' && styles.tabTextActive]}>Outlook</Text>
            {activeTab === 'outlook' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gmail' && styles.tabActive]}
            onPress={() => setActiveTab('gmail')}
          >
            <MaterialCommunityIcons 
              name="gmail" 
              size={18} 
              color={activeTab === 'gmail' ? '#fff' : '#94A3B8'} 
            />
            <Text style={[styles.tabText, { fontSize: Typography.sizes.md }, activeTab === 'gmail' && styles.tabTextActive]}>Gmail</Text>
            {activeTab === 'gmail' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Email List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {filteredEmails.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="done-all" size={48} color="#94A3B8" />
            <Text style={[styles.emptyText, { fontSize: Typography.sizes.xl }, isDark && { color: '#94A3B8' }]}>Inbox Zero!</Text>
            <Text style={[styles.emptySubtext, { fontSize: Typography.sizes.md }]}>No pending emails in {activeTab}.</Text>
          </View>
        ) : (
          filteredEmails.map(email => {
            const isExpanded = expandedEmailId === email.id;
            return (
              <TouchableOpacity 
                key={email.id} 
                style={[styles.emailCard, isDark && styles.emailCardDark]}
                activeOpacity={0.7}
                onPress={() => toggleExpand(email.id)}
              >
                <View style={styles.emailHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{email.sender.charAt(0)}</Text>
                  </View>
                  <View style={styles.senderInfo}>
                    <Text style={[styles.senderName, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}>{email.sender}</Text>
                    <Text style={[styles.timeText, { fontSize: Typography.sizes.xs }]}>{email.time}</Text>
                  </View>
                  {email.isImportant && (
                    <MaterialIcons name="label-important" size={20} color="#F59E0B" style={{ marginLeft: 8 }} />
                  )}
                </View>
                
                <Text style={[styles.subjectText, { fontSize: Typography.sizes.md }, isDark && { color: '#E2E8F0' }]}>{email.subject}</Text>
                <Text 
                  style={[styles.snippetText, { fontSize: Typography.sizes.sm }]} 
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {email.snippet}
                </Text>
                
                <View style={styles.emailFooter}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: 'rgba(108, 99, 255, 0.1)' }]}
                    onPress={() => handleDraftReply(email)}
                  >
                    <MaterialIcons name="auto-awesome" size={16} color={BrandColors.secondary} />
                    <Text style={[styles.actionButtonText, { fontSize: Typography.sizes.sm, color: BrandColors.secondary }]}>AI Draft Reply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, isDark ? { backgroundColor: '#334155' } : { backgroundColor: '#F1F5F9' }]}
                    onPress={() => handleDraftReply(email)}
                  >
                    <MaterialIcons name="reply" size={16} color={isDark ? '#F1F5F9' : '#475569'} />
                    <Text style={[styles.actionButtonText, { fontSize: Typography.sizes.sm }, isDark ? { color: '#F1F5F9' } : { color: '#475569' }]}>Manual Reply</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    color: '#fff', fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8', marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 8,
  },
  tabActive: {
    // Active styles handled conditionally
  },
  tabText: {
    color: '#94A3B8', fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0, left: '20%', right: '20%',
    height: 3,
    backgroundColor: '#00B4D8',
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontWeight: '700', color: '#1E293B',
    marginTop: Spacing.md,
  },
  emptySubtext: {
    color: '#64748B',
    marginTop: Spacing.xs,
  },
  emailCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  emailCardDark: {
    backgroundColor: '#1E293B',
  },
  emailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#00B4D8',
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16,
  },
  senderInfo: { flex: 1 },
  senderName: {
    fontWeight: '700', color: '#1E293B',
  },
  timeText: {
    color: '#64748B', marginTop: 2,
  },
  subjectText: {
    fontWeight: '600', color: '#1E293B',
    marginBottom: Spacing.xs,
  },
  snippetText: {
    color: '#64748B', lineHeight: 20,
    marginBottom: Spacing.md,
  },
  emailFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    fontWeight: '600',
  }
});
