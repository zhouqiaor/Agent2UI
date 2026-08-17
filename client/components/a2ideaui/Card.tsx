/**
 * A2IdeaUI 卡片组件
 * 基于鸿蒙设计语言，支持收藏/选中/投屏/关闭操作
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

interface CardProps {
  id: string;
  title: string;
  type: 'agenda' | 'poll' | 'note' | 'qa' | 'task';
  children: React.ReactNode;
  isFavorite?: boolean;
  isSelected?: boolean;
  isCasting?: boolean;
  onFavorite?: (id: string) => void;
  onSelect?: (id: string) => void;
  onCast?: (id: string) => void;
  onClose?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const Card: React.FC<CardProps> = ({
  id,
  title,
  type,
  children,
  isFavorite = false,
  isSelected = false,
  isCasting = false,
  onFavorite,
  onSelect,
  onCast,
  onClose,
  onEdit,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'agenda':
        return 'calendar-outline';
      case 'poll':
        return 'bar-chart-outline';
      case 'note':
        return 'document-text-outline';
      case 'qa':
        return 'help-circle-outline';
      case 'task':
        return 'list-outline';
      default:
        return 'card-outline';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'agenda':
        return '#007DFF';
      case 'poll':
        return '#2E7D32';
      case 'note':
        return '#F5A623';
      case 'qa':
        return '#9C27B0';
      case 'task':
        return '#FF3B30';
      default:
        return '#007DFF';
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isCasting && styles.cardCasting,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* 卡片头部 */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor() + '20' }]}>
            <Ionicons name={getTypeIcon() as any} size={16} color={getTypeColor()} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>

        {/* 操作按钮 */}
        <View style={styles.cardActions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(id)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color="#666" />
            </TouchableOpacity>
          )}
          
          {onFavorite && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onFavorite(id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'star' : 'star-outline'}
                size={16}
                color={isFavorite ? '#F5A623' : '#666'}
              />
            </TouchableOpacity>
          )}

          {onSelect && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                isSelected && styles.actionButtonSelected,
              ]}
              onPress={() => onSelect(id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={isSelected ? '#007DFF' : '#666'}
              />
            </TouchableOpacity>
          )}

          {onCast && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                isCasting && styles.actionButtonCasting,
              ]}
              onPress={() => onCast(id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="tv-outline"
                size={16}
                color={isCasting ? '#2E7D32' : '#666'}
              />
            </TouchableOpacity>
          )}

          {onClose && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onClose(id)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 卡片内容 */}
      <View style={styles.cardContent}>{children}</View>

      {/* 投屏状态指示器 */}
      {isCasting && (
        <View style={styles.castingIndicator}>
          <View style={styles.castingDot} />
          <Text style={styles.castingText}>正在投屏</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#007DFF',
  },
  cardCasting: {
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonSelected: {
    backgroundColor: '#007DFF20',
  },
  actionButtonCasting: {
    backgroundColor: '#2E7D3220',
  },
  cardContent: {
    padding: 16,
  },
  castingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2E7D3210',
    borderTopWidth: 1,
    borderTopColor: '#2E7D3230',
  },
  castingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginRight: 6,
  },
  castingText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
});
