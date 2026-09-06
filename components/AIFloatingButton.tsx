/**
 * CampusMind AI - Floating AI Assistant Button
 * Gradient FAB with pulsing glow. Opens AI chat as a modal overlay.
 * Available on ALL screens (Personal & Institutional workspaces).
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { sendChatCompletion, isGeminiConfigured } from '@/services/gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm your CampusMind AI Assistant. I can help you with:\n\n📧 Draft emails (student inquiries, extension requests)\n📅 Plan your academic schedule\n🔬 Research writing assistance\n📊 Workload analysis\n📝 Report generation\n\nHow can I assist you today?",
    timestamp: new Date(),
  },
];

const QUICK_PROMPTS = [
  { icon: '📧', label: 'Draft Email Reply', prompt: 'Help me draft a reply to a student requesting an extension for their CS201 assignment' },
  { icon: '📅', label: 'Plan My Week', prompt: 'Generate an optimal weekly schedule for my teaching, research, and admin tasks' },
  { icon: '🔬', label: 'Research Help', prompt: 'Help me outline the methodology section for my AI Ethics paper' },
  { icon: '📊', label: 'Workload Check', prompt: 'Analyze my current workload and suggest optimizations' },
];

export default function AIFloatingButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  // Pulse animation for the FAB
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.6, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim, glowAnim]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Try real Gemini first, falls back to simulated
      const response = await sendChatCompletion(
        [{ role: 'user', content: messageText }]
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('[AIFloatingButton] Chat Error:', error);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }

    setIsTyping(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
        {/* Glow ring */}
        <Animated.View style={[styles.fabGlow, { opacity: glowAnim }]} />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[BrandColors.secondary, BrandColors.accent]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="auto-awesome" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* AI Chat Modal */}
      <Modal visible={modalVisible} animationType="slide" statusBarTranslucent>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <LinearGradient
                colors={[BrandColors.secondary, BrandColors.accent]}
                style={styles.aiAvatar}
              >
                <MaterialIcons name="auto-awesome" size={20} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.modalTitle}>CampusMind AI</Text>
                <Text style={styles.modalSubtitle}>
                  {isTyping ? '● Thinking...' : isGeminiConfigured() ? '● Connected to Gemini' : '● Simulated Mode'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Chat Area */}
          <KeyboardAvoidingView
            style={styles.chatArea}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              ref={scrollRef}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Quick Prompts (show only when no user messages) */}
              {messages.length <= 1 && (
                <View style={styles.quickPrompts}>
                  <Text style={styles.quickPromptsLabel}>Quick Actions</Text>
                  <View style={styles.quickPromptsGrid}>
                    {QUICK_PROMPTS.map((qp, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.quickPromptCard}
                        onPress={() => sendMessage(qp.prompt)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quickPromptIcon}>{qp.icon}</Text>
                        <Text style={styles.quickPromptLabel}>{qp.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[styles.messageBubbleRow, msg.role === 'user' ? styles.userRow : styles.assistantRow]}
                >
                  {msg.role === 'assistant' && (
                    <LinearGradient
                      colors={[BrandColors.secondary, BrandColors.accent]}
                      style={styles.bubbleAvatar}
                    >
                      <MaterialIcons name="auto-awesome" size={12} color="#fff" />
                    </LinearGradient>
                  )}
                  <View style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                    <Text style={[styles.messageText, msg.role === 'user' && styles.userText]}>{msg.content}</Text>
                    <Text style={[styles.messageTime, msg.role === 'user' && styles.userTime]}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <View style={[styles.messageBubbleRow, styles.assistantRow]}>
                  <LinearGradient colors={[BrandColors.secondary, BrandColors.accent]} style={styles.bubbleAvatar}>
                    <MaterialIcons name="auto-awesome" size={12} color="#fff" />
                  </LinearGradient>
                  <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, { marginLeft: 4 }]} />
                    <View style={[styles.typingDot, { marginLeft: 4 }]} />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputArea}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ask CampusMind AI..."
                  placeholderTextColor="#94A3B8"
                  value={input}
                  onChangeText={setInput}
                  multiline
                  maxLength={2000}
                />
                <TouchableOpacity
                  style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                  onPress={() => sendMessage()}
                  disabled={!input.trim()}
                >
                  <LinearGradient
                    colors={input.trim() ? [BrandColors.accent, BrandColors.accentDark] : ['#CBD5E1', '#94A3B8']}
                    style={styles.sendGradient}
                  >
                    <MaterialIcons name="send" size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <Text style={styles.disclaimer}>AI responses are for guidance only. Always verify critical information.</Text>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

// Export a function to open the AI modal from other components
export let openAIAssistant: (() => void) | null = null;

const styles = StyleSheet.create({
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    zIndex: 90,
  },
  fabGlow: {
    position: 'absolute',
    top: -6, left: -6, right: -6, bottom: -6,
    borderRadius: 36,
    backgroundColor: BrandColors.accent,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: `0px 4px 12px ${BrandColors.accent}66` } as any
      : { shadowColor: BrandColors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 }),
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: {
    paddingTop: 52, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  modalHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#fff' },
  modalSubtitle: { fontSize: Typography.sizes.xs, color: BrandColors.accentLight },
  closeButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
  },

  // Chat
  chatArea: { flex: 1 },
  messageList: { flex: 1 },
  messageListContent: { padding: Spacing.xl, paddingBottom: Spacing.md },

  quickPrompts: { marginBottom: Spacing.xl },
  quickPromptsLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: '#64748B', marginBottom: Spacing.md },
  quickPromptsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickPromptCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: BorderRadius.lg,
    padding: Spacing.base, borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  quickPromptIcon: { fontSize: 24, marginBottom: Spacing.sm },
  quickPromptLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: '#334155' },

  messageBubbleRow: { flexDirection: 'row', marginBottom: Spacing.md, alignItems: 'flex-end', gap: Spacing.sm },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start' },
  bubbleAvatar: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  messageBubble: { maxWidth: '78%', borderRadius: BorderRadius.lg, padding: Spacing.md },
  userBubble: { backgroundColor: BrandColors.accent, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  messageText: { fontSize: Typography.sizes.md, color: '#334155', lineHeight: 22 },
  userText: { color: '#fff' },
  messageTime: { fontSize: 10, color: '#94A3B8', marginTop: 6, textAlign: 'right' },
  userTime: { color: 'rgba(255,255,255,0.7)' },
  typingBubble: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.base, paddingHorizontal: Spacing.lg },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#94A3B8' },

  // Input
  inputArea: {
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, paddingTop: Spacing.md,
    backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff',
    borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    gap: Spacing.xs, borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  textInput: { flex: 1, fontSize: Typography.sizes.md, color: '#1A1A2E', maxHeight: 100, paddingVertical: Spacing.sm },
  sendButton: {},
  sendButtonDisabled: { opacity: 0.5 },
  sendGradient: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  disclaimer: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: Spacing.sm },
});
