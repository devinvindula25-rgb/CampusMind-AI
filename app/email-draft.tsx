/**
 * CampusMind AI - Email Draft Composer
 * Modal screen to manually write or AI-generate email drafts.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeEngine } from '@/contexts/SettingsContext';
import { BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { createEmailDraft, updateEmailDraft, deleteEmailDraft } from '@/services/firestore';
import { draftEmail } from '@/services/gemini';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function EmailDraftScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { BrandColors, Typography, isDark } = useThemeEngine();

  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    if (id) {
      // Load existing draft
      const loadDraft = async () => {
        try {
          const docRef = doc(db, 'emailDrafts', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRecipient(data.recipient || '');
            setSubject(data.subject || '');
            setBody(data.body || '');
          }
        } catch (e) {
          console.error('Failed to load draft:', e);
        } finally {
          setLoading(false);
        }
      };
      loadDraft();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleSave = async (closeAfter: boolean = true) => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      if (id) {
        await updateEmailDraft(id, { recipient, subject, body, status: 'draft' });
      } else {
        await createEmailDraft(user.uid, { recipient, subject, body, status: 'draft' });
      }
      if (closeAfter) router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!user?.uid) return;
    if (!recipient) {
      Alert.alert('Missing Recipient', 'Please specify a recipient email address.');
      return;
    }
    
    // Auto-save first
    if (!id) {
      await handleSave(false);
    }
    
    // Launch native mail app
    const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const url = `mailto:${recipient}?${query}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        // Mark as sent in DB
        if (id) {
           await updateEmailDraft(id, { status: 'sent' });
        }
        router.back();
      } else {
        Alert.alert('Error', 'No email app installed on this device.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open email app.');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    Alert.alert('Delete Draft', 'Are you sure you want to discard this draft?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: async () => {
        try {
          await deleteEmailDraft(id);
          router.back();
        } catch (e) {
          Alert.alert('Error', 'Failed to delete draft.');
        }
      }}
    ]);
  };

  const handleAIGenerate = () => {
    setShowAIModal(true);
  };

  const runAI = async (type: 'student_inquiry' | 'extension_request' | 'general') => {
    setShowAIModal(false);
    setGenerating(true);
    try {
      const generated = await draftEmail(type, body.length > 5 ? body : undefined);
      setBody(generated);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate AI draft.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, isDark && { backgroundColor: '#0F172A' }, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={BrandColors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, isDark && { backgroundColor: '#0F172A' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: Typography.sizes.lg }]}>
            {id ? 'Edit Draft' : 'New Email'}
          </Text>
          <TouchableOpacity onPress={() => handleSave(true)} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <MaterialIcons name="save" size={24} color="#fff" />}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Recipient & Subject */}
        <View style={[styles.fieldContainer, isDark && { borderBottomColor: '#334155' }]}>
          <Text style={[styles.fieldLabel, { fontSize: Typography.sizes.md }, isDark && { color: '#94A3B8' }]}>To:</Text>
          <TextInput
            style={[styles.fieldInput, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}
            placeholder="student@university.edu"
            placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
            value={recipient}
            onChangeText={setRecipient}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={[styles.fieldContainer, isDark && { borderBottomColor: '#334155' }]}>
          <Text style={[styles.fieldLabel, { fontSize: Typography.sizes.md }, isDark && { color: '#94A3B8' }]}>Subject:</Text>
          <TextInput
            style={[styles.fieldInput, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}
            placeholder="Extension Request Update"
            placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        {/* AI Action Bar */}
        <View style={[styles.aiBar, isDark && { backgroundColor: '#1E293B' }]}>
          <TouchableOpacity style={styles.aiButton} onPress={handleAIGenerate} disabled={generating}>
            {generating ? (
              <ActivityIndicator size="small" color={BrandColors.secondary} />
            ) : (
              <>
                <MaterialIcons name="auto-awesome" size={20} color={BrandColors.secondary} />
                <Text style={[styles.aiButtonText, { color: BrandColors.secondary, fontSize: Typography.sizes.sm }]}>
                  AI Assist
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={[styles.aiHint, { fontSize: Typography.sizes.xs }, isDark && { color: '#64748B' }]}>
            Tap to generate or rewrite body
          </Text>
        </View>

        {/* Body Editor */}
        <TextInput
          style={[styles.bodyInput, { fontSize: Typography.sizes.md }, isDark && { color: '#F1F5F9' }]}
          placeholder="Write your email here, or use AI Assist to generate a draft..."
          placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.footer, isDark && { borderTopColor: '#334155', backgroundColor: '#0F172A' }]}>
        {id && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={24} color={BrandColors.error} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: BrandColors.accent }]} onPress={handleSend}>
          <Text style={[styles.sendButtonText, { fontSize: Typography.sizes.md }]}>Send via Mail App</Text>
          <MaterialIcons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* AI Type Selector Modal */}
      {showAIModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && { backgroundColor: '#1E293B' }]}>
            <Text style={[styles.modalTitle, isDark && { color: '#F1F5F9' }]}>AI Email Assistant</Text>
            <Text style={[styles.modalSubtitle, isDark && { color: '#94A3B8' }]}>What type of email are you drafting?</Text>
            
            <TouchableOpacity style={[styles.modalOption, isDark && { borderBottomColor: '#334155' }]} onPress={() => runAI('student_inquiry')}>
              <Text style={[styles.modalOptionText, isDark && { color: '#F1F5F9' }]}>Student Inquiry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalOption, isDark && { borderBottomColor: '#334155' }]} onPress={() => runAI('extension_request')}>
              <Text style={[styles.modalOptionText, isDark && { color: '#F1F5F9' }]}>Extension Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalOption, isDark && { borderBottomColor: '#334155' }]} onPress={() => runAI('general')}>
              <Text style={[styles.modalOptionText, isDark && { color: '#F1F5F9' }]}>General Academic</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAIModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 56, paddingBottom: Spacing.lg, paddingLeft: 68, paddingRight: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backButton: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontWeight: '700', color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  
  fieldContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  fieldLabel: { color: '#64748B', width: 60, fontWeight: '500' },
  fieldInput: { flex: 1, color: '#1A1A2E', padding: 0 },
  
  aiBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  aiButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.md,
  },
  aiButtonText: { fontWeight: '600' },
  aiHint: { color: '#94A3B8' },
  
  bodyInput: {
    flex: 1, minHeight: 300, padding: Spacing.xl,
    color: '#1A1A2E', lineHeight: 24,
  },
  
  footer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
  },
  deleteButton: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center',
  },
  sendButton: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg, ...Shadows.sm,
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '80%', maxWidth: 400,
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14, color: '#64748B', marginBottom: Spacing.lg,
  },
  modalOption: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  modalOptionText: {
    fontSize: 16, color: '#1A1A2E',
  },
  modalCancel: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  modalCancelText: {
    color: '#EF4444', fontWeight: 'bold', fontSize: 16,
  }
});
