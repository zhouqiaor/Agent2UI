/**
 * A2IdeaUI 任务列表组件
 * 支持勾选、分配、截止日期
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TaskItem {
  id: string;
  title: string;
  assignee?: string;
  dueDate?: string;
  completed?: boolean;
}

interface TaskListRendererProps {
  items: TaskItem[];
  onToggle?: (id: string) => void;
}

export const TaskListRenderer: React.FC<TaskListRendererProps> = ({
  items = [],
  onToggle,
}) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(
    new Set(items.filter(item => item.completed).map(item => item.id))
  );

  const handleToggle = (id: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedTasks(newCompleted);
    onToggle?.(id);
  };

  const completedCount = completedTasks.size;
  const totalCount = items.length;

  return (
    <View style={styles.container}>
      {/* 任务统计 */}
      <View style={styles.statsContainer}>
        <Ionicons name="checkmark-circle-outline" size={16} color="#2E7D32" />
        <Text style={styles.statsText}>
          {completedCount}/{totalCount} 已完成
        </Text>
      </View>

      {/* 任务列表 */}
      <View style={styles.taskList}>
        {items.map((item) => {
          const isCompleted = completedTasks.has(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.taskItem, isCompleted && styles.taskItemCompleted]}
              onPress={() => handleToggle(item.id)}
              activeOpacity={0.7}
            >
              {/* 勾选框 */}
              <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
                {isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>

              {/* 任务内容 */}
              <View style={styles.taskContent}>
                <Text
                  style={[
                    styles.taskTitle,
                    isCompleted && styles.taskTitleCompleted,
                  ]}
                >
                  {item.title}
                </Text>

                {/* 任务元信息 */}
                <View style={styles.taskMeta}>
                  {item.assignee && (
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={12} color="#8A8D93" />
                      <Text style={styles.metaText}>{item.assignee}</Text>
                    </View>
                  )}
                  {item.dueDate && (
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={12} color="#8A8D93" />
                      <Text style={styles.metaText}>{item.dueDate}</Text>
                    </View>
                  )}
                </View>
              </View>
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
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },
  taskList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    gap: 12,
  },
  taskItemCompleted: {
    backgroundColor: '#F0F0F0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  taskContent: {
    flex: 1,
    gap: 6,
  },
  taskTitle: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  taskTitleCompleted: {
    color: '#8A8D93',
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8A8D93',
  },
});
