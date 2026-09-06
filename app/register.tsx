/**
 * CampusMind AI - Premium Registration Screen
 * Multi-step registration with academic role selection.
 * Features a dynamic animated background and true glassmorphism.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { BrandColors, BorderRadius, Spacing, Typography, UserRoles, RoleLabels, UserRole, Shadows } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Engineering',
  'Business Administration',
  'Education',
  'Health Sciences',
  'Law',
  'Arts & Humanities',
  'Natural Sciences',
  'Social Sciences',
];

const FACULTIES = [
  'Faculty of Computing',
  'Faculty of Engineering',
  'Faculty of Business',
  'Faculty of Education',
  'Faculty of Health',
  'Faculty of Law',
  'Faculty of Arts',
  'Faculty of Science',
];

// ─── Animated Background Blobs ────────────────────────────────
function AnimatedBlobs() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnim = (val: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createAnim(anim1, 8000);
    createAnim(anim2, 10000);
    createAnim(anim3, 12000);
  }, []);

  const t1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [0, 150] });
  const t2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [0, -150] });
  const t3 = anim3.interpolate({ inputRange: [0, 1], outputRange: [-100, 100] });

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' as any }]}>
      <Animated.View style={[styles.blob, styles.blob1, { transform: [{ translateX: t1 }, { translateY: t2 }] }]} />
      <Animated.View style={[styles.blob, styles.blob2, { transform: [{ translateX: t2 }, { translateY: t1 }] }]} />
      <Animated.View style={[styles.blob, styles.blob3, { transform: [{ translateX: t3 }, { translateY: t3 }] }]} />
      
      {/* Full-screen Blur overlay to soften the blobs and create depth (fixes native blurring) */}
      <BlurView intensity={Platform.OS === 'android' ? 100 : 80} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

export default function RegisterScreen() {
  const { signUp, loading, error, clearError } = useAuth();
  const [step, setStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [faculty, setFaculty] = useState('');
  const [role, setRole] = useState<UserRole>(UserRoles.LECTURER);
  const [showPassword, setShowPassword] = useState(false);

  const [validationError, setValidationError] = useState<string | null>('');

  // Entrance Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateStep1 = () => {
    if (!name.trim()) return 'Please enter your full name';
    if (!email.trim()) return 'Please enter your email';
    if (!password.trim() || password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const validateStep2 = () => {
    if (!designation.trim()) return 'Please enter your designation';
    if (!department.trim()) return 'Please select a department';
    if (!faculty.trim()) return 'Please select a faculty';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  const handleRegister = async () => {
    const err = validateStep2();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);

    try {
      await signUp(email.trim(), password, {
        name: name.trim(),
        designation: designation.trim(),
        department,
        faculty,
        role,
      });
    } catch {
      // Error handled by context
    }
  };

  const roleOptions = Object.entries(UserRoles).map(([key, value]) => ({
    key,
    value,
    label: RoleLabels[value],
  }));

  const getRoleIcon = (roleValue: string): keyof typeof MaterialIcons.glyphMap => {
    switch (roleValue) {
      case UserRoles.TEACHING_ASSISTANT: return 'person-outline';
      case UserRoles.ASSISTANT_LECTURER: return 'record-voice-over';
      case UserRoles.LECTURER: return 'school';
      case UserRoles.SENIOR_LECTURER: return 'workspace-premium';
      case UserRoles.ASSOCIATE_PROFESSOR: return 'psychology';
      case UserRoles.PROFESSOR: return 'stars';
      case UserRoles.SENIOR_PROFESSOR: return 'military-tech';
      default: return 'person';
    }
  };

  return (
    <View style={styles.container}>
      {/* Base Gradient Background */}
      <LinearGradient
        colors={['#070B14', '#0F172A', '#070B14']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Animated Blobs + Fullscreen Blur */}
      <AnimatedBlobs />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              width: '100%',
              maxWidth: 500,
              alignSelf: 'center',
            }}
          >
            {/* Header */}
            <View style={styles.header}>
              {step === 2 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setStep(1);
                    setValidationError(null);
                  }}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              <View style={styles.brandContainer}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={[BrandColors.accent, BrandColors.accentLight]}
                    style={styles.logoGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons name="school" size={40} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={styles.appName}>Create Account</Text>
                <Text style={styles.tagline}>Step {step} of 2 • {step === 1 ? 'Account Details' : 'Academic Profile'}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[BrandColors.accent, BrandColors.accentDark]}
                  style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            {/* Premium Glassmorphism Card */}
            <View style={styles.cardContainer}>
              <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardInner}>
                {/* Error Message */}
                  {(error || validationError) ? (
                    <View style={styles.errorContainer}>
                      <MaterialIcons name="error-outline" size={18} color="#FF6B6B" />
                      <Text style={styles.errorText}>{validationError || error}</Text>
                      <TouchableOpacity onPress={() => { clearError(); setValidationError(null); }}>
                        <MaterialIcons name="close" size={16} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {/* Step 1: Account Details */}
                  {step === 1 && (
                    <>
                      <InputField
                        label="Full Name"
                        icon="person"
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={(t) => { setName(t); setValidationError(null); clearError(); }}
                        focused={focusedField === 'name'}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <InputField
                        label="Email Address"
                        icon="email"
                        placeholder="Enter your institutional email"
                        value={email}
                        onChangeText={(t) => { setEmail(t); setValidationError(null); clearError(); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        focused={focusedField === 'email'}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <InputField
                        label="Password"
                        icon="lock"
                        placeholder="At least 6 characters"
                        value={password}
                        onChangeText={(t) => { setPassword(t); setValidationError(null); clearError(); }}
                        secureTextEntry={!showPassword}
                        focused={focusedField === 'password'}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        rightIcon={
                          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                            <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#94A3B8" />
                          </TouchableOpacity>
                        }
                      />
                      <InputField
                        label="Confirm Password"
                        icon="lock-outline"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChangeText={(t) => { setConfirmPassword(t); setValidationError(null); clearError(); }}
                        secureTextEntry={!showPassword}
                        focused={focusedField === 'confirmPassword'}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                      />

                      <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.8}>
                        <LinearGradient
                          colors={[BrandColors.accent, BrandColors.accentDark]}
                          style={styles.buttonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.buttonText}>Continue</Text>
                          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Step 2: Academic Profile */}
                  {step === 2 && (
                    <>
                      <InputField
                        label="Designation / Title"
                        icon="badge"
                        placeholder="e.g., Senior Lecturer in Computing"
                        value={designation}
                        onChangeText={(t) => { setDesignation(t); setValidationError(null); clearError(); }}
                        focused={focusedField === 'designation'}
                        onFocus={() => setFocusedField('designation')}
                        onBlur={() => setFocusedField(null)}
                      />

                      {/* Department Picker */}
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Department</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                          {DEPARTMENTS.map((dept) => (
                            <TouchableOpacity
                              key={dept}
                              style={[styles.chip, department === dept && styles.chipSelected]}
                              onPress={() => { setDepartment(dept); setValidationError(null); clearError(); }}
                            >
                              <Text style={[styles.chipText, department === dept && styles.chipTextSelected]}>
                                {dept}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Faculty Picker */}
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Faculty</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                          {FACULTIES.map((fac) => (
                            <TouchableOpacity
                              key={fac}
                              style={[styles.chip, faculty === fac && styles.chipSelected]}
                              onPress={() => { setFaculty(fac); setValidationError(null); clearError(); }}
                            >
                              <Text style={[styles.chipText, faculty === fac && styles.chipTextSelected]}>
                                {fac}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Academic Role Selection */}
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Academic Role</Text>
                        <View style={styles.roleGrid}>
                          {roleOptions.map((r) => (
                            <TouchableOpacity
                              key={r.value}
                              style={[styles.roleCard, role === r.value && styles.roleCardSelected]}
                              onPress={() => { setRole(r.value); setValidationError(null); clearError(); }}
                            >
                              <MaterialIcons
                                name={getRoleIcon(r.value)}
                                size={20}
                                color={role === r.value ? BrandColors.accent : '#94A3B8'}
                              />
                              <Text style={[styles.roleText, role === r.value && styles.roleTextSelected]}>
                                {r.label}
                              </Text>
                              {role === r.value && (
                                <MaterialIcons name="check-circle" size={16} color={BrandColors.accent} style={styles.roleCheck} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={[BrandColors.accent, BrandColors.accentDark]}
                          style={styles.buttonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <>
                              <Text style={styles.buttonText}>Create Account</Text>
                              <MaterialIcons name="check" size={20} color="#fff" />
                            </>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}
              </View>
            </View>

            {/* Login Link (Outside the card to avoid the rigid border extending down) */}
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkAction}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              © 2026 CampusMind AI
            </Text>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Reusable Input Field ────────────────────────────────────
function InputField({
  label,
  icon,
  focused,
  rightIcon,
  ...props
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  focused: boolean;
  rightIcon?: React.ReactNode;
  onFocus: () => void;
  onBlur: () => void;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
        <MaterialIcons name={icon} size={20} color={focused ? BrandColors.accent : '#94A3B8'} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#64748B"
          {...props}
        />
        {rightIcon}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  blob: {
    position: 'absolute',
    borderRadius: 250,
    opacity: 0.8,
  },
  blob1: {
    width: 350,
    height: 350,
    backgroundColor: BrandColors.accent, // Vibrant Cyan
    top: -50,
    left: -100,
  },
  blob2: {
    width: 300,
    height: 300,
    backgroundColor: BrandColors.secondary, // Vibrant Purple
    bottom: height * 0.1,
    right: -100,
  },
  blob3: {
    width: 250,
    height: 250,
    backgroundColor: '#48CAE4', // Light blue
    top: height * 0.4,
    left: width * 0.2,
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: 120, // Large padding to clear AI button
  },
  header: { marginBottom: Spacing.lg },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  brandContainer: { alignItems: 'center' },
  logoContainer: {
    marginBottom: Spacing.md,
    ...(Platform.OS === 'web'
      ? { boxShadow: `0px 8px 16px ${BrandColors.accent}66` } as any
      : { shadowColor: BrandColors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 }),
  },
  logoGradient: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  cardContainer: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Shadows.xl,
    backgroundColor: 'transparent',
    marginBottom: Spacing.xl,
  },
  cardBlur: {},
  cardInner: {
    padding: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: '#FF6B6B',
  },
  fieldContainer: { marginBottom: Spacing.lg },
  fieldLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: Spacing.sm,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    height: 52, // Fixed height to prevent vertical cutoff on Android!
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: Spacing.md,
  },
  inputContainerFocused: {
    borderColor: BrandColors.accent,
    backgroundColor: 'rgba(0, 180, 216, 0.08)',
    ...(Platform.OS === 'web'
      ? { boxShadow: `0px 0px 10px ${BrandColors.accent}4D` } as any
      : { shadowColor: BrandColors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 }),
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: Typography.sizes.base,
    color: '#FFFFFF',
    padding: 0, // Reset internal padding to rely entirely on fixed container height
  },
  chipScroll: { marginTop: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: 'rgba(0,180,216,0.15)',
    borderColor: BrandColors.accent,
  },
  chipText: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
  },
  chipTextSelected: {
    color: BrandColors.accentLight,
    fontWeight: 'bold',
  },
  roleGrid: { gap: Spacing.sm },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: Spacing.md,
  },
  roleCardSelected: {
    backgroundColor: 'rgba(0,180,216,0.1)',
    borderColor: BrandColors.accent,
  },
  roleText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
  },
  roleTextSelected: {
    color: BrandColors.accentLight,
    fontWeight: 'bold',
  },
  roleCheck: {
    marginLeft: 'auto',
  },
  primaryButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginTop: Spacing.base,
    ...Shadows.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56, // Bold touch target
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
  },
  linkAction: {
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    color: BrandColors.accentLight,
  },
  footerText: {
    fontSize: Typography.sizes.xs,
    color: '#475569',
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
