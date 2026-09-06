/**
 * CampusMind AI - Notifications Screen
 * Smart notifications with priority-based display, filtering, and live CRUD.
 * Data sourced from Firestore with real-time listeners.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import {
  subscribeNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/services/firestore';
import type { Notification } from '@/services/firestoreTypes';

const FILTER_TABS = ['All', 'Unread', 'Urgent', 'Compliance', 'Reviews'];

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Real-time listener
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const unsub = subscribeNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const filtered = notifications.filter((n) => {
    switch (activeFilter) {
      case 'Unread': return !n.read;
      case 'Urgent': return n.priority === 'urgent' || n.priority === 'high';
      case 'Compliance': return n.type === 'compliance';
      case 'Reviews': return n.type === 'review';
      default: return true;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    if (!user?.uid) return;
    await markAllNotificationsRead(user.uid);
  };

  const handleTapNotification = async (notif: Notification) => {
    if (!notif.read && notif.id) {
      await markNotificationRead(notif.id);
    }
  };

  const handleDelete = (notif: Notification) => {
    Alert.alert('Delete Notification', `Delete "${notif.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => notif.id && deleteNotification(notif.id) },
    ]);
  };

  const getTimeDiff = (isoStr: string) => {
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? 'Loading...' : `${unreadCount} unread notifications`}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
                <MaterialIcons name="done-all" size={18} color={BrandColors.accent} />
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
                {tab}
              </Text>
              {tab === 'Unread' && unreadCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.accent} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="notifications-none" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>You&apos;re all caught up!</Text>
            </View>
          ) : (
            filtered.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                activeOpacity={0.7}
                onPress={() => handleTapNotification(notif)}
                onLongPress={() => handleDelete(notif)}
              >
                {!notif.read && <View style={styles.unreadDot} />}
                <View style={[styles.notifIcon, { backgroundColor: getNotifIconBg(notif.type) }]}>
                  <MaterialIcons name={getNotifIcon(notif.type)} size={20} color={getNotifIconColor(notif.type)} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]} numberOfLines={1}>
                      {notif.title}
                    </Text>
                    <PriorityBadge priority={notif.priority} />
                  </View>
                  <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
                  <View style={styles.notifFooter}>
                    <Text style={styles.notifTime}>{getTimeDiff(notif.createdAt)}</Text>
                    <TouchableOpacity onPress={() => handleDelete(notif)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <MaterialIcons name="delete-outline" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      )}

      {/* Create Notification Modal */}
      <CreateNotificationModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userId={user?.uid || ''}
      />
    </View>
  );
}

// ─── Create Modal ─────────────────────────────────────────────

function CreateNotificationModal({ visible, onClose, userId }: { visible: boolean; onClose: () => void; userId: string }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<Notification['type']>('system');
  const [priority, setPriority] = useState<Notification['priority']>('medium');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Missing Fields', 'Please fill in title and message.');
      return;
    }
    setSaving(true);
    await createNotification(userId, { title: title.trim(), message: message.trim(), type, priority, read: false });
    setSaving(false);
    setTitle('');
    setMessage('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Notification</Text>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={24} color="#64748B" /></TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput style={styles.textInput} value={title} onChangeText={setTitle} placeholder="Notification title..." placeholderTextColor="#94A3B8" />

          <Text style={styles.fieldLabel}>Message</Text>
          <TextInput style={[styles.textInput, { height: 80 }]} value={message} onChangeText={setMessage} placeholder="Notification message..." placeholderTextColor="#94A3B8" multiline />

          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.chipRow}>
            {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
              <TouchableOpacity key={p} style={[styles.chip, priority === p && styles.chipActive]} onPress={() => setPriority(p)}>
                <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.chipRow}>
            {(['system', 'compliance', 'review', 'deadline', 'meeting', 'research'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipActive]} onPress={() => setType(t)}>
                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <LinearGradient colors={[BrandColors.accent, BrandColors.accentDark]} style={styles.saveGradient}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Create Notification'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const config = {
    urgent: { bg: BrandColors.errorBg, color: BrandColors.error, label: 'URGENT' },
    high: { bg: BrandColors.warningBg, color: BrandColors.warning, label: 'HIGH' },
    medium: { bg: BrandColors.infoBg, color: BrandColors.info, label: 'MEDIUM' },
    low: { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'LOW' },
  }[priority] || { bg: '#eee', color: '#888', label: priority };

  return (
    <View style={[styles.priorityBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.priorityText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

function getNotifIcon(type: string): keyof typeof MaterialIcons.glyphMap {
  switch (type) {
    case 'compliance': return 'verified';
    case 'review': return 'rate-review';
    case 'deadline': return 'event';
    case 'ai_recommendation': return 'smart-toy';
    case 'meeting': return 'groups';
    case 'research': return 'science';
    case 'system': return 'info';
    default: return 'notifications';
  }
}

function getNotifIconBg(type: string) {
  switch (type) {
    case 'compliance': return BrandColors.errorBg;
    case 'review': return BrandColors.infoBg;
    case 'deadline': return BrandColors.warningBg;
    case 'ai_recommendation': return 'rgba(108,99,255,0.12)';
    case 'system': return 'rgba(100,116,139,0.12)';
    default: return '#F1F5F9';
  }
}

function getNotifIconColor(type: string) {
  switch (type) {
    case 'compliance': return BrandColors.error;
    case 'review': return BrandColors.info;
    case 'deadline': return BrandColors.warning;
    case 'ai_recommendation': return BrandColors.secondary;
    case 'system': return '#64748B';
    default: return '#94A3B8';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 56, paddingLeft: 68, paddingRight: Spacing.xl, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: '#fff' },
  headerSubtitle: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  markAllButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: 'rgba(0,180,216,0.1)',
  },
  markAllText: { fontSize: Typography.sizes.xs, color: BrandColors.accent, fontWeight: Typography.weights.semibold },
  addButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: BrandColors.accent, justifyContent: 'center', alignItems: 'center',
  },
  filterContainer: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, marginRight: Spacing.sm, borderRadius: BorderRadius.full, gap: 6 },
  filterTabActive: { backgroundColor: BrandColors.accent + '18' },
  filterTabText: { fontSize: Typography.sizes.sm, color: '#64748B', fontWeight: Typography.weights.medium },
  filterTabTextActive: { color: BrandColors.accent, fontWeight: Typography.weights.bold },
  filterBadge: { backgroundColor: BrandColors.error, borderRadius: BorderRadius.full, paddingHorizontal: 6, paddingVertical: 1 },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: Typography.sizes.sm, color: '#94A3B8' },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  emptyState: { alignItems: 'center', paddingTop: Spacing['5xl'] },
  emptyTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#334155', marginTop: Spacing.base },
  emptySubtitle: { fontSize: Typography.sizes.sm, color: '#94A3B8', marginTop: 4 },

  notifCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginBottom: Spacing.md, gap: Spacing.md, ...Shadows.sm,
  },
  notifCardUnread: { backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: BrandColors.accent + '20' },
  unreadDot: { position: 'absolute', top: Spacing.base, left: Spacing.sm, width: 6, height: 6, borderRadius: 3, backgroundColor: BrandColors.accent },
  notifIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: Spacing.sm },
  notifTitle: { flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium, color: '#334155' },
  notifTitleUnread: { fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  notifMessage: { fontSize: Typography.sizes.sm, color: '#64748B', lineHeight: 20, marginBottom: 4 },
  notifFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTime: { fontSize: Typography.sizes.xs, color: '#94A3B8' },
  priorityBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  priorityText: { fontSize: 9, fontWeight: Typography.weights.bold },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], padding: Spacing.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: '#1A1A2E' },
  fieldLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: '#64748B', marginBottom: Spacing.sm, marginTop: Spacing.md },
  textInput: {
    backgroundColor: '#F8FAFC', borderRadius: BorderRadius.md, padding: Spacing.md,
    fontSize: Typography.sizes.md, color: '#1A1A2E', borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: BrandColors.accent },
  chipText: { fontSize: Typography.sizes.sm, color: '#64748B', fontWeight: Typography.weights.medium, textTransform: 'capitalize' },
  chipTextActive: { color: '#fff', fontWeight: Typography.weights.bold },
  saveButton: { marginTop: Spacing.xl, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  saveGradient: { paddingVertical: Spacing.base, alignItems: 'center' },
  saveButtonText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: '#fff' },
});
