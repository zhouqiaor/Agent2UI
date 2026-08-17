/**
 * A2IdeaUI 问答组件
 * 支持提问、回答列表
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QAItem {
  id: string;
  question: string;
  answer?: string;
}

interface QARendererProps {
  items?: QAItem[];
  onAsk?: (question: string) => void;
}

export const QARenderer: React.FC<QARendererProps> = ({
  items = [],
  onAsk,
}) => {
  const [question, setQuestion] = useState('');
  const [qaList, setQaList] = useState<QAItem[]>(items);

  const handleAsk = () => {
    if (!question.trim()) return;
    
    const newItem: QAItem = {
      id: Date.now().toString(),
      question: question.trim(),
    };
    
    setQaList([...qaList, newItem]);
    setQuestion('');
    onAsk?.(question.trim());
  };

  return (
    <View style={styles.container}>
      {/* 问答列表 */}
      {qaList.length > 0 && (
        <View style={styles.qaList}>
          {qaList.map((item) => (
            <View key={item.id} style={styles.qaItem}>
              {/* 问题 */}
              <View style={styles.questionContainer}>
                <View style={styles.questionIcon}>
                  <Ionicons name="help-circle-outline" size={14} color="#9C27B0" />
                </View>
                <Text style={styles.questionText}>{item.question}</Text>
              </View>

              {/* 回答 */}
              {item.answer && (
                <View style={styles.answerContainer}>
                  <View style={styles.answerIcon}>
                    <Ionicons name="chatbubble-outline" size={14} color="#007DFF" />
                  </View>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="输入问题..."
          placeholderTextColor="#8A8D93"
          value={question}
          onChangeText={setQuestion}
          onSubmitEditing={handleAsk}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.askButton, !question.trim() && styles.askButtonDisabled]}
          onPress={handleAsk}
          disabled={!question.trim()}
          activeOpacity={0.7}
        >
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  qaList: {
    gap: 12,
  },
  qaItem: {
    gap: 8,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#9C27B008',
    borderRadius: 8,
    padding: 10,
  },
  questionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9C27B020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#007DFF08',
    borderRadius: 8,
    padding: 10,
    marginLeft: 28,
  },
  answerIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007DFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  askButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  askButtonDisabled: {
    backgroundColor: '#D0D0D0',
  },
});
