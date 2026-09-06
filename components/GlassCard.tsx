import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { BorderRadius, Shadows } from '@/constants/theme';

interface GlassCardProps extends ViewProps {
  isDark?: boolean;
  intensity?: number;
}

export default function GlassCard({ isDark = false, intensity = 50, style, children, ...props }: GlassCardProps) {
  return (
    <View style={[styles.container, isDark && styles.containerDark, style]} {...props}>
      <BlurView
        tint={isDark ? 'dark' : 'light'}
        intensity={intensity}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    ...Shadows.sm,
  },
  containerDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
