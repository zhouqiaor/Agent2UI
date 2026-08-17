/**
 * 全局搜索组件
 * 支持搜索卡片、会话、内容
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export interface SearchableItem {
  id: string;
  type: 'card' | 'session' | 'message' | 'content';
  title: string;
  content?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

interface GlobalSearchProps {
  items: SearchableItem[];
  onItemSelect: (item: SearchableItem) => void;
  placeholder?: string;
  maxResults?: number;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  items,
  onItemSelect,
  placeholder = '搜索卡片、会话、内容...',
  maxResults = 20,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return items
      .filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const contentMatch = item.content?.toLowerCase().includes(query);
        return titleMatch || contentMatch;
      })
      .slice(0, maxResults);
  }, [items, searchQuery, maxResults]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleItemSelect = (item: SearchableItem) => {
    // 添加到最近搜索
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 9)]);
    }
    onItemSelect(item);
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const getTypeIcon = (type: SearchableItem['type']) => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'session':
        return 'chatbubble-outline';
      case 'message':
        return 'chatbox-outline';
      case 'content':
        return 'document-text-outline';
      default:
        return 'search-outline';
    }
  };

  const getTypeLabel = (type: SearchableItem['type']) => {
    switch (type) {
      case 'card':
        return '卡片';
      case 'session':
        return '会话';
      case 'message':
        return '消息';
      case 'content':
        return '内容';
      default:
        return '其他';
    }
  };

  const getTypeColor = (type: SearchableItem['type']) => {
    switch (type) {
      case 'card':
        return '#007DFF';
      case 'session':
        return '#2E7D32';
      case 'message':
        return '#F5A623';
      case 'content':
        return '#9C27B0';
      default:
        return '#6B7280';
    }
  };

  return (
    <>
      {/* 搜索按钮 */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="search" size={20} color="#6B7280" />
        <Text style={styles.searchButtonText}>{placeholder}</Text>
      </TouchableOpacity>

      {/* 搜索模态框 */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <Animated.View
          style={styles.modalOverlay}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <View style={styles.modalContent}>
            {/* 搜索输入框 */}
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch}>
                  <Ionicons name="close-circle" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>

            {/* 搜索结果 */}
            {searchQuery.trim() ? (
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleItemSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.resultIcon,
                        { backgroundColor: getTypeColor(item.type) + '20' },
                      ]}
                    >
                      <Ionicons
                        name={getTypeIcon(item.type) as any}
                        size={20}
                        color={getTypeColor(item.type)}
                      />
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.content && (
                        <Text style={styles.resultSnippet} numberOfLines={2}>
                          {item.content}
                        </Text>
                      )}
                      <View style={styles.resultMeta}>
                        <View
                          style={[
                            styles.resultType,
                            { backgroundColor: getTypeColor(item.type) + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.resultTypeText,
                              { color: getTypeColor(item.type) },
                            ]}
                          >
                            {getTypeLabel(item.type)}
                          </Text>
                        </View>
                        {item.timestamp && (
                          <Text style={styles.resultTime}>
                            {new Date(item.timestamp).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>未找到相关结果</Text>
                  </View>
                }
                contentContainerStyle={styles.resultList}
              />
            ) : (
              /* 最近搜索 */
              <View style={styles.recentSearches}>
                <Text style={styles.recentTitle}>最近搜索</Text>
                {recentSearches.length > 0 ? (
                  recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentItem}
                      onPress={() => setSearchQuery(search)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={styles.recentText}>{search}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noRecentText}>暂无最近搜索</Text>
                )}
              </View>
            )}

            {/* 关闭按钮 */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 15,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 34,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  resultList: {
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultSnippet: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resultTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  recentSearches: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  recentText: {
    fontSize: 15,
    color: '#111827',
  },
  noRecentText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  closeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007DFF',
  },
});
