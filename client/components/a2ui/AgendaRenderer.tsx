import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import type { AgendaItem } from '@/utils/a2ui-types';

interface AgendaRendererProps {
  data: {
    title: string;
    items: AgendaItem[];
  };
}

export function AgendaRenderer({ data }: AgendaRendererProps) {
  const [items, setItems] = React.useState(data.items);
  const [lastToggled, setLastToggled] = useState<string | null>(null);
  const [checkScale] = useState(() => new Animated.Value(1));

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? completedCount / items.length : 0;

  useEffect(() => {
    if (lastToggled) {
      Animated.sequence([
        Animated.spring(checkScale, { toValue: 1.3, friction: 4, useNativeDriver: true }),
        Animated.spring(checkScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [lastToggled, checkScale]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    setLastToggled(id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FontAwesome6 name="list-check" size={16} color="#4F46E5" />
        </View>
        <Text style={styles.title}>{data.title}</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{completedCount}/{items.length}</Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.itemsList}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.itemRow}
            onPress={() => toggleItem(item.id)}
          >
            <Animated.View
              style={[
                styles.checkbox,
                item.completed && styles.checkboxChecked,
                lastToggled === item.id && { transform: [{ scale: checkScale }] },
              ]}
            >
              {item.completed && (
                <FontAwesome6 name="check" size={12} color="#FFFFFF" />
              )}
            </Animated.View>
            <Text
              style={[
                styles.itemText,
                item.completed && styles.itemTextCompleted,
              ]}
            >
              {item.text}
            </Text>
            {item.completed && (
              <FontAwesome6 name="circle-check" size={14} color="#10B981" />
            )}
          </Pressable>
        ))}
      </View>

      {completedCount === items.length && items.length > 0 && (
        <View style={styles.completedBanner}>
          <FontAwesome6 name="check-double" size={14} color="#10B981" />
          <Text style={styles.completedText}>全部完成!</Text>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  progressBadge: {
    backgroundColor: 'rgba(79,70,229,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  itemsList: {
    gap: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 4,
    paddingRight: 8,
    borderRadius: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  itemText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 12,
    flex: 1,
  },
  itemTextCompleted: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16,185,129,0.2)',
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
});
