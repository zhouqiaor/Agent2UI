/**
 * 教育场景 - 课堂测验组件
 * 支持单选/多选、实时统计
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  selected?: boolean;
}

interface QuizRendererProps {
  question: string;
  options: QuizOption[];
  type?: 'single' | 'multiple';
  onAnswer?: (selectedIds: string[]) => void;
}

export const QuizRenderer: React.FC<QuizRendererProps> = ({
  question,
  options = [],
  type = 'single',
  onAnswer,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (optionId: string) => {
    if (submitted) return;

    const newSelected = new Set(selectedIds);
    if (type === 'single') {
      newSelected.clear();
      newSelected.add(optionId);
    } else {
      if (newSelected.has(optionId)) {
        newSelected.delete(optionId);
      } else {
        newSelected.add(optionId);
      }
    }
    setSelectedIds(newSelected);
  };

  const handleSubmit = () => {
    if (selectedIds.size === 0) return;
    setSubmitted(true);
    onAnswer?.(Array.from(selectedIds));
  };

  const getCorrectCount = () => {
    return options.filter(opt => opt.isCorrect).length;
  };

  const isCorrect = () => {
    const correctIds = new Set(options.filter(opt => opt.isCorrect).map(opt => opt.id));
    if (selectedIds.size !== correctIds.size) return false;
    for (const id of selectedIds) {
      if (!correctIds.has(id)) return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      {/* 题目 */}
      <View style={styles.questionContainer}>
        <Ionicons name="help-circle-outline" size={20} color="#9C27B0" />
        <Text style={styles.questionText}>{question}</Text>
      </View>

      {/* 选项列表 */}
      <View style={styles.optionsList}>
        {options.map((option, index) => {
          const isSelected = selectedIds.has(option.id);
          const showResult = submitted;
          const isCorrectOption = option.isCorrect;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                isSelected && styles.optionItemSelected,
                showResult && isCorrectOption && styles.optionItemCorrect,
                showResult && isSelected && !isCorrectOption && styles.optionItemWrong,
              ]}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.7}
              disabled={submitted}
            >
              {/* 选项标记 */}
              <View style={[styles.optionMarker, isSelected && styles.optionMarkerSelected]}>
                <Text style={styles.optionMarkerText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              {/* 选项内容 */}
              <Text style={styles.optionText}>{option.text}</Text>

              {/* 结果标记 */}
              {showResult && isCorrectOption && (
                <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
              )}
              {showResult && isSelected && !isCorrectOption && (
                <Ionicons name="close-circle" size={20} color="#FF3B30" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 提交按钮 */}
      {!submitted && (
        <TouchableOpacity
          style={[styles.submitButton, selectedIds.size === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={selectedIds.size === 0}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>
            提交答案 ({selectedIds.size}/{type === 'single' ? 1 : getCorrectCount()})
          </Text>
        </TouchableOpacity>
      )}

      {/* 结果反馈 */}
      {submitted && (
        <View style={[styles.resultContainer, isCorrect() ? styles.resultCorrect : styles.resultWrong]}>
          <Ionicons
            name={isCorrect() ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={isCorrect() ? '#2E7D32' : '#FF3B30'}
          />
          <Text style={[styles.resultText, isCorrect() ? styles.resultTextCorrect : styles.resultTextWrong]}>
            {isCorrect() ? '回答正确！' : '回答错误，请再想想'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#9C27B008',
    borderRadius: 8,
    padding: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  optionItemSelected: {
    backgroundColor: '#007DFF10',
    borderWidth: 1,
    borderColor: '#007DFF30',
  },
  optionItemCorrect: {
    backgroundColor: '#2E7D3210',
    borderWidth: 1,
    borderColor: '#2E7D3230',
  },
  optionItemWrong: {
    backgroundColor: '#FF3B3010',
    borderWidth: 1,
    borderColor: '#FF3B3030',
  },
  optionMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionMarkerSelected: {
    backgroundColor: '#007DFF',
  },
  optionMarkerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8D93',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#007DFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D0D0D0',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    padding: 12,
  },
  resultCorrect: {
    backgroundColor: '#2E7D3210',
  },
  resultWrong: {
    backgroundColor: '#FF3B3010',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultTextCorrect: {
    color: '#2E7D32',
  },
  resultTextWrong: {
    color: '#FF3B30',
  },
});
