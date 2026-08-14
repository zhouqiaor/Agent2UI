import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import type { PollOption } from '@/utils/a2ui-types';

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
  const hasVoted = selectedId !== null;

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    setSelectedId(optionId);
    setTotalVotes((prev) => prev + 1);
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome6 name="chart-bar" size={18} color="#4F46E5" />
        <Text style={styles.question}>{data.question}</Text>
      </View>

      {options.map((option) => {
        const percentage =
          totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
        const isSelected = selectedId === option.id;

        return (
          <Pressable
            key={option.id}
            style={[styles.optionRow, isSelected && styles.optionRowSelected]}
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
                {isSelected && <View style={styles.radioInner} />}
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
                <Text style={styles.percentageText}>{percentage}%</Text>
              </View>
            )}
          </Pressable>
        );
      })}

      <Text style={styles.totalText}>
        {hasVoted ? `${totalVotes} 人已投票` : `共 ${totalVotes} 人参与`}
      </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
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
  totalText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
