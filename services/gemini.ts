/**
 * CampusMind AI - Gemini Service
 * Handles all AI-powered features via the Gemini API.
 * Falls back to simulated responses if API key is not configured.
 */

import { GEMINI_CONFIG, SYSTEM_PROMPTS } from '@/config/gemini';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  return GEMINI_CONFIG.apiKey !== 'YOUR_GEMINI_API_KEY' && GEMINI_CONFIG.apiKey.length > 10;
}

/**
 * Core: Send a chat completion request to Gemini
 */
export async function sendChatCompletion(
  messages: ChatMessage[],
  systemPrompt?: string,
): Promise<string> {
  if (!isGeminiConfigured()) {
    console.log('[Gemini] API key not configured, using simulated response');
    return simulatedResponse(messages[messages.length - 1]?.content || '');
  }

  try {
    const url = `${GEMINI_CONFIG.baseUrl}/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`;
    
    // Convert generic chat messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const body: any = {
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: GEMINI_CONFIG.maxTokens,
        temperature: GEMINI_CONFIG.temperature,
      }
    };

    if (systemPrompt || SYSTEM_PROMPTS.general) {
      body.systemInstruction = {
        role: "system",
        parts: [{ text: systemPrompt || SYSTEM_PROMPTS.general }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  } catch (error: any) {
    console.error('[Gemini] Error:', error.message);
    throw error;
  }
}

/**
 * Generate an optimized schedule using AI
 */
export async function generateSchedule(workloadData: {
  teachingHours: number;
  modules: string[];
  deadlines: string[];
  meetingsCount: number;
}): Promise<string> {
  const prompt = `Generate an optimal daily academic schedule for a university lecturer with:
- ${workloadData.teachingHours} teaching hours per week
- Modules: ${workloadData.modules.join(', ')}
- Upcoming deadlines: ${workloadData.deadlines.join(', ')}
- ${workloadData.meetingsCount} meetings this week

Create a structured day plan with specific time blocks.`;

  return sendChatCompletion(
    [{ role: 'user', content: prompt }],
    SYSTEM_PROMPTS.schedulePlanner,
  );
}

/**
 * Draft an email based on context
 */
export async function draftEmail(
  context: 'student_inquiry' | 'extension_request' | 'supervisor_communication' | 'committee_response' | 'general',
  originalMessage?: string,
): Promise<string> {
  const contextLabels = {
    student_inquiry: 'a student inquiry',
    extension_request: 'a student extension request',
    supervisor_communication: 'communication with a supervisor or manager',
    committee_response: 'a committee or department communication',
    general: 'a general academic email',
  };

  const prompt = originalMessage
    ? `Draft a professional reply to the following ${contextLabels[context]}:\n\n"${originalMessage}"`
    : `Draft a professional email for ${contextLabels[context]}. Include placeholders for [Name], [Date], etc.`;

  return sendChatCompletion(
    [{ role: 'user', content: prompt }],
    SYSTEM_PROMPTS.emailDraft,
  );
}

/**
 * Analyze workload and provide recommendations
 */
export async function analyzeWorkload(data: {
  teachingHours: number;
  researchHours: number;
  adminHours: number;
  meetingHours: number;
  modules: number;
  students: number;
}): Promise<string> {
  const prompt = `Analyze the following academic workload:
- Teaching: ${data.teachingHours}h/week (${data.modules} modules, ${data.students} students)
- Research: ${data.researchHours}h/week
- Admin: ${data.adminHours}h/week
- Meetings: ${data.meetingHours}h/week
- Total: ${data.teachingHours + data.researchHours + data.adminHours + data.meetingHours}h/week

Provide analysis and specific recommendations for optimization.`;

  return sendChatCompletion(
    [{ role: 'user', content: prompt }],
    SYSTEM_PROMPTS.workloadAnalyzer,
  );
}

/**
 * Assess burnout risk and provide wellness tips
 */
export async function assessBurnoutRisk(data: {
  weeklyHours: number;
  stressLevel: number;
  sleepHours: number;
  meetingLoad: number;
}): Promise<{ score: number; tips: string[] }> {
  // Simple rule-based scoring (runs locally, no API needed)
  let score = 0;
  const tips: string[] = [];

  // Working hours factor (30%)
  if (data.weeklyHours > 50) { score += 30; tips.push('Your weekly hours exceed 50. Consider delegating non-essential tasks.'); }
  else if (data.weeklyHours > 40) { score += 20; }
  else { score += 10; }

  // Stress factor (30%)
  score += data.stressLevel * 6; // 1-5 scale → 6-30 points
  if (data.stressLevel >= 4) tips.push('Your stress levels are elevated. Block a "Recovery Morning" with no meetings before 10 AM.');

  // Sleep factor (25%)
  if (data.sleepHours < 6) { score += 25; tips.push('You\'re sleeping less than 6 hours. Prioritize sleep — it directly affects cognitive performance.'); }
  else if (data.sleepHours < 7) { score += 15; tips.push('Aim for 7-8 hours of sleep for optimal academic performance.'); }
  else { score += 5; }

  // Meeting load (15%)
  if (data.meetingLoad > 4) { score += 15; tips.push('You have over 4 hours of meetings today. Consider declining non-essential ones.'); }
  else if (data.meetingLoad > 2) { score += 10; }
  else { score += 5; }

  score = Math.min(100, Math.max(0, score));

  if (tips.length === 0) {
    tips.push('Your well-being metrics look good! Keep maintaining your current balance.');
  }

  return { score, tips };
}

/**
 * Generate compliance report content
 */
export async function generateComplianceReport(
  templateType: string,
  programmeData: Record<string, any>,
): Promise<string> {
  const prompt = `Generate a ${templateType} compliance report for:
Programme: ${programmeData.name || 'Computer Science BSc'}
Department: ${programmeData.department || 'Computer Science'}
Key metrics: ${JSON.stringify(programmeData.metrics || {})}

Include: Executive Summary, Key Findings, Compliance Status, and Recommendations.`;

  return sendChatCompletion(
    [{ role: 'user', content: prompt }],
    SYSTEM_PROMPTS.complianceReport,
  );
}

/**
 * Fallback simulated response when API key is not configured
 */
function simulatedResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('email') && (lower.includes('extension') || lower.includes('student'))) {
    return '📧 **Draft Email – Student Extension Request**\n\nDear [Student Name],\n\nThank you for reaching out. I understand that circumstances can affect your ability to meet deadlines. I am happy to grant you a **3-day extension**, making your new deadline **[Date]**.\n\nPlease submit via the online portal by the revised date.\n\nBest regards,\n[Your Name]';
  }
  if (lower.includes('schedule') || lower.includes('plan')) {
    return '📅 **Suggested Schedule**\n\n• 8-10 AM: Lecture Prep\n• 10-12 PM: Research Writing\n• 1-2 PM: Student Consultations\n• 2-4 PM: Assessment Review\n• 4-5 PM: Admin & Emails\n\n💡 *This protects your morning for deep work.*';
  }
  if (lower.includes('workload')) {
    return '📊 **Workload Analysis**\n\n• Teaching: 45% (slightly above target)\n• Research: 30% (on target)\n• Admin: 15%\n• Meetings: 10%\n\n**Recommendations:** Batch admin tasks to Friday mornings. Reuse materials from last semester.';
  }

  return '✨ I\'d be happy to help with that! Based on your profile, I can assist with schedule planning, email drafting, research guidance, and well-being advice. What would you like to focus on?';
}
