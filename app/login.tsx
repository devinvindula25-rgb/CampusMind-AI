/**
 * CampusMind AI - Premium Login Screen
 * Featuring a dynamic animated background, true glassmorphism with BlurView,
 * and micro-animations for an ultra-premium feel.
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
import { BrandColors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

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

export default function LoginScreen() {
  const { signIn, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      await signIn(email.trim(), password.trim());
    } catch {
      // Error is handled by context
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
              maxWidth: 440,
              alignSelf: 'center',
            }}
          >
            {/* Logo & Brand */}
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
              <Text style={styles.appName}>CampusMind AI</Text>
              <Text style={styles.tagline}>
                Intelligent Quality Assurance
              </Text>
            </View>

            {/* Premium Glassmorphism Card */}
            <View style={styles.cardContainer}>
              <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardInner}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Welcome Back</Text>
                    <Text style={styles.cardSubtitle}>Sign in to continue</Text>
                  </View>

                  {/* Error Message */}
                  {error ? (
                    <View style={styles.errorContainer}>
                      <MaterialIcons name="error-outline" size={18} color="#FF6B6B" />
                      <Text style={styles.errorText}>{error}</Text>
                      <TouchableOpacity onPress={clearError}>
                        <MaterialIcons name="close" size={16} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {/* Email Field */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <View
                      style={[
                        styles.inputContainer,
                        focusedField === 'email' && styles.inputContainerFocused,
                      ]}
                    >
                      <MaterialIcons
                        name="email"
                        size={20}
                        color={focusedField === 'email' ? BrandColors.accent : '#94A3B8'}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#64748B"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          clearError();
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>

                  {/* Password Field */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <View
                      style={[
                        styles.inputContainer,
                        focusedField === 'password' && styles.inputContainerFocused,
                      ]}
                    >
                      <MaterialIcons
                        name="lock"
                        size={20}
                        color={focusedField === 'password' ? BrandColors.accent : '#94A3B8'}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#64748B"
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          clearError();
                        }}
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                        <MaterialIcons
                          name={showPassword ? 'visibility' : 'visibility-off'}
                          size={20}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Sign In Button */}
                  <TouchableOpacity
                    style={[styles.signInButton, (!email || !password) && styles.signInButtonDisabled]}
                    onPress={handleLogin}
                    disabled={loading || !email || !password}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[BrandColors.accent, BrandColors.accentDark]}
                      style={styles.signInGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Text style={styles.signInText}>Sign In</Text>
                          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

              </View>
            </View>

            {/* Register Link (Moved OUTSIDE the card container to avoid the weird border gap) */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don&apos;t have an account? </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Create Account</Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: 120, // Huge padding at bottom to clear the AI floating button
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
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
  cardContainer: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Shadows.xl,
    backgroundColor: 'transparent',
    marginBottom: Spacing.xl,
  },
  cardBlur: {
    // Wrapper for blur
  },
  cardInner: {
    padding: Spacing['2xl'],
    paddingTop: Spacing['3xl'], // Extra top padding
  },
  cardHeader: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.sizes.base,
    color: '#94A3B8',
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
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: Spacing.sm,
    marginLeft: 2, // Slight indent
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    height: 52, // Fixed height avoids text cutoff
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
    padding: 0, // Reset internal padding for strict container height alignment
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing['2xl'],
    marginTop: -Spacing.xs,
  },
  forgotPasswordText: {
    fontSize: Typography.sizes.sm,
    color: BrandColors.accentLight,
    fontWeight: '600',
  },
  signInButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56, // Bold touch target
    gap: Spacing.sm,
  },
  signInText: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
  },
  registerLink: {
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
