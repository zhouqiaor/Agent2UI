import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import type { QAAnswer } from '@/utils/a2ui-types';

interface QARendererProps {
  data: {
    question: string;
    answers: QAAnswer[];
  };
}

export function QARenderer({ data }: QARendererProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome6 name="circle-question" size={18} color="#4F46E5" />
        <Text style={styles.headerText}>问答</Text>
      </View>

      <View style={styles.questionBox}>
        <FontAwesome6 name="quote-left" size={12} color="#4F46E5" />
        <Text style={styles.questionText}>{data.question}</Text>
      </View>

      {data.answers.map((answer, index) => (
        <View key={index} style={styles.answerRow}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                answer.isExpert && styles.avatarExpert,
              ]}
            >
              <Text style={styles.avatarText}>
                {answer.author.charAt(0)}
              </Text>
            </View>
            {answer.isExpert && (
              <View style={styles.expertBadge}>
                <FontAwesome6 name="star" size={8} color="#F59E0B" />
              </View>
            )}
          </View>
          <View style={styles.answerContent}>
            <View style={styles.answerHeader}>
              <Text style={styles.authorName}>{answer.author}</Text>
              {answer.isExpert && (
                <Text style={styles.expertLabel}>专家</Text>
              )}
            </View>
            <Text style={styles.answerText}>{answer.content}</Text>
          </View>
        </View>
      ))}
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
    marginBottom: 12,
    gap: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  questionBox: {
    backgroundColor: 'rgba(79,70,229,0.06)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  questionText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarExpert: {
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  expertBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F0F0F3',
  },
  answerContent: {
    flex: 1,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  expertLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  answerText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
});
