/**
 * A2IdeaUI 笔记组件
 * 支持标签系统、品牌色背景
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NoteRendererProps {
  content: string;
  tags?: string[];
}

export const NoteRenderer: React.FC<NoteRendererProps> = ({
  content,
  tags = [],
}) => {
  return (
    <View style={styles.container}>
      {/* 笔记内容 */}
      <View style={styles.noteContent}>
        <Text style={styles.noteText}>{content}</Text>
      </View>

      {/* 标签列表 */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Ionicons name="pricetag-outline" size={12} color="#007DFF" />
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  noteContent: {
    backgroundColor: '#007DFF08',
    borderLeftWidth: 3,
    borderLeftColor: '#007DFF',
    borderRadius: 8,
    padding: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007DFF10',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#007DFF',
    fontWeight: '500',
  },
});
