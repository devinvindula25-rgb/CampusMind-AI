/**
 * CampusMind AI - Focus Mode Component
 * Full-screen distraction-free overlay with ergonomic reminders.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Vibration,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';

interface FocusModeProps {
  visible: boolean;
  taskTitle: string;
  taskColor: string;
  onClose: (sessionMinutes: number) => void;
}

const ERGONOMIC_TIPS = [
  { title: '👀 20-20-20 Rule', message: 'Look at something 20 feet away for 20 seconds.', interval: 20 },
  { title: '🧘 Stand & Stretch', message: 'Time to stand up and stretch your body!', interval: 45 },
  { title: '💧 Stay Hydrated', message: 'Remember to drink some water.', interval: 60 },
  { title: '🫁 Deep Breath', message: 'Take 3 deep breaths to reset your focus.', interval: 30 },
];

export default function FocusMode({ visible, taskTitle, taskColor, onClose }: FocusModeProps) {
  const { settings } = useSettings();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTip, setCurrentTip] = useState<typeof ERGONOMIC_TIPS[0] | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tipOpacity = useRef(new Animated.Value(0)).current;

  // Timer
  useEffect(() => {
    if (!visible) {
      setElapsedSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [visible]);

  // Pulse animation
  useEffect(() => {
    if (!visible) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [visible, pulseAnim]);

  // Ergonomic reminders
  useEffect(() => {
    if (!visible || !settings.ergonomicReminders) return;

    const interval = settings.reminderInterval * 60; // convert to seconds
    const checker = setInterval(() => {
      const minutes = Math.floor(elapsedSeconds / 60);
      if (minutes > 0 && minutes % settings.reminderInterval === 0 && elapsedSeconds % 60 === 0) {
        const tipIndex = Math.floor(Math.random() * ERGONOMIC_TIPS.length);
        showTip(ERGONOMIC_TIPS[tipIndex]);
      }
    }, 1000);

    return () => clearInterval(checker);
  }, [visible, elapsedSeconds, settings.ergonomicReminders, settings.reminderInterval]);

  const showTip = (tip: typeof ERGONOMIC_TIPS[0]) => {
    setCurrentTip(tip);
    if (Platform.OS !== 'web') {
      Vibration.vibrate(200);
    }
    Animated.sequence([
      Animated.timing(tipOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(5000),
      Animated.timing(tipOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setCurrentTip(null));
  };

  const handleExit = () => {
    const minutes = Math.round(elapsedSeconds / 60);
    Alert.alert(
      'Exit Focus Mode?',
      `You've been focused for ${formatTime(elapsedSeconds)}. End this session?`,
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'End Session', onPress: () => onClose(minutes) },
      ]
    );
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <LinearGradient
        colors={['#0F172A', '#1B2A4A']}
        style={styles.container}
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <MaterialIcons name="close" size={20} color="#94A3B8" />
            <Text style={styles.exitText}>Exit Focus</Text>
          </TouchableOpacity>
        </View>

        {/* Center Content */}
        <View style={styles.center}>
          {/* Task Color Ring */}
          <Animated.View style={[styles.timerRing, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[styles.timerRingInner, { borderColor: taskColor + '40' }]}>
              <View style={[styles.timerRingCore, { borderColor: taskColor }]}>
                <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
                <Text style={styles.timerLabel}>Elapsed</Text>
              </View>
            </View>
          </Animated.View>

          {/* Task Info */}
          <View style={styles.taskInfo}>
            <View style={[styles.taskDot, { backgroundColor: taskColor }]} />
            <Text style={styles.taskTitle}>{taskTitle}</Text>
          </View>

          {/* Focus Quote */}
          <Text style={styles.focusQuote}>
            &quot;Deep work is the ability to focus without distraction on a cognitively demanding task.&quot;
          </Text>
          <Text style={styles.focusAuthor}>— Cal Newport</Text>
        </View>

        {/* Ergonomic Tip Toast */}
        {currentTip && (
          <Animated.View style={[styles.tipToast, { opacity: tipOpacity }]}>
            <LinearGradient
              colors={[BrandColors.accent + '20', BrandColors.secondary + '20']}
              style={styles.tipGradient}
            >
              <Text style={styles.tipTitle}>{currentTip.title}</Text>
              <Text style={styles.tipMessage}>{currentTip.message}</Text>
              <TouchableOpacity
                style={styles.tipDismiss}
                onPress={() => {
                  Animated.timing(tipOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
                }}
              >
                <Text style={styles.tipDismissText}>Got it</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.manualTipButton}
            onPress={() => showTip(ERGONOMIC_TIPS[0])}
          >
            <MaterialIcons name="self-improvement" size={20} color="#64748B" />
            <Text style={styles.manualTipText}>Take a Break</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  header: {
    paddingTop: 56, paddingHorizontal: Spacing.xl,
    alignItems: 'flex-end',
  },
  exitButton: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.06)',
  },
  exitText: { fontSize: Typography.sizes.sm, color: '#94A3B8', fontWeight: Typography.weights.medium },

  center: { alignItems: 'center', paddingHorizontal: Spacing['2xl'] },
  timerRing: { marginBottom: Spacing['2xl'] },
  timerRingInner: {
    width: 200, height: 200, borderRadius: 100, borderWidth: 3,
    justifyContent: 'center', alignItems: 'center', padding: 8,
  },
  timerRingCore: {
    width: '100%', height: '100%', borderRadius: 100, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  timerText: { fontSize: 42, fontWeight: '200', color: '#fff', letterSpacing: 2 },
  timerLabel: { fontSize: Typography.sizes.sm, color: '#64748B', marginTop: 4 },

  taskInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  taskDot: { width: 10, height: 10, borderRadius: 5 },
  taskTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold, color: '#CBD5E1' },

  focusQuote: {
    fontSize: Typography.sizes.sm, color: '#64748B', fontStyle: 'italic',
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.sm,
  },
  focusAuthor: { fontSize: Typography.sizes.xs, color: '#475569' },

  // Tip Toast
  tipToast: {
    position: 'absolute', bottom: 120, left: Spacing.xl, right: Spacing.xl,
  },
  tipGradient: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: BrandColors.accent + '20',
  },
  tipTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#fff', marginBottom: Spacing.sm },
  tipMessage: { fontSize: Typography.sizes.md, color: '#CBD5E1', lineHeight: 22, marginBottom: Spacing.md },
  tipDismiss: {
    alignSelf: 'flex-end', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: BrandColors.accent + '20',
  },
  tipDismissText: { fontSize: Typography.sizes.sm, color: BrandColors.accent, fontWeight: Typography.weights.bold },

  bottomControls: { paddingBottom: Spacing['3xl'], alignItems: 'center' },
  manualTipButton: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full, backgroundColor: 'rgba(255,255,255,0.06)',
  },
  manualTipText: { fontSize: Typography.sizes.sm, color: '#64748B', fontWeight: Typography.weights.medium },
});
