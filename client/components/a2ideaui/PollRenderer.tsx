/**
 * A2IdeaUI 投票组件
 * 支持单选、百分比显示、填充动画
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PollOption {
  id: string;
  text: string;
  votes?: number;
}

interface PollRendererProps {
  options: PollOption[];
  onVote?: (optionId: string) => void;
}

export const PollRenderer: React.FC<PollRendererProps> = ({
  options,
  onVote,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);

  const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  const handleVote = (optionId: string) => {
    if (voted) return;
    setSelectedOption(optionId);
    setVoted(true);
    onVote?.(optionId);
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.optionsList}>
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const percentage = getPercentage(option.votes || 0);
          const showResult = voted;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                isSelected && styles.optionItemSelected,
              ]}
              onPress={() => handleVote(option.id)}
              activeOpacity={0.7}
              disabled={voted}
            >
              {/* 选项内容 */}
              <View style={styles.optionContent}>
                <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                  {isSelected && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.optionText}>{option.text}</Text>
              </View>

              {/* 投票结果 */}
              {showResult && (
                <View style={styles.resultContainer}>
                  <View style={styles.resultBar}>
                    <View
                      style={[
                        styles.resultFill,
                        { width: `${percentage}%` },
                        isSelected && styles.resultFillSelected,
                      ]}
                    />
                  </View>
                  <Text style={styles.resultText}>{percentage}%</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 投票统计 */}
      {voted && (
        <View style={styles.statsContainer}>
          <Ionicons name="people-outline" size={14} color="#8A8D93" />
          <Text style={styles.statsText}>共 {totalVotes} 人参与投票</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  optionItemSelected: {
    backgroundColor: '#007DFF10',
    borderWidth: 1,
    borderColor: '#007DFF30',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#007DFF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007DFF',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  resultFill: {
    height: '100%',
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
  },
  resultFillSelected: {
    backgroundColor: '#007DFF',
  },
  resultText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8D93',
    minWidth: 40,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#8A8D93',
  },
});
