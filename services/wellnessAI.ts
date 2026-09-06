/**
 * CampusMind AI - Wellness AI Service
 * Calculates wellness scores and provides AI-powered interventions.
 */

interface WellnessInput {
  stressLevel: number;      // 1-5 scale
  sleepHours: number;       // 0-12
  waterIntakeMl: number;    // 0-5000
  exerciseMinutes: number;  // 0-120
  workingHours: number;     // 0-16
  meetingHours: number;     // 0-8
}

interface WellnessResult {
  score: number;             // 0-100 (higher = better)
  category: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  breakdown: {
    stress: number;
    sleep: number;
    hydration: number;
    exercise: number;
    workload: number;
  };
  interventions: string[];
}

/**
 * Calculate composite Wellness Score from multiple factors.
 * Weights: Stress 30%, Sleep 25%, Workload 25%, Hydration 10%, Exercise 10%
 */
export function calculateWellnessScore(input: WellnessInput): WellnessResult {
  // Stress score (30%) — inverted, lower stress = higher score
  const stressScore = Math.max(0, 100 - (input.stressLevel - 1) * 25);

  // Sleep score (25%) — optimal is 7-8 hours
  let sleepScore = 100;
  if (input.sleepHours < 5) sleepScore = 20;
  else if (input.sleepHours < 6) sleepScore = 40;
  else if (input.sleepHours < 7) sleepScore = 70;
  else if (input.sleepHours > 9) sleepScore = 80;

  // Workload score (25%) — based on working hours
  let workloadScore = 100;
  if (input.workingHours > 12) workloadScore = 10;
  else if (input.workingHours > 10) workloadScore = 30;
  else if (input.workingHours > 8) workloadScore = 60;
  else if (input.workingHours > 6) workloadScore = 90;

  // Hydration score (10%) — target is 2000ml
  const hydrationScore = Math.min(100, (input.waterIntakeMl / 2000) * 100);

  // Exercise score (10%) — target is 30min
  const exerciseScore = Math.min(100, (input.exerciseMinutes / 30) * 100);

  // Weighted composite
  const score = Math.round(
    stressScore * 0.30 +
    sleepScore * 0.25 +
    workloadScore * 0.25 +
    hydrationScore * 0.10 +
    exerciseScore * 0.10
  );

  // Category
  let category: WellnessResult['category'];
  if (score >= 80) category = 'excellent';
  else if (score >= 60) category = 'good';
  else if (score >= 40) category = 'moderate';
  else if (score >= 20) category = 'poor';
  else category = 'critical';

  // Generate interventions
  const interventions = getInterventions(input, { stressScore, sleepScore, workloadScore, hydrationScore, exerciseScore });

  return {
    score,
    category,
    breakdown: {
      stress: stressScore,
      sleep: sleepScore,
      hydration: hydrationScore,
      exercise: exerciseScore,
      workload: workloadScore,
    },
    interventions,
  };
}

function getInterventions(
  input: WellnessInput,
  scores: { stressScore: number; sleepScore: number; workloadScore: number; hydrationScore: number; exerciseScore: number },
): string[] {
  const tips: string[] = [];

  // High stress interventions
  if (input.stressLevel >= 4) {
    tips.push('🧘 Your stress level is high. Consider blocking a "Recovery Morning" — no meetings before 10 AM tomorrow.');
    tips.push('💆 Try the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s. Repeat 3 times.');
  } else if (input.stressLevel === 3) {
    tips.push('🧘 Moderate stress detected. A 10-minute break between your next two tasks could help.');
  }

  // Sleep interventions
  if (input.sleepHours < 6) {
    tips.push('💤 You\'re significantly under-slept. Consider rescheduling non-urgent evening tasks and aiming for bed before 11 PM.');
  } else if (input.sleepHours < 7) {
    tips.push('💤 Aim for 7-8 hours of sleep. Good sleep directly correlates with research productivity and teaching quality.');
  }

  // Workload interventions
  if (input.workingHours > 10) {
    tips.push('⚠️ You\'ve been working over 10 hours. Consider delegating administrative tasks or postponing non-critical items.');
  }
  if (input.meetingHours > 4) {
    tips.push('📅 Meeting load is heavy today. Decline any non-essential meetings and batch the remaining ones.');
  }

  // Hydration
  if (input.waterIntakeMl < 1000) {
    tips.push('💧 You\'re below 50% of your daily water target. Set a reminder to drink a glass of water every hour.');
  }

  // Exercise
  if (input.exerciseMinutes < 10) {
    tips.push('🏃 Try a 15-minute walk between tasks. Even light movement boosts cognitive function and mood.');
  }

  // If everything is good
  if (tips.length === 0) {
    tips.push('✅ Your well-being metrics look great today! Keep maintaining this healthy balance.');
  }

  return tips;
}

/**
 * Analyze a streak of wellness logs to detect trends and provide proactive interventions.
 */
export function analyzeWellnessTrend(logs: WellnessInput[]): {
  trend: 'improving' | 'stable' | 'declining';
  avgScore: number;
  recommendation: string;
} {
  if (logs.length < 2) {
    return { trend: 'stable', avgScore: 50, recommendation: 'Keep logging daily for trend analysis.' };
  }

  const scores = logs.map((l) => calculateWellnessScore(l).score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Compare first half vs second half
  const mid = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const secondHalf = scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid);

  let trend: 'improving' | 'stable' | 'declining';
  let recommendation: string;

  if (secondHalf - firstHalf > 5) {
    trend = 'improving';
    recommendation = 'Your well-being is trending upward! Whatever changes you made recently are working.';
  } else if (firstHalf - secondHalf > 5) {
    trend = 'declining';
    recommendation = 'Your well-being has been declining. Consider reducing workload, improving sleep, or seeking support.';
  } else {
    trend = 'stable';
    recommendation = 'Your well-being is stable. Focus on improving your lowest-scoring area for the biggest impact.';
  }

  return { trend, avgScore, recommendation };
}
