import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useSettings, useThemeEngine } from '@/contexts/SettingsContext';
import { BrandColors, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeSchedules, subscribeSchedulesRange, createSchedule, deleteSchedule } from '@/services/firestore';
import type { ScheduleItem } from '@/services/firestoreTypes';
import { ScheduleDetailsModal } from '@/components/ScheduleModals';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ACTIVITY_TYPES = {
  lecture_prep: { label: 'Lecture Prep', color: '#3B82F6', icon: 'menu-book' as const },
  research_writing: { label: 'Research Writing', color: '#8B5CF6', icon: 'edit-note' as const },
  student_consultations: { label: 'Student Hours', color: '#10B981', icon: 'people' as const },
  assessment_review: { label: 'Assessment', color: '#EF4444', icon: 'grading' as const },
  meetings: { label: 'Meetings', color: '#F59E0B', icon: 'groups' as const },
  admin: { label: 'Admin', color: '#64748B', icon: 'business-center' as const },
  break: { label: 'Break', color: '#06B6D4', icon: 'coffee' as const },
  external: { label: 'Synced Event', color: '#0EA5E9', icon: 'sync' as const },
  teaching: { label: 'Teaching', color: '#7C3AED', icon: 'school' as const },
  committee: { label: 'Committee', color: '#0891B2', icon: 'groups' as const },
  supervision: { label: 'Supervision', color: '#059669', icon: 'supervisor-account' as const },
  conference: { label: 'Conference', color: '#DC2626', icon: 'event' as const },
};

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All', icon: 'apps' as const },
  { key: 'academic', label: 'Academic', icon: 'school' as const },
  { key: 'teaching', label: 'Teaching', icon: 'menu-book' as const },
  { key: 'research', label: 'Research', icon: 'science' as const },
  { key: 'meetings', label: 'Meetings', icon: 'groups' as const },
  { key: 'committees', label: 'Committees', icon: 'groups' as const },
  { key: 'supervision', label: 'Supervision', icon: 'supervisor-account' as const },
  { key: 'conferences', label: 'Conferences', icon: 'event' as const },
];

const CATEGORY_TYPE_MAP: Record<string, string[]> = {
  academic: ['lecture_prep', 'student_consultations', 'assessment_review'],
  teaching: ['teaching', 'lecture_prep'],
  research: ['research_writing'],
  meetings: ['meetings'],
  committees: ['committee'],
  supervision: ['supervision'],
  conferences: ['conference', 'external'],
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function PlannerScreen() {
  const { resolvedTheme } = useSettings();
  const { user } = useAuth();
  const { Typography } = useThemeEngine();
  const isDark = resolvedTheme === 'dark';

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleItem | null>(null);

  // Helper to format date
  const formatDateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const selectedDateStr = useMemo(() => formatDateStr(currentYear, currentMonth, selectedDate), [currentYear, currentMonth, selectedDate]);

  // Calculate week and month date ranges
  const dateRanges = useMemo(() => {
    // Week
    const selected = new Date(currentYear, currentMonth, selectedDate);
    const dayOfWeek = selected.getDay();
    const monday = new Date(selected);
    monday.setDate(selected.getDate() - ((dayOfWeek + 6) % 7)); // start on Monday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    // Expand to cover full weeks for calendar grid
    const startCalendar = new Date(firstDay);
    startCalendar.setDate(1 - firstDay.getDay());
    const endCalendar = new Date(lastDay);
    endCalendar.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    return {
      weekStart: formatDateStr(monday.getFullYear(), monday.getMonth(), monday.getDate()),
      weekEnd: formatDateStr(sunday.getFullYear(), sunday.getMonth(), sunday.getDate()),
      monthStart: formatDateStr(startCalendar.getFullYear(), startCalendar.getMonth(), startCalendar.getDate()),
      monthEnd: formatDateStr(endCalendar.getFullYear(), endCalendar.getMonth(), endCalendar.getDate()),
      mondayObj: monday,
      startCalendarObj: startCalendar
    };
  }, [currentYear, currentMonth, selectedDate]);

  const filteredSchedule = useMemo(() => {
    if (categoryFilter === 'all') return schedule;
    
    return schedule.filter(item => {
      if (categoryFilter === 'academic') return ['lecture_prep', 'assessment_review'].includes(item.type);
      if (categoryFilter === 'teaching') return ['student_consultations', 'lecture_prep'].includes(item.type);
      if (categoryFilter === 'research') return ['research_writing'].includes(item.type);
      if (categoryFilter === 'meetings') return ['meetings'].includes(item.type);
      if (categoryFilter === 'committees') return ['admin', 'meetings'].includes(item.type);
      if (categoryFilter === 'supervision') return ['student_consultations'].includes(item.type);
      return item.type === categoryFilter;
    });
  }, [schedule, categoryFilter]);

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    setLoading(true);
    let unsub: any;
    
    if (viewMode === 'day') {
      unsub = subscribeSchedules(user.uid, selectedDateStr, (items) => {
        setSchedule(items);
        setLoading(false);
      });
    } else if (viewMode === 'week') {
      unsub = subscribeSchedulesRange(user.uid, dateRanges.weekStart, dateRanges.weekEnd, (items) => {
        setSchedule(items);
        setLoading(false);
      });
    } else if (viewMode === 'month') {
      unsub = subscribeSchedulesRange(user.uid, dateRanges.monthStart, dateRanges.monthEnd, (items) => {
        setSchedule(items);
        setLoading(false);
      });
    }

    return () => { if(unsub) unsub(); }
  }, [user?.uid, selectedDateStr, viewMode, dateRanges]);

  const handleDeleteEvent = (item: ScheduleItem) => {
    Alert.alert('Delete Event', `Delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => item.id && deleteSchedule(item.id) },
    ]);
  };

  const handleSeedPlanner = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
    
    const dummy: Omit<ScheduleItem, 'id' | 'createdAt'>[] = [
      { userId: user.uid, date: todayStr, startTime: '08:00', endTime: '10:00', title: 'Deep Work: Grant Writing', type: 'research_writing', notes: 'Focus on literature review section for NSF grant.' },
      { userId: user.uid, date: todayStr, startTime: '10:30', endTime: '12:00', title: 'Lecture Prep: Advanced Algorithms', type: 'lecture_prep', notes: 'Prepare slides for Chapter 5.', isAI: true },
      { userId: user.uid, date: todayStr, startTime: '12:00', endTime: '13:00', title: 'Lunch Break', type: 'break' },
      { userId: user.uid, date: todayStr, startTime: '14:00', endTime: '16:00', title: 'Student Consultations', type: 'student_consultations', notes: 'Open office hours for undergrads.' },
    ];

    for (const item of dummy) {
      await createSchedule(user.uid, item);
    }
    setLoading(false);
    Alert.alert('Success', 'Seeded schedule successfully!');
  };

  const handleEventPress = (item: ScheduleItem) => {
    if (item.type === 'meetings') {
      router.push({ 
        pathname: '/meetings', 
        params: { 
          meetingId: item.meetingId || '',
          scheduleId: item.id || '' 
        } 
      });
    } else {
      setSelectedScheduleItem(item);
    }
  };

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    // Keep selectedDate if possible, else last day of month
    const daysInNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
    if (selectedDate > daysInNewMonth) {
      setSelectedDate(daysInNewMonth);
    }
  };

  const navigateWeek = (direction: number) => {
    const d = new Date(currentYear, currentMonth, selectedDate);
    d.setDate(d.getDate() + (direction * 7));
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    setSelectedDate(d.getDate());
  };

  const navigateDay = (direction: number) => {
    const d = new Date(currentYear, currentMonth, selectedDate);
    d.setDate(d.getDate() + direction);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    setSelectedDate(d.getDate());
  }

  const handleNavigate = (direction: number) => {
    if (viewMode === 'month') navigateMonth(direction);
    else if (viewMode === 'week') navigateWeek(direction);
    else navigateDay(direction);
  }

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today.getDate());
  };

  // Calendar Grid (Month)
  const calendarDays = useMemo(() => {
    const days = [];
    const current = new Date(dateRanges.startCalendarObj);
    for (let i = 0; i < 42; i++) {
      days.push({
        date: current.getDate(),
        month: current.getMonth(),
        year: current.getFullYear(),
        dateStr: formatDateStr(current.getFullYear(), current.getMonth(), current.getDate()),
        isCurrentMonth: current.getMonth() === currentMonth,
        isToday: current.toDateString() === today.toDateString()
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [dateRanges.startCalendarObj, currentMonth]);

  // Week view columns
  const weekColumns = useMemo(() => {
    const cols = [];
    const current = new Date(dateRanges.mondayObj);
    for (let i = 0; i < 7; i++) {
      cols.push({
        date: current.getDate(),
        day: DAY_NAMES[current.getDay()],
        dateStr: formatDateStr(current.getFullYear(), current.getMonth(), current.getDate()),
        isToday: current.toDateString() === today.toDateString(),
        isSelected: current.toDateString() === new Date(currentYear, currentMonth, selectedDate).toDateString()
      });
      current.setDate(current.getDate() + 1);
    }
    return cols;
  }, [dateRanges.mondayObj, currentYear, currentMonth, selectedDate]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <LinearGradient colors={isDark ? ['#1E293B', '#0F172A'] : ['#1B2A4A', '#0F172A']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={{ fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Manage your academic schedule</Text>
            <Text style={[styles.headerTitle, { fontSize: Typography.sizes['2xl'] }]}>Planner</Text>
            {/* Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={() => handleNavigate(-1)} style={styles.navArrow}>
                <MaterialIcons name="chevron-left" size={24} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity onPress={goToToday}>
                <Text style={[styles.monthYearText, { fontSize: Typography.sizes.base }]}>
                  {viewMode === 'month' 
                    ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
                    : viewMode === 'week' ? `Week of ${MONTH_NAMES[dateRanges.mondayObj.getMonth()]} ${dateRanges.mondayObj.getDate()}`
                    : `${DAY_NAMES[new Date(currentYear, currentMonth, selectedDate).getDay()]}, ${MONTH_NAMES[currentMonth]} ${selectedDate}`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigate(1)} style={styles.navArrow}>
                <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.headerRight, { flexDirection: 'row', gap: 8 }]}>
            <TouchableOpacity style={styles.todayButton} onPress={handleSeedPlanner}>
              <MaterialIcons name="auto-awesome" size={16} color="#8B5CF6" />
              <Text style={[styles.todayButtonText, { color: '#8B5CF6' }]}>Seed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
              <MaterialIcons name="today" size={16} color={BrandColors.accent} />
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'day' && styles.toggleButtonActive]}
            onPress={() => setViewMode('day')}
          >
            <MaterialIcons name="view-day" size={14} color={viewMode === 'day' ? '#fff' : '#94A3B8'} />
            <Text style={[styles.toggleText, { fontSize: Typography.sizes.sm }, viewMode === 'day' && styles.toggleTextActive]}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]}
            onPress={() => setViewMode('week')}
          >
            <MaterialIcons name="view-week" size={14} color={viewMode === 'week' ? '#fff' : '#94A3B8'} />
            <Text style={[styles.toggleText, { fontSize: Typography.sizes.sm }, viewMode === 'week' && styles.toggleTextActive]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'month' && styles.toggleButtonActive]}
            onPress={() => setViewMode('month')}
          >
            <MaterialIcons name="calendar-month" size={14} color={viewMode === 'month' ? '#fff' : '#94A3B8'} />
            <Text style={[styles.toggleText, { fontSize: Typography.sizes.sm }, viewMode === 'month' && styles.toggleTextActive]}>Month</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterBarContent}>
        {CATEGORY_FILTERS.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.filterChip, categoryFilter === cat.key && styles.filterChipActive, isDark && categoryFilter !== cat.key && { backgroundColor: '#1E293B' }]}
            onPress={() => setCategoryFilter(cat.key)}
          >
            <MaterialIcons name={cat.icon} size={14} color={categoryFilter === cat.key ? '#fff' : '#64748B'} />
            <Text style={[styles.filterChipText, categoryFilter === cat.key && styles.filterChipTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Content Area */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
        </View>
      ) : (
        <>
          {viewMode === 'day' && <DayView schedule={filteredSchedule} selectedDateStr={selectedDateStr} isDark={isDark} handleDeleteEvent={handleDeleteEvent} handleEventPress={handleEventPress} setShowCreateModal={setShowCreateModal} Typography={Typography} />}
          {viewMode === 'week' && <WeekView schedule={filteredSchedule} weekColumns={weekColumns} isDark={isDark} handleDeleteEvent={handleDeleteEvent} handleEventPress={handleEventPress} setSelectedDate={(d: number, m: number, y: number) => { setSelectedDate(d); setCurrentMonth(m); setCurrentYear(y); setViewMode('day'); }} Typography={Typography} />}
          {viewMode === 'month' && <MonthView schedule={filteredSchedule} calendarDays={calendarDays} isDark={isDark} onSelectDay={(d: number, m: number, y: number) => { setSelectedDate(d); setCurrentMonth(m); setCurrentYear(y); setViewMode('day'); }} Typography={Typography} />}
        </>
      )}

      {/* Add Event FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <LinearGradient colors={[BrandColors.accent, BrandColors.accentDark]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <CreateEventModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userId={user?.uid || ''}
        date={selectedDateStr}
      />

      <ScheduleDetailsModal 
        visible={!!selectedScheduleItem} 
        onClose={() => setSelectedScheduleItem(null)} 
        isDark={isDark} 
        Typography={Typography} 
        item={selectedScheduleItem} 
      />
    </View>
  );
}

// ─── Views ─────────────────────────────────────────────────────────

function DayView({ schedule, selectedDateStr, isDark, handleDeleteEvent, handleEventPress, setShowCreateModal, Typography }: any) {
  const getTimePosition = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return ((h - 7) * 60 + m);
  };
  const getBlockHeight = (start: string, end: string) => getTimePosition(end) - getTimePosition(start);

  // Detect overlapping events and assign column positions
  const layoutEvents = useMemo(() => {
    if (schedule.length === 0) return [];

    const sorted = [...schedule].sort((a: any, b: any) => {
      const diff = getTimePosition(a.startTime) - getTimePosition(b.startTime);
      return diff !== 0 ? diff : getTimePosition(a.endTime) - getTimePosition(b.endTime);
    });

    const columns: any[][] = [];
    const eventLayout: { item: any; col: number; totalCols: number }[] = [];

    for (const item of sorted) {
      const itemStart = getTimePosition(item.startTime);
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        const lastInCol = columns[c][columns[c].length - 1];
        const lastEnd = getTimePosition(lastInCol.endTime);
        if (itemStart >= lastEnd) {
          columns[c].push(item);
          eventLayout.push({ item, col: c, totalCols: 0 });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([item]);
        eventLayout.push({ item, col: columns.length - 1, totalCols: 0 });
      }
    }

    // Now determine how many columns each event's group actually spans
    for (const ev of eventLayout) {
      const evStart = getTimePosition(ev.item.startTime);
      const evEnd = getTimePosition(ev.item.endTime);
      // Count how many columns have events overlapping with this one
      let maxCol = ev.col;
      for (const otherEv of eventLayout) {
        if (otherEv === ev) continue;
        const oStart = getTimePosition(otherEv.item.startTime);
        const oEnd = getTimePosition(otherEv.item.endTime);
        if (oStart < evEnd && oEnd > evStart) {
          maxCol = Math.max(maxCol, otherEv.col);
        }
      }
      ev.totalCols = maxCol + 1;
    }

    return eventLayout;
  }, [schedule]);

  return (
    <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.timeline}>
        {HOURS.map((hour) => (
          <View key={hour} style={[styles.hourRow, { top: (hour - 7) * 60 }]}>
            <Text style={[styles.hourLabel, { fontSize: Typography.sizes.xs }, isDark && styles.hourLabelDark]}>
              {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
            </Text>
            <View style={[styles.hourLine, isDark && styles.hourLineDark]} />
          </View>
        ))}

        {layoutEvents.map(({ item, col, totalCols }) => {
          const type = ACTIVITY_TYPES[item.type as keyof typeof ACTIVITY_TYPES] || { color: '#64748B', icon: 'event' as const, label: item.type };
          const top = getTimePosition(item.startTime);
          const height = getBlockHeight(item.startTime, item.endTime);
          const widthPercent = 100 / totalCols;
          const leftPercent = col * widthPercent;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.scheduleBlock,
                { 
                  top, 
                  height: Math.max(height - 2, 30), 
                  backgroundColor: type.color + '18', 
                  borderLeftColor: type.color,
                  left: `${leftPercent}%` as any,
                  right: undefined,
                  width: `${widthPercent - 1}%` as any,
                },
                isDark && { backgroundColor: type.color + '25' },
              ]}
              activeOpacity={0.7}
              onPress={() => handleEventPress(item)}
              onLongPress={() => handleDeleteEvent(item)}
            >
              <View style={styles.blockHeader}>
                <MaterialIcons name={type.icon} size={14} color={type.color} />
                <Text style={[styles.blockTime, { color: type.color }]}>{item.startTime} – {item.endTime}</Text>
                {item.isAI && (
                  <View style={[styles.aiBadge, { backgroundColor: type.color + '25' }]}>
                    <MaterialIcons name="auto-awesome" size={10} color={type.color} />
                    <Text style={[styles.aiBadgeText, { color: type.color }]}>AI</Text>
                  </View>
                )}
                {item.externalSource && (
                  <View style={[styles.aiBadge, { backgroundColor: type.color + '25' }]}>
                    <MaterialIcons name={item.externalSource === 'google' ? 'event' : 'event-note'} size={10} color={type.color} />
                    <Text style={[styles.aiBadgeText, { color: type.color, textTransform: 'capitalize' }]}>{item.externalSource}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.blockTitle, { fontSize: Typography.sizes.sm }, isDark && styles.blockTitleDark]} numberOfLines={1}>{item.title}</Text>
            </TouchableOpacity>
          );
        })}

        {schedule.length === 0 && (
          <View style={{ position: 'absolute', top: 120, left: 0, right: 0, alignItems: 'center' }}>
            <MaterialIcons name="event-available" size={48} color="#CBD5E1" />
            <Text style={{ color: '#94A3B8', marginTop: 8, fontSize: 14 }}>No events for this day</Text>
          </View>
        )}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

function WeekView({ schedule, weekColumns, isDark, handleDeleteEvent, handleEventPress, setSelectedDate, Typography }: any) {
  const getTimePosition = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return ((h - 7) * 60 + m);
  };
  const getBlockHeight = (start: string, end: string) => getTimePosition(end) - getTimePosition(start);
  
  const colWidth = (SCREEN_WIDTH - 50) / 7;

  return (
    <View style={{ flex: 1 }}>
      {/* Week Header */}
      <View style={[styles.weekHeaderRow, isDark && { borderBottomColor: '#334155' }]}>
        <View style={{ width: 50 }} />
        {weekColumns.map((col: any, idx: number) => (
          <TouchableOpacity 
            key={idx} 
            style={[styles.weekHeaderDay, { width: colWidth }, col.isToday && styles.weekHeaderDayToday]}
            onPress={() => setSelectedDate(col.date, new Date(col.dateStr).getMonth(), new Date(col.dateStr).getFullYear())}
          >
            <Text style={[styles.weekDayText, { fontSize: Typography.sizes.xs }, isDark && { color: '#94A3B8' }, col.isToday && { color: BrandColors.accent }]}>{col.day.charAt(0)}</Text>
            <Text style={[styles.weekDateText, { fontSize: Typography.sizes.sm }, isDark && { color: '#E2E8F0' }, col.isToday && { color: BrandColors.accent }]}>{col.date}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.timeline, { marginLeft: 50, marginRight: 0 }]}>
          {HOURS.map((hour) => (
            <View key={hour} style={[styles.hourRow, { top: (hour - 7) * 60, left: -50 }]}>
              <Text style={[styles.hourLabel, { fontSize: 10 }, isDark && styles.hourLabelDark, { width: 42, marginRight: 8 }]}>
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
              </Text>
              <View style={[styles.hourLine, isDark && styles.hourLineDark]} />
            </View>
          ))}
          {/* Vertical Separators */}
          {weekColumns.map((_: any, idx: number) => (
            <View key={`sep-${idx}`} style={[styles.weekColSeparator, isDark && { backgroundColor: '#334155' }, { left: idx * colWidth }]} />
          ))}

          {/* Events */}
          {schedule.map((item: any) => {
            const colIndex = weekColumns.findIndex((c: any) => c.dateStr === item.date);
            if (colIndex === -1) return null; // Should not happen

            const type = ACTIVITY_TYPES[item.type as keyof typeof ACTIVITY_TYPES] || { color: '#64748B', icon: 'event' as const, label: item.type };
            const top = getTimePosition(item.startTime);
            const height = getBlockHeight(item.startTime, item.endTime);

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.scheduleBlockWeek,
                  { 
                    top, 
                    height: Math.max(height - 2, 20), 
                    left: colIndex * colWidth + 1, 
                    width: colWidth - 2,
                    backgroundColor: type.color + '25',
                    borderLeftColor: type.color,
                  }
                ]}
                activeOpacity={0.7}
                onLongPress={() => handleDeleteEvent(item)}
                onPress={() => {
                  if (item.type === 'meetings') handleEventPress(item);
                  else setSelectedDate(new Date(item.date).getDate(), new Date(item.date).getMonth(), new Date(item.date).getFullYear());
                }}
              >
                <Text style={[styles.weekEventTitle, { fontSize: Typography.sizes.xs }, { color: type.color }]} numberOfLines={2}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

function MonthView({ schedule, calendarDays, isDark, onSelectDay, Typography }: any) {
  return (
    <View style={{ flex: 1, padding: Spacing.md }}>
      <View style={styles.monthDaysHeader}>
        {DAY_NAMES.map(d => (
          <Text key={d} style={[styles.monthDayHeaderText, { fontSize: Typography.sizes.xs }, isDark && { color: '#94A3B8' }]}>{d.substring(0,3)}</Text>
        ))}
      </View>
      <View style={[styles.monthGrid, isDark && { borderColor: '#334155' }]}>
        {calendarDays.map((day: any, idx: number) => {
          const dayEvents = schedule.filter((s: any) => s.date === day.dateStr);
          // Get up to 3 distinct colors for dots
          const eventColors = Array.from(new Set(dayEvents.map((e: any) => {
             const type = ACTIVITY_TYPES[e.type as keyof typeof ACTIVITY_TYPES];
             return type ? type.color : '#64748B';
          }))).slice(0, 3);

          return (
            <TouchableOpacity 
              key={idx} 
              style={[
                styles.monthCell, 
                !day.isCurrentMonth && { opacity: 0.3 },
                day.isToday && styles.monthCellToday,
                isDark && { borderColor: '#334155' }
              ]}
              onPress={() => onSelectDay(day.date, day.month, day.year)}
            >
              <Text style={[styles.monthCellText, { fontSize: Typography.sizes.sm }, isDark && { color: '#F1F5F9' }, day.isToday && { color: BrandColors.accent, fontWeight: 'bold' }]}>
                {day.date}
              </Text>
              <View style={styles.monthDots}>
                {eventColors.map((color: any, cidx: number) => (
                  <View key={cidx} style={[styles.monthDot, { backgroundColor: color }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Create Event Modal ───────────────────────────────────────
// Keep as is from before
function CreateEventModal({ visible, onClose, userId, date }: { visible: boolean; onClose: () => void; userId: string; date: string }) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<ScheduleItem['type']>('lecture_prep');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Missing', 'Enter a title'); return; }
    setSaving(true);
    await createSchedule(userId, { date, startTime, endTime, title: title.trim(), type, isAI: false });
    setSaving(false);
    setTitle('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A2E' }}>New Event</Text>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={24} color="#64748B" /></TouchableOpacity>
          </View>

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6 }}>Title</Text>
          <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 }} value={title} onChangeText={setTitle} placeholder="Event title..." placeholderTextColor="#94A3B8" />

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6 }}>Start</Text>
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0' }} value={startTime} onChangeText={setStartTime} placeholder="09:00" placeholderTextColor="#94A3B8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6 }}>End</Text>
              <TextInput style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0' }} value={endTime} onChangeText={setEndTime} placeholder="10:00" placeholderTextColor="#94A3B8" />
            </View>
          </View>

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6 }}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {Object.entries(ACTIVITY_TYPES).map(([key, val]) => (
              <TouchableOpacity key={key} onPress={() => setType(key as any)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: type === key ? val.color : '#F1F5F9', marginRight: 8 }}>
                <Text style={{ color: type === key ? '#fff' : '#64748B', fontWeight: '600', fontSize: 13 }}>{val.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={handleSave} disabled={saving} style={{ borderRadius: 12, overflow: 'hidden' }}>
            <LinearGradient colors={[BrandColors.accent, BrandColors.accentDark]} style={{ paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{saving ? 'Saving...' : 'Add Event'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerDark: { backgroundColor: '#0F172A' },
  header: {
    paddingTop: 56,
    paddingLeft: 68, paddingRight: Spacing.xl,
    paddingBottom: Spacing.base,
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg,
  },
  headerLeft: {},
  headerRight: { alignItems: 'flex-end', gap: Spacing.sm },
  headerTitle: { fontWeight: '700', color: '#fff' },

  monthNav: {
    flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 2,
  },
  navArrow: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  monthYearText: { fontWeight: '600', color: '#E2E8F0', paddingHorizontal: Spacing.sm },

  todayButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  todayButtonText: { fontSize: 12, fontWeight: '600', color: BrandColors.accent },

  viewToggle: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.full, padding: 3,
  },
  toggleButton: {
    flex: 1, flexDirection: 'row', paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  toggleButtonActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  toggleText: { color: '#94A3B8', fontWeight: '500' },
  toggleTextActive: { color: '#fff', fontWeight: '700' },

  timelineScroll: { flex: 1 },
  timeline: { marginLeft: 56, marginRight: Spacing.xl, height: 12 * 60, position: 'relative' },
  hourRow: { position: 'absolute', left: -56, right: 0, flexDirection: 'row', alignItems: 'flex-start' },
  hourLabel: { width: 48, color: '#94A3B8', textAlign: 'right', marginRight: Spacing.sm },
  hourLabelDark: { color: '#64748B' },
  hourLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0', marginTop: 7 },
  hourLineDark: { backgroundColor: '#334155' },

  scheduleBlock: {
    position: 'absolute', left: 0, right: 0, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderLeftWidth: 3, justifyContent: 'center', overflow: 'hidden'
  },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  blockTime: { fontSize: 11, fontWeight: '600' },
  blockTitle: { fontWeight: '600', color: '#1A1A2E' },
  blockTitleDark: { color: '#E2E8F0' },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: BorderRadius.sm, gap: 2, marginLeft: 'auto',
  },
  aiBadgeText: { fontSize: 9, fontWeight: '700' },

  // Week View Specific
  weekHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: Spacing.sm, paddingTop: Spacing.sm },
  weekHeaderDay: { alignItems: 'center', justifyContent: 'center' },
  weekHeaderDayToday: {},
  weekDayText: { fontSize: 10, color: '#64748B', fontWeight: 'bold' },
  weekDateText: { fontSize: 14, color: '#334155', fontWeight: '600' },
  weekColSeparator: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#E2E8F0' },
  scheduleBlockWeek: {
    position: 'absolute', borderRadius: BorderRadius.sm, padding: 2,
    borderLeftWidth: 2, overflow: 'hidden'
  },
  weekEventTitle: { fontSize: 9, fontWeight: 'bold', lineHeight: 11 },

  // Month View Specific
  monthDaysHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  monthDayHeaderText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: '#E2E8F0', borderBottomWidth: 0, borderRightWidth: 0 },
  monthCell: { width: '14.28%', aspectRatio: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8F0', padding: 4 },
  monthCellToday: { backgroundColor: BrandColors.accent + '10' },
  monthCellText: { fontSize: 12, color: '#334155', textAlign: 'center', marginBottom: 2 },
  monthDots: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' },
  monthDot: { width: 6, height: 6, borderRadius: 3 },

  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, 
    borderRadius: 26, overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' } as any
      : { elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }),
  },

  // Category Filter
  filterBar: { maxHeight: 48 },
  filterBarContent: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    backgroundColor: '#F1F5F9', borderRadius: BorderRadius.full,
  },
  filterChipActive: { backgroundColor: BrandColors.accent },
  filterChipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
});
