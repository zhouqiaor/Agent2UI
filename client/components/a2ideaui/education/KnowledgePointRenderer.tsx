/**
 * 教育场景 - 知识点标注组件
 * 支持知识点高亮、分类标签
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface KnowledgePoint {
  id: string;
  title: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  description?: string;
}

interface KnowledgePointRendererProps {
  points: KnowledgePoint[];
}

export const KnowledgePointRenderer: React.FC<KnowledgePointRendererProps> = ({
  points = [],
}) => {
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#F5A623';
      case 'low':
        return '#2E7D32';
      default:
        return '#8A8D93';
    }
  };

  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case 'high':
        return '重点';
      case 'medium':
        return '一般';
      case 'low':
        return '了解';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* 知识点列表 */}
      <View style={styles.pointsList}>
        {points.map((point) => {
          const importanceColor = getImportanceColor(point.importance);
          return (
            <View key={point.id} style={styles.pointItem}>
              {/* 知识点标题 */}
              <View style={styles.pointHeader}>
                <View style={[styles.importanceBadge, { backgroundColor: importanceColor + '20' }]}>
                  <Text style={[styles.importanceText, { color: importanceColor }]}>
                    {getImportanceLabel(point.importance)}
                  </Text>
                </View>
                <Text style={styles.pointTitle}>{point.title}</Text>
              </View>

              {/* 知识点描述 */}
              {point.description && (
                <Text style={styles.pointDescription}>{point.description}</Text>
              )}

              {/* 分类标签 */}
              <View style={styles.categoryContainer}>
                <Ionicons name="pricetag-outline" size={12} color="#007DFF" />
                <Text style={styles.categoryText}>{point.category}</Text>
              </View>
            </View>
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
  pointsList: {
    gap: 12,
  },
  pointItem: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  importanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  importanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pointTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  pointDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    paddingLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#007DFF',
  },
});
