/**
 * A2IdeaUI 智能提示组件
 * 快速生成常用卡片
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SmartTip {
  id: string;
  icon: string;
  label: string;
  prompt: string;
}

interface SmartTipsProps {
  tips?: SmartTip[];
  onSelect: (tip: SmartTip) => void;
}

const defaultTips: SmartTip[] = [
  {
    id: 'agenda',
    icon: 'calendar-outline',
    label: '创建议程',
    prompt: '帮我创建一个会议议程',
  },
  {
    id: 'poll',
    icon: 'bar-chart-outline',
    label: '发起投票',
    prompt: '帮我发起一个投票',
  },
  {
    id: 'note',
    icon: 'document-text-outline',
    label: '记录要点',
    prompt: '帮我记录会议要点',
  },
  {
    id: 'task',
    icon: 'list-outline',
    label: '分配任务',
    prompt: '帮我分配会议任务',
  },
];

export const SmartTips: React.FC<SmartTipsProps> = ({
  tips = defaultTips,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb-outline" size={16} color="#F5A623" />
        <Text style={styles.headerText}>智能提示</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tipsContainer}
      >
        {tips.map((tip) => (
          <TouchableOpacity
            key={tip.id}
            style={styles.tipButton}
            onPress={() => onSelect(tip)}
            activeOpacity={0.7}
          >
            <Ionicons name={tip.icon as any} size={16} color="#007DFF" />
            <Text style={styles.tipLabel}>{tip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5A623',
  },
  tipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007DFF10',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tipLabel: {
    fontSize: 13,
    color: '#007DFF',
    fontWeight: '500',
  },
});
