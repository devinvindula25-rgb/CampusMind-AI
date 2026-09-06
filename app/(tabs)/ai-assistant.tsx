/**
 * CampusMind AI - AI Academic & Email Assistant
 * Chat interface that doubles as an AI Email Assistant with context-aware drafting.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandColors, BorderRadius, Spacing, Typography } from '@/constants/theme';

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
    content: 'Hello! I\'m your CampusMind AI Assistant. I can help you with:\n\n📧 Draft emails (student inquiries, extension requests, supervisor comms)\n📅 Plan your academic schedule\n🔬 Research writing assistance\n📊 Workload analysis\n📝 Report generation\n\nHow can I assist you today?',
    timestamp: new Date(),
  },
];

const QUICK_PROMPTS = [
  { icon: '📧', label: 'Draft Email Reply', prompt: 'Help me draft a reply to a student requesting an extension for their CS201 assignment' },
  { icon: '📅', label: 'Plan My Week', prompt: 'Generate an optimal weekly schedule for my teaching, research, and admin tasks' },
  { icon: '🔬', label: 'Research Help', prompt: 'Help me outline the methodology section for my AI Ethics paper' },
  { icon: '📊', label: 'Workload Check', prompt: 'Analyze my current workload and suggest optimizations' },
];

const EMAIL_CONTEXTS = [
  { label: 'Student Inquiry', value: 'student_inquiry', icon: 'school' as const },
  { label: 'Extension Request', value: 'extension_request', icon: 'schedule' as const },
  { label: 'Supervisor Comm.', value: 'supervisor', icon: 'person' as const },
  { label: 'Committee', value: 'committee', icon: 'groups' as const },
];

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmailContexts, setShowEmailContexts] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isTyping, typingDots]);

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
    setShowEmailContexts(false);
    setIsTyping(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(messageText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1B2A4A', '#0F172A']} style={styles.header}>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={[BrandColors.secondary, BrandColors.accent]}
            style={styles.aiAvatar}
          >
            <MaterialIcons name="smart-toy" size={22} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? 'Thinking...' : 'Online • Academic & Email Assistant'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.emailModeButton}
          onPress={() => setShowEmailContexts(!showEmailContexts)}
        >
          <MaterialIcons name="email" size={20} color={showEmailContexts ? BrandColors.accent : '#fff'} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Email Context Bar */}
      {showEmailContexts && (
        <View style={styles.emailContextBar}>
          <Text style={styles.emailContextLabel}>Email Context:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {EMAIL_CONTEXTS.map((ctx) => (
              <TouchableOpacity
                key={ctx.value}
                style={styles.emailContextChip}
                onPress={() => sendMessage(`Draft a professional email reply for a ${ctx.label.toLowerCase()}`)}
              >
                <MaterialIcons name={ctx.icon} size={14} color={BrandColors.accent} />
                <Text style={styles.emailContextChipText}>{ctx.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Messages */}
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
          {/* Quick Prompts */}
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

          {/* Message Bubbles */}
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
                  <MaterialIcons name="smart-toy" size={14} color="#fff" />
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

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageBubbleRow, styles.assistantRow]}>
              <LinearGradient colors={[BrandColors.secondary, BrandColors.accent]} style={styles.bubbleAvatar}>
                <MaterialIcons name="smart-toy" size={14} color="#fff" />
              </LinearGradient>
              <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                <Animated.View style={[styles.typingDot, { opacity: typingDots }]} />
                <Animated.View style={[styles.typingDot, { opacity: typingDots, marginLeft: 4 }]} />
                <Animated.View style={[styles.typingDot, { opacity: typingDots, marginLeft: 4 }]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton} onPress={() => setShowEmailContexts(!showEmailContexts)}>
              <MaterialIcons name="email" size={22} color="#64748B" />
            </TouchableOpacity>
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
  );
}

function getSimulatedResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('email') && (lower.includes('extension') || lower.includes('student'))) {
    return '📧 **Draft Email – Student Extension Request**\n\n---\n\nDear [Student Name],\n\nThank you for reaching out regarding your CS201 assignment extension request.\n\nI understand that unexpected circumstances can affect your ability to meet deadlines. I am happy to grant you a **3-day extension**, making your new submission deadline **[Date]**.\n\nPlease ensure your work is submitted via the online portal by the revised date. If you require further assistance or are experiencing ongoing difficulties, please do not hesitate to contact Student Support Services.\n\nBest regards,\n[Your Name]\nSenior Lecturer, Department of Computer Science\n\n---\n\n*Tone: Professional & Supportive. Would you like me to adjust the tone or add any conditions?*';
  }

  if (lower.includes('schedule') || lower.includes('plan') || lower.includes('week')) {
    return '📅 **Optimized Weekly Schedule Suggestion**\n\n**Monday**\n• 8-10: Lecture Prep (CS201 & CS301)\n• 10-12: Teaching – CS201 Lecture\n• 1-3: Research Writing Block\n• 3-4: Student Office Hours\n\n**Tuesday**\n• 9-11: Research Lab Work\n• 11-12: Ethics Committee Meeting\n• 1-3: Assessment Marking (CS301)\n• 3-4: Admin & Emails\n\n**Wednesday**\n• 8-10: Teaching – CS301 Lecture\n• 10-12: Research Writing Block\n• 1-2: PhD Student Supervision\n• 2-4: Grant Application Writing\n\n**Thursday**\n• 9-11: Teaching – CS201 Tutorial\n• 11-12: Department Meeting\n• 1-3: Research (Data Analysis)\n• 4-5: Peer Review\n\n**Friday**\n• 9-11: Flexible Research/Writing\n• 11-12: Student Consultations\n• 1-2: Weekly Planning & Reflection\n• *Afternoon: Protected personal time*\n\n💡 *This schedule protects 10+ hours of research time and limits meetings to 4 slots. Shall I adjust any blocks?*';
  }

  if (lower.includes('workload') || lower.includes('analyze')) {
    return '📊 **Workload Analysis**\n\n**Current Distribution:**\n• Teaching: 18h/week (45%) – ⚠️ Slightly above target\n• Research: 12h/week (30%) – ✅ On target\n• Admin: 6h/week (15%) – ✅ Acceptable\n• Meetings: 4h/week (10%) – ✅ Good\n\n**Total: 40h/week**\n\n**Recommendations:**\n1. Reduce teaching prep time by reusing CS201 materials from last semester (-2h)\n2. Batch all admin tasks to Friday mornings (-1h fragmentation)\n3. Decline non-essential committee meetings this month\n\n**Projected improvement:** -3h/week, bringing workload to 37h with more research focus.';
  }

  if (lower.includes('research') || lower.includes('methodology') || lower.includes('paper')) {
    return '🔬 **Research Methodology Outline – AI Ethics Paper**\n\n**Suggested Structure:**\n\n**3.1 Research Design**\nMixed-methods approach combining quantitative surveys with qualitative interviews to examine ethical implications of AI in assessment.\n\n**3.2 Participants**\n• Target: 200 academics across 5 UK universities\n• Sampling: Stratified random sampling by discipline and career stage\n\n**3.3 Data Collection**\n• Phase 1: Online survey (Likert scales + open-ended)\n• Phase 2: Semi-structured interviews (n=20)\n• Instruments: Adapted from [relevant framework]\n\n**3.4 Data Analysis**\n• Quantitative: Descriptive statistics, ANOVA, regression\n• Qualitative: Thematic analysis (Braun & Clarke, 2006)\n\n**3.5 Ethical Considerations**\n• Institutional ethics approval obtained\n• Informed consent, anonymity, data protection (GDPR)\n\nWould you like me to expand any section or add references?';
  }

  return '✨ I\'d be happy to help with that!\n\nBased on your academic profile and current workload, here are some suggestions:\n\n1. **Schedule Optimization**: Your Wednesday looks particularly busy. Consider moving admin tasks.\n\n2. **Research Progress**: Your AI Ethics paper is on track, but the upcoming conference deadline needs attention.\n\n3. **Well-being**: Your stress levels have been stable. Keep maintaining breaks between teaching blocks.\n\nWould you like me to elaborate on any of these, or help with something specific like drafting an email or planning your research timeline?';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: 56, paddingLeft: 68, paddingRight: Spacing.xl, paddingBottom: Spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  aiAvatar: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: '#fff' },
  headerStatus: { fontSize: Typography.sizes.xs, color: BrandColors.accentLight },
  emailModeButton: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
  },

  // Email Context
  emailContextBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    gap: Spacing.sm,
  },
  emailContextLabel: { fontSize: Typography.sizes.xs, color: '#64748B', fontWeight: Typography.weights.semibold },
  emailContextChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full, backgroundColor: BrandColors.accent + '12',
    marginRight: Spacing.sm,
  },
  emailContextChipText: { fontSize: Typography.sizes.xs, color: BrandColors.accent, fontWeight: Typography.weights.semibold },

  chatArea: { flex: 1 },
  messageList: { flex: 1 },
  messageListContent: { padding: Spacing.xl, paddingBottom: Spacing.md },

  // Quick Prompts
  quickPrompts: { marginBottom: Spacing.xl },
  quickPromptsLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: '#64748B', marginBottom: Spacing.md },
  quickPromptsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickPromptCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: BorderRadius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: '#E2E8F0',
  },
  quickPromptIcon: { fontSize: 24, marginBottom: Spacing.sm },
  quickPromptLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: '#334155' },

  // Messages
  messageBubbleRow: { flexDirection: 'row', marginBottom: Spacing.md, alignItems: 'flex-end', gap: Spacing.sm },
  userRow: { justifyContent: 'flex-end' },
  assistantRow: { justifyContent: 'flex-start' },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  messageBubble: { maxWidth: '78%', borderRadius: BorderRadius.lg, padding: Spacing.md },
  userBubble: { backgroundColor: BrandColors.accent, borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
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
    borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  attachButton: { width: 38, height: 38, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  textInput: { flex: 1, fontSize: Typography.sizes.md, color: '#1A1A2E', maxHeight: 100, paddingVertical: Spacing.sm },
  sendButton: {},
  sendButtonDisabled: { opacity: 0.5 },
  sendGradient: { width: 38, height: 38, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  disclaimer: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: Spacing.sm },
});
