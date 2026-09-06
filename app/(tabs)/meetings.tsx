/**
 * CampusMind AI - Smart Meeting Manager
 * Schedule, manage, and track meetings with live Firestore CRUD.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import {
  subscribeMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  createSchedule,
  syncOrphanMeetings,
} from '@/services/firestore';
import type { Meeting } from '@/services/firestoreTypes';
import { useSettings, useThemeEngine } from '@/contexts/SettingsContext';
import { MeetingDetailsModal } from '@/components/MeetingModals';
import { useLocalSearchParams } from 'expo-router';


export default function MeetingsScreen() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'done'>('all');

  const params = useLocalSearchParams();

  const { resolvedTheme } = useSettings();
  const { Typography: ThemeTypography } = useThemeEngine();
  const isDark = resolvedTheme === 'dark';

  // Real-time listener & Auto-Sync Orphans
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const unsubMeetings = subscribeMeetings(user.uid, (data) => {
      setMeetings(data);
      setLoading(false);
    });

    syncOrphanMeetings(user.uid);

    return () => { unsubMeetings(); };
  }, [user?.uid]);

  // Deep linking logic
  useEffect(() => {
    if (meetings.length > 0) {
      let match = null;
      if (params.meetingId) {
        match = meetings.find(m => m.id === params.meetingId);
      } else if (params.scheduleId) {
        // If it was just synced, the schedule item's date/title should match
        // But since we just added meetingId to schedule in auto-sync, it might be easier to check if any meeting matches the scheduleId logic.
        // For now, if we don't have meetingId, the user tapped before auto-sync finished.
        // The auto-sync will eventually populate the meetingId and we can catch it.
      }
      if (match) setSelectedMeeting(match);
    }
  }, [params.meetingId, params.scheduleId, meetings]);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'in_person': return { label: 'In-Person', icon: 'meeting-room' as const, color: '#3B82F6' };
      case 'virtual': return { label: 'Virtual', icon: 'videocam' as const, color: '#8B5CF6' };
      case 'hybrid': return { label: 'Hybrid', icon: 'devices' as const, color: '#10B981' };
      default: return { label: type, icon: 'event' as const, color: '#64748B' };
    }
  };

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Filter meetings by selected month and sort them
  const currentMonthMeetings = React.useMemo(() => {
    const startStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const endStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${lastDay}`;
    
    return meetings
      .filter(m => m.date >= startStr && m.date <= endStr)
      .sort((a, b) => {
        if (a.date === b.date) return a.startTime.localeCompare(b.startTime);
        return a.date.localeCompare(b.date);
      });
  }, [meetings, currentYear, currentMonth]);

  const handleDelete = (meeting: Meeting) => {
    Alert.alert('Delete Meeting', `Delete "${meeting.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => meeting.id && deleteMeeting(meeting.id) },
    ]);
  };

  const handleToggleStatus = async (meeting: Meeting) => {
    if (!meeting.id) return;
    const newStatus = meeting.status === 'scheduled' ? 'completed' : 'scheduled';
    await updateMeeting(meeting.id, { status: newStatus });
  };

  const handleSeedMeetings = async () => {
    if (!user?.uid) return;
    
    const today = new Date();
    const addDays = (d: number) => new Date(today.getTime() + d * 86400000).toISOString().split('T')[0];

    const dummyMeetings: Omit<Meeting, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'Department Sync',
        date: addDays(0), // Today
        startTime: '09:00',
        endTime: '10:30',
        type: 'in_person',
        room: 'Room 402, Science Bldg',
        attendees: ['Dr. Smith', 'Prof. Johnson', 'Alice'],
        status: 'scheduled',
        agenda: ['Review Q3 Budget', 'New hire updates', 'Curriculum changes'],
        minutes: 'Dr. Smith will handle the budget reallocation. Alice will schedule interviews.',
      },
      {
        title: 'Thesis Defense Review',
        date: addDays(1), // Tomorrow
        startTime: '13:00',
        endTime: '14:00',
        type: 'virtual',
        teamsLink: 'https://teams.microsoft.com/l/meetup-join/12345',
        attendees: ['Sarah Student', 'Dr. Williams'],
        status: 'scheduled',
        agenda: ['Review Chapter 4', 'Discuss data methodology limitations'],
        minutes: 'Sarah needs to rewrite the conclusion to better address the methodology limits.',
      },
      {
        title: 'Grant Proposal Strategy',
        date: addDays(10), // Future week
        startTime: '15:30',
        endTime: '16:30',
        type: 'hybrid',
        room: 'Conference Room B',
        teamsLink: 'https://teams.microsoft.com/l/meetup-join/67890',
        attendees: ['Research Team Alpha'],
        status: 'scheduled',
        agenda: ['Identify key funding bodies', 'Draft timeline for submission'],
      },
      {
        title: 'Student Consultations',
        date: addDays(25), // Next month
        startTime: '10:00',
        endTime: '12:00',
        type: 'in_person',
        room: 'Office 314',
        attendees: ['Various Students'],
        status: 'scheduled',
        agenda: ['Open door hours for upcoming midterms'],
      },
      {
        title: 'Faculty Committee Meeting',
        date: addDays(40), // Mid October
        startTime: '14:00',
        endTime: '15:30',
        type: 'virtual',
        teamsLink: 'https://teams.microsoft.com/l/meetup-join/abcde',
        attendees: ['Dean', 'Department Heads'],
        status: 'scheduled',
        agenda: ['Vote on syllabus modifications', 'Campus safety protocols'],
      },
      {
        title: 'Mid-term Assessment Review',
        date: addDays(55), // Late October
        startTime: '09:00',
        endTime: '11:00',
        type: 'hybrid',
        room: 'Room 201',
        attendees: ['Teaching Assistants'],
        status: 'scheduled',
        agenda: ['Grade moderation', 'Student feedback'],
      },
      {
        title: 'Research Collaboration Sync',
        date: addDays(75), // Mid November
        startTime: '16:00',
        endTime: '17:00',
        type: 'virtual',
        teamsLink: 'https://zoom.us/j/987654321',
        attendees: ['Dr. Alan', 'Prof. Smith'],
        status: 'scheduled',
        agenda: ['Paper submission deadlines', 'Data analysis review'],
      },
      {
        title: 'End of Year Department Party Planning',
        date: addDays(85), // Late November
        startTime: '12:00',
        endTime: '13:00',
        type: 'in_person',
        room: 'Staff Lounge',
        attendees: ['Party Committee'],
        status: 'scheduled',
        agenda: ['Catering options', 'Venue booking'],
      },
      {
        title: 'Final Grading Sync',
        date: addDays(105), // Mid December
        startTime: '10:00',
        endTime: '12:00',
        type: 'virtual',
        attendees: ['All Faculty'],
        status: 'scheduled',
        agenda: ['Finalizing grades', 'System entry deadlines'],
      },
      {
        title: 'Winter Break Prep',
        date: addDays(115), // Late December
        startTime: '14:00',
        endTime: '14:30',
        type: 'hybrid',
        room: 'Office',
        attendees: ['Admin Staff'],
        status: 'scheduled',
        agenda: ['Lab shutdowns', 'Out of office setups'],
      }
    ];

    setLoading(true);
    for (const m of dummyMeetings) {
      const meetingId = await createMeeting(user.uid, m);
      if (meetingId) {
        await createSchedule(user.uid, {
          date: m.date,
          startTime: m.startTime,
          endTime: m.endTime,
          title: m.title,
          type: 'meetings',
          meetingId: meetingId,
        });
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Meetings</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? 'Loading...' : `${meetings.length} meetings`}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.createButton} onPress={handleSeedMeetings}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.createButtonGradient}>
                <MaterialIcons name="auto-awesome" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Seed</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
              <LinearGradient colors={[BrandColors.accent, BrandColors.accentDark]} style={styles.createButtonGradient}>
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>New</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Month Navigator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg }}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: BorderRadius.full }}>
            <MaterialIcons name="chevron-left" size={24} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '600' }}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: BorderRadius.full }}>
            <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={[styles.statCard, filter === 'upcoming' && { borderColor: BrandColors.accent, borderWidth: 1 }]} onPress={() => setFilter(filter === 'upcoming' ? 'all' : 'upcoming')} activeOpacity={0.7}>
            <Text style={styles.statValue}>{currentMonthMeetings.filter(m => m.date >= new Date().toISOString().split('T')[0]).length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, filter === 'all' && { borderColor: BrandColors.accent, borderWidth: 1 }]} onPress={() => setFilter('all')} activeOpacity={0.7}>
            <Text style={styles.statValue}>{currentMonthMeetings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, filter === 'done' && { borderColor: BrandColors.accent, borderWidth: 1 }]} onPress={() => setFilter(filter === 'done' ? 'all' : 'done')} activeOpacity={0.7}>
            <Text style={styles.statValue}>{currentMonthMeetings.filter(m => m.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
          <Text style={styles.loadingText}>Loading meetings...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <MeetingSection 
            title={filter === 'all' ? `${MONTH_NAMES[currentMonth]} Meetings` : filter === 'upcoming' ? 'Upcoming Meetings' : 'Completed Meetings'} 
            meetings={currentMonthMeetings.filter(m => {
              if (filter === 'upcoming') return m.date >= new Date().toISOString().split('T')[0];
              if (filter === 'done') return m.status === 'completed';
              return true;
            })} 
            getTypeConfig={getTypeConfig} 

            onDelete={handleDelete} 
            onToggle={handleToggleStatus} 
            onPress={(m) => setSelectedMeeting(m)} 
          />

          {currentMonthMeetings.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-available" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No meetings scheduled</Text>
              <Text style={styles.emptySubtitle}>Tap &quot;New&quot; to create your first meeting</Text>
            </View>
          )}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      )}

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userId={user?.uid || ''}
      />
      
      <MeetingDetailsModal 
        visible={!!selectedMeeting} 
        onClose={() => setSelectedMeeting(null)} 
        isDark={isDark} 
        Typography={ThemeTypography} 
        meeting={selectedMeeting} 
        onToggleStatus={handleToggleStatus}
      />
    </View>
  );
}

function MeetingSection({ title, meetings, getTypeConfig, onDelete, onToggle, onPress }: {
  title: string;
  meetings: Meeting[];
  getTypeConfig: (type: string) => { label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string };
  onDelete: (m: Meeting) => void;
  onToggle: (m: Meeting) => void;
  onPress: (m: Meeting) => void;
}) {
  if (meetings.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m)-1, Number(d)).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {meetings.map((meeting) => {
        const typeConfig = getTypeConfig(meeting.type);
        return (
          <TouchableOpacity
            key={meeting.id}
            style={[styles.meetingCard, meeting.status === 'completed' && styles.meetingDone]}
            activeOpacity={0.7}
            onPress={() => onPress(meeting)}
            onLongPress={() => onDelete(meeting)}
          >
            <View style={[styles.meetingStripe, { backgroundColor: typeConfig.color }]} />
            <View style={styles.meetingBody}>
              <View style={styles.meetingHeader}>
                <Text style={[styles.meetingTitle, meeting.status === 'completed' && styles.meetingTitleDone]}>
                  {meeting.title}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '18' }]}>
                    <MaterialIcons name={typeConfig.icon} size={12} color={typeConfig.color} />
                    <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
                  </View>
                  <TouchableOpacity onPress={() => onToggle(meeting)}>
                    <MaterialIcons
                      name={meeting.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
                      size={20}
                      color={meeting.status === 'completed' ? BrandColors.success : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.meetingDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="event" size={16} color="#64748B" />
                  <Text style={styles.detailText}>{formatDate(meeting.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="schedule" size={16} color="#64748B" />
                  <Text style={styles.detailText}>{meeting.startTime} – {meeting.endTime}</Text>
                </View>
                {meeting.room && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="meeting-room" size={16} color="#64748B" />
                    <Text style={styles.detailText}>{meeting.room}</Text>
                  </View>
                )}
                {meeting.teamsLink && (
                  <TouchableOpacity style={styles.joinButton}>
                    <MaterialIcons name="videocam" size={14} color={BrandColors.accent} />
                    <Text style={styles.joinButtonText}>Join Meeting</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.attendeesRow}>
                <MaterialIcons name="people" size={14} color="#94A3B8" />
                <Text style={styles.attendeesText}>{meeting.attendees.join(', ')}</Text>
                <TouchableOpacity onPress={() => onDelete(meeting)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="delete-outline" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CreateMeetingModal({ visible, onClose, userId }: { visible: boolean; onClose: () => void; userId: string }) {
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState<Meeting['type']>('in_person');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [teamsLink, setTeamsLink] = useState('');
  const [attendees, setAttendees] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Missing Title', 'Please enter a meeting title.'); return; }
    setSaving(true);
    await createMeeting(userId, {
      title: title.trim(),
      date,
      startTime,
      endTime,
      type: meetingType,
      room: room.trim() || undefined,
      teamsLink: teamsLink.trim() || undefined,
      attendees: attendees.split(',').map((a) => a.trim()).filter(Boolean),
      attendeeIds: [],
      status: 'scheduled',
    });
    setSaving(false);
    setTitle(''); setRoom(''); setTeamsLink(''); setAttendees('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Meeting</Text>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={24} color="#64748B" /></TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <Text style={styles.fieldLabel}>Meeting Title</Text>
            <TextInput style={styles.fieldInput} placeholder="e.g., Faculty Board Meeting" placeholderTextColor="#94A3B8" value={title} onChangeText={setTitle} />

            <Text style={styles.fieldLabel}>Meeting Type</Text>
            <View style={styles.typeSelector}>
              {([
                { value: 'in_person' as const, label: 'In-Person', icon: 'meeting-room' as const },
                { value: 'virtual' as const, label: 'Virtual', icon: 'videocam' as const },
                { value: 'hybrid' as const, label: 'Hybrid', icon: 'devices' as const },
              ]).map((opt) => (
                <TouchableOpacity key={opt.value} style={[styles.typeOption, meetingType === opt.value && styles.typeOptionActive]} onPress={() => setMeetingType(opt.value)}>
                  <MaterialIcons name={opt.icon} size={18} color={meetingType === opt.value ? BrandColors.accent : '#94A3B8'} />
                  <Text style={[styles.typeOptionText, meetingType === opt.value && styles.typeOptionTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.fieldInput} placeholder="2026-08-25" placeholderTextColor="#94A3B8" value={date} onChangeText={setDate} />

            <View style={styles.dateTimeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Start Time</Text>
                <TextInput style={styles.fieldInput} placeholder="09:00" placeholderTextColor="#94A3B8" value={startTime} onChangeText={setStartTime} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>End Time</Text>
                <TextInput style={styles.fieldInput} placeholder="10:00" placeholderTextColor="#94A3B8" value={endTime} onChangeText={setEndTime} />
              </View>
            </View>

            {meetingType !== 'virtual' && (
              <>
                <Text style={styles.fieldLabel}>Room / Location</Text>
                <TextInput style={styles.fieldInput} placeholder="e.g., Room 204" placeholderTextColor="#94A3B8" value={room} onChangeText={setRoom} />
              </>
            )}

            {meetingType !== 'in_person' && (
              <>
                <Text style={styles.fieldLabel}>Meeting Link</Text>
                <TextInput style={styles.fieldInput} placeholder="Paste Teams/Zoom link..." placeholderTextColor="#94A3B8" value={teamsLink} onChangeText={setTeamsLink} />
              </>
            )}

            <Text style={styles.fieldLabel}>Attendees (comma-separated)</Text>
            <TextInput style={styles.fieldInput} placeholder="Dr. Patel, Prof. Williams" placeholderTextColor="#94A3B8" value={attendees} onChangeText={setAttendees} />

            <TouchableOpacity style={styles.createMeetingButton} activeOpacity={0.8} onPress={handleSave} disabled={saving}>
              <LinearGradient colors={[BrandColors.accent, BrandColors.accentDark]} style={styles.createMeetingGradient}>
                <MaterialIcons name="check" size={20} color="#fff" />
                <Text style={styles.createMeetingText}>{saving ? 'Saving...' : 'Create Meeting'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 56, paddingLeft: 68, paddingRight: Spacing.xl, paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius['2xl'], borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: '#fff' },
  headerSubtitle: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginTop: 2 },
  createButton: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  createButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: 4 },
  createButtonText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: '#fff' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center' },
  statValue: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.extrabold, color: '#fff' },
  statLabel: { fontSize: 10, color: '#94A3B8', marginTop: 2 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: Typography.sizes.sm, color: '#94A3B8' },
  emptyState: { alignItems: 'center', paddingTop: Spacing['5xl'] },
  emptyTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#334155', marginTop: Spacing.base },
  emptySubtitle: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginTop: 4 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginBottom: Spacing.md },

  meetingCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden', ...Shadows.sm },
  meetingDone: { opacity: 0.6 },
  meetingStripe: { width: 4 },
  meetingBody: { flex: 1, padding: Spacing.base },
  meetingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  meetingTitle: { flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#1A1A2E', marginRight: Spacing.sm },
  meetingTitleDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm, gap: 4 },
  typeBadgeText: { fontSize: 10, fontWeight: Typography.weights.bold },
  meetingDetails: { gap: 6, marginBottom: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: Typography.sizes.sm, color: '#64748B' },
  joinButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: BrandColors.accent + '12', alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.sm },
  joinButtonText: { fontSize: Typography.sizes.xs, color: BrandColors.accent, fontWeight: Typography.weights.bold },
  attendeesRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  attendeesText: { fontSize: Typography.sizes.xs, color: '#94A3B8', flex: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], maxHeight: '85%', paddingBottom: Spacing['3xl'] },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  modalScroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  fieldLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: '#334155', marginBottom: Spacing.sm, marginTop: Spacing.md },
  fieldInput: { backgroundColor: '#F8FAFC', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, fontSize: Typography.sizes.md, color: '#1A1A2E', borderWidth: 1, borderColor: '#E2E8F0' },
  dateTimeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeSelector: { flexDirection: 'row', gap: Spacing.sm },
  typeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: 6, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0' },
  typeOptionActive: { borderColor: BrandColors.accent, backgroundColor: BrandColors.accent + '08' },
  typeOptionText: { fontSize: Typography.sizes.sm, color: '#94A3B8', fontWeight: Typography.weights.medium },
  typeOptionTextActive: { color: BrandColors.accent, fontWeight: Typography.weights.bold },
  createMeetingButton: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.xl },
  createMeetingGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.base, gap: Spacing.sm },
  createMeetingText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#fff' },
});
