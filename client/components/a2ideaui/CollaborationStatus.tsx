/**
 * 协作状态显示组件
 * 显示在线用户、编辑状态、协作指示器
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  isEditing?: boolean;
  editingCardId?: string;
  lastActive?: number;
}

interface CollaborationStatusProps {
  collaborators: Collaborator[];
  currentUserId?: string;
  onUserClick?: (user: Collaborator) => void;
  maxVisible?: number;
}

export const CollaborationStatus: React.FC<CollaborationStatusProps> = ({
  collaborators,
  currentUserId,
  onUserClick,
  maxVisible = 5,
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const onlineUsers = collaborators.filter((c) => c.isOnline);
  const editingUsers = collaborators.filter((c) => c.isEditing);
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const hiddenCount = onlineUsers.length - maxVisible;

  return (
    <View style={styles.container}>
      {/* 在线用户头像列表 */}
      <View style={styles.avatarList}>
        {visibleUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[styles.avatarContainer, { borderColor: user.color }]}
            onPress={() => onUserClick?.(user)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: user.color }]}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            {user.isEditing && (
              <Animated.View
                style={[
                  styles.editingIndicator,
                  {
                    transform: [{ scale: pulseAnim }],
                    backgroundColor: user.color,
                  },
                ]}
              >
                <Ionicons name="create" size={10} color="#fff" />
              </Animated.View>
            )}
            {user.isOnline && !user.isEditing && (
              <View style={[styles.onlineIndicator, { backgroundColor: '#2E7D32' }]} />
            )}
          </TouchableOpacity>
        ))}
        {hiddenCount > 0 && (
          <View style={styles.hiddenCount}>
            <Text style={styles.hiddenCountText}>+{hiddenCount}</Text>
          </View>
        )}
      </View>

      {/* 协作状态文本 */}
      <View style={styles.statusText}>
        <Text style={styles.statusLabel}>
          {onlineUsers.length} 人在线
        </Text>
        {editingUsers.length > 0 && (
          <Text style={styles.editingText}>
            · {editingUsers.length} 人编辑中
          </Text>
        )}
      </View>
    </View>
  );
};

/**
 * 卡片编辑状态指示器
 * 显示谁正在编辑当前卡片
 */
interface CardEditingIndicatorProps {
  collaborators: Collaborator[];
  cardId: string;
}

export const CardEditingIndicator: React.FC<CardEditingIndicatorProps> = ({
  collaborators,
  cardId,
}) => {
  const editingUsers = collaborators.filter(
    (c) => c.isEditing && c.editingCardId === cardId
  );

  if (editingUsers.length === 0) return null;

  return (
    <View style={styles.cardIndicator}>
      <Ionicons name="create" size={14} color="#007DFF" />
      <Text style={styles.cardIndicatorText}>
        {editingUsers.map((u) => u.name).join(', ')} 正在编辑
      </Text>
    </View>
  );
};

/**
 * 协作光标组件
 * 显示其他用户的光标位置
 */
interface CollaborationCursorProps {
  user: Collaborator;
  position: { x: number; y: number };
}

export const CollaborationCursor: React.FC<CollaborationCursorProps> = ({
  user,
  position,
}) => {
  return (
    <Animated.View
      style={[
        styles.cursor,
        {
          left: position.x,
          top: position.y,
          borderColor: user.color,
        },
      ]}
    >
      <View style={[styles.cursorLabel, { backgroundColor: user.color }]}>
        <Text style={styles.cursorLabelText}>{user.name}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginLeft: -8,
    borderWidth: 2,
    borderRadius: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  editingIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  hiddenCount: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  hiddenCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  editingText: {
    fontSize: 13,
    color: '#007DFF',
    fontWeight: '500',
  },
  cardIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 125, 255, 0.1)',
    borderRadius: 4,
    marginTop: 4,
  },
  cardIndicatorText: {
    fontSize: 12,
    color: '#007DFF',
    marginLeft: 4,
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 20,
    borderLeftWidth: 2,
  },
  cursorLabel: {
    position: 'absolute',
    top: -20,
    left: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cursorLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
