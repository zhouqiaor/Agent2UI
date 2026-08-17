/**
 * A2IdeaUI 议程组件
 * 支持勾选、进度显示
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

interface AgendaItem {
  id: string;
  title: string;
  completed?: boolean;
}

interface AgendaRendererProps {
  items: AgendaItem[];
  onToggle?: (id: string) => void;
}

export const AgendaRenderer: React.FC<AgendaRendererProps> = ({
  items = [],
  onToggle,
}) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(
    new Set(items.filter(item => item.completed).map(item => item.id))
  );

  const handleToggle = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
    onToggle?.(id);
  };

  const completedCount = completedItems.size;
  const totalCount = items.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={styles.container}>
      {/* 进度条 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedCount}/{totalCount}
        </Text>
      </View>

      {/* 议程列表 */}
      <View style={styles.agendaList}>
        {items.map((item, index) => {
          const isCompleted = completedItems.has(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.agendaItem}
              onPress={() => handleToggle(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
                {isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text
                style={[
                  styles.agendaText,
                  isCompleted && styles.agendaTextCompleted,
                ]}
              >
                {index + 1}. {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007DFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007DFF',
    minWidth: 40,
    textAlign: 'right',
  },
  agendaList: {
    gap: 8,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#007DFF',
    borderColor: '#007DFF',
  },
  agendaText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  agendaTextCompleted: {
    color: '#8A8D93',
    textDecorationLine: 'line-through',
  },
});
