import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function MeetingCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={140} borderRadius={16} />
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Skeleton width={80} height={24} borderRadius={12} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </View>
        <Skeleton height={20} borderRadius={6} style={{ marginTop: 8 }} />
        <Skeleton width="70%" height={20} borderRadius={6} style={{ marginTop: 4 }} />
        <View style={styles.cardMeta}>
          <Skeleton width={60} height={16} borderRadius={8} />
          <Skeleton width={50} height={16} borderRadius={8} />
          <Skeleton width={70} height={16} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

export function A2UIComponentSkeleton() {
  return (
    <View style={styles.a2uiSkeleton}>
      <Skeleton width={120} height={16} borderRadius={8} />
      <Skeleton height={100} borderRadius={16} style={{ marginTop: 12 }} />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Skeleton width={80} height={36} borderRadius={12} />
        <Skeleton width={80} height={36} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#D1D9E6',
  },
  card: {
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  a2uiSkeleton: {
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
});
