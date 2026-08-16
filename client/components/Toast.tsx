import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onDismiss?: () => void;
  duration?: number;
}

const typeConfig = {
  success: { icon: 'circle-check' as const, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  error: { icon: 'circle-exclamation' as const, color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  info: { icon: 'circle-info' as const, color: '#4F46E5', bg: 'rgba(79,70,229,0.15)' },
  warning: { icon: 'triangle-exclamation' as const, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
};

export function Toast({ message, type = 'info', visible, onDismiss, duration = 2500 }: ToastProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-20));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
        ]).start(() => onDismiss?.());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, opacity, translateY, onDismiss]);

  if (!visible) return null;

  const config = typeConfig[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bg, opacity, transform: [{ translateY }] },
      ]}
    >
      <FontAwesome6 name={config.icon} size={16} color={config.color} />
      <Text style={[styles.message, { color: config.color }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
  },
});
