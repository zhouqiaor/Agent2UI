import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome6 name="list-check" size={18} color="#4F46E5" />
        <Text style={styles.title}>{data.title}</Text>
      </View>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          style={styles.itemRow}
          onPress={() => toggleItem(item.id)}
        >
          <View
            style={[
              styles.checkbox,
              item.completed && styles.checkboxChecked,
            ]}
          >
            {item.completed && (
              <FontAwesome6 name="check" size={12} color="#FFFFFF" />
            )}
          </View>
          <Text
            style={[
              styles.itemText,
              item.completed && styles.itemTextCompleted,
            ]}
          >
            {item.text}
          </Text>
          {index < items.length - 1 && <View style={styles.connector} />}
        </Pressable>
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
    marginBottom: 14,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 8,
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
  connector: {
    position: 'absolute',
    left: 19,
    top: 34,
    width: 2,
    height: 10,
    backgroundColor: '#E2E8F0',
  },
});
