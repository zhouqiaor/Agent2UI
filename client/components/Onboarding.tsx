import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: _width } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

interface Slide {
  icon: keyof typeof FontAwesome6.glyphMap;
  title: string;
  description: string;
  highlight: string;
}

const slides: Slide[] = [
  {
    icon: 'wand-magic-sparkles',
    title: 'AI 驱动的智能界面',
    description: 'AI Agent 根据会议内容，自动生成投票、议程、笔记等交互组件',
    highlight: '无需手动配置',
  },
  {
    icon: 'users',
    title: '实时多人协作',
    description: '参会者实时投票、提问、记录笔记，所有操作即时同步',
    highlight: '支持百人并发',
  },
  {
    icon: 'brain',
    title: '智能会议纪要',
    description: '会议结束后 AI 自动整理要点、行动项，一键分享给参会者',
    highlight: '告别手动记录',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [current, setCurrent] = useState(0);

  const handleNext = async () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      await AsyncStorage.setItem('@meetflow_onboarding_done', 'true');
      onComplete();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('@meetflow_onboarding_done', 'true');
    onComplete();
  };

  const slide = slides[current];

  return (
    <View style={styles.container}>
      <Pressable style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>跳过</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.slideContent}>
          <View style={styles.iconContainer}>
            <FontAwesome6 name={slide.icon} size={48} color="#4F46E5" />
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>

          <View style={styles.highlightBadge}>
            <FontAwesome6 name="star" size={12} color="#4F46E5" />
            <Text style={styles.highlightText}>{slide.highlight}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === current && styles.dotActive,
                index < current && styles.dotCompleted,
              ]}
            />
          ))}
        </View>

        <Pressable style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {current === slides.length - 1 ? '开始体验' : '下一步'}
          </Text>
          {current < slides.length - 1 && (
            <FontAwesome6 name="arrow-right" size={14} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  skipBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(79,70,229,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D9E6',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#4F46E5',
  },
  dotCompleted: {
    backgroundColor: '#4F46E5',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
