import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import type { Task } from '@/utils/a2ui-types';

interface TaskListRendererProps {
  data: {
    title: string;
    tasks: Task[];
  };
}

const priorityConfig = {
  high: { color: '#EF4444', label: '高', bg: 'rgba(239,68,68,0.1)' },
  medium: { color: '#F59E0B', label: '中', bg: 'rgba(245,158,11,0.1)' },
  low: { color: '#10B981', label: '低', bg: 'rgba(16,185,129,0.1)' },
};

export function TaskListRenderer({ data }: TaskListRendererProps) {
  const [tasks, setTasks] = useState(
    data.tasks.map((t) => ({ ...t, done: false }))
  );

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome6 name="list-check" size={18} color="#4F46E5" />
        <Text style={styles.title}>{data.title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {tasks.filter((t) => t.done).length}/{tasks.length}
          </Text>
        </View>
      </View>

      {tasks.map((task) => {
        const priority = priorityConfig[task.priority];
        return (
          <Pressable
            key={task.id}
            style={[styles.taskRow, task.done && styles.taskRowDone]}
            onPress={() => toggleTask(task.id)}
          >
            <View
              style={[
                styles.checkbox,
                task.done && styles.checkboxChecked,
              ]}
            >
              {task.done && (
                <FontAwesome6 name="check" size={10} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskText,
                  task.done && styles.taskTextDone,
                ]}
              >
                {task.text}
              </Text>
              <View style={styles.taskMeta}>
                <View style={styles.assigneeTag}>
                  <FontAwesome6 name="user" size={9} color="#64748B" />
                  <Text style={styles.assigneeText}>{task.assignee}</Text>
                </View>
                <View
                  style={[styles.priorityTag, { backgroundColor: priority.bg }]}
                >
                  <Text style={[styles.priorityText, { color: priority.color }]}>
                    {priority.label}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(79,70,229,0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  taskRowDone: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  taskContent: {
    flex: 1,
    marginLeft: 10,
  },
  taskText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  assigneeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assigneeText: {
    fontSize: 11,
    color: '#64748B',
  },
  priorityTag: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
