import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import type { PollOption } from '@/utils/a2ui-types';
import { useResponsive } from '@/hooks/useResponsive';

interface PollRendererProps {
  data: {
    question: string;
    type: 'single' | 'multiple';
    options: PollOption[];
    totalVotes: number;
  };
}

export function PollRenderer({ data }: PollRendererProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [options, setOptions] = useState(data.options);
  const [totalVotes, setTotalVotes] = useState(data.totalVotes);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successScale] = useState(() => new Animated.Value(0));
  const [successOpacity] = useState(() => new Animated.Value(0));
  const hasVoted = selectedId !== null;
  const { shouldUseTwoColumn } = useResponsive();

  useEffect(() => {
    if (showSuccess) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(successScale, { toValue: 1, friction: 5, useNativeDriver: true }),
          Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(1500),
        Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowSuccess(false));
    }
  }, [showSuccess, successScale, successOpacity]);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    setSelectedId(optionId);
    setTotalVotes((prev) => prev + 1);
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );
    setShowSuccess(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FontAwesome6 name="chart-bar" size={16} color="#4F46E5" />
        </View>
        <Text style={styles.question}>{data.question}</Text>
      </View>

      <View style={[styles.optionsContainer, shouldUseTwoColumn && styles.optionsContainerTablet]}>
        {options.map((option) => {
          const percentage =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const isSelected = selectedId === option.id;

          return (
            <Pressable
              key={option.id}
              style={[
                styles.optionRow,
                isSelected && styles.optionRowSelected,
                shouldUseTwoColumn && styles.optionRowTablet,
              ]}
              onPress={() => handleVote(option.id)}
              disabled={hasVoted}
            >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.radio,
                  isSelected && styles.radioSelected,
                ]}
              >
                {isSelected && (
                  <Animated.View style={[styles.radioInner, { transform: [{ scale: successScale }] }]} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.text}
              </Text>
            </View>

            {hasVoted && (
              <View style={styles.resultArea}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${percentage}%` },
                      isSelected && styles.progressBarFillSelected,
                    ]}
                  />
                </View>
                <Text style={[styles.percentageText, isSelected && styles.percentageTextSelected]}>
                  {percentage}%
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalText}>
          {hasVoted ? `${totalVotes} 人已投票` : `共 ${totalVotes} 人参与`}
        </Text>
      </View>

      {showSuccess && (
        <Animated.View style={[styles.successToast, { opacity: successOpacity }]}>
          <FontAwesome6 name="circle-check" size={14} color="#10B981" />
          <Text style={styles.successText}>投票成功</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  optionsContainer: {
    gap: 10,
  },
  optionsContainerTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  optionRow: {
    backgroundColor: '#E8E8EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  optionRowTablet: {
    width: '48%',
    marginBottom: 8,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(79,70,229,0.08)',
    borderColor: 'rgba(79,70,229,0.3)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#4F46E5',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
  },
  optionText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 10,
    flex: 1,
  },
  optionTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  resultArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
  },
  progressBarFillSelected: {
    backgroundColor: '#4F46E5',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    width: 36,
    textAlign: 'right',
  },
  percentageTextSelected: {
    color: '#4F46E5',
  },
  footer: {
    marginTop: 4,
  },
  totalText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  successToast: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  successText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
});
