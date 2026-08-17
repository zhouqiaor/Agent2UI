/**
 * 增强版会议详情页 - 集成 A2IdeaUI 组件
 * 
 * 功能：
 * - 使用 A2IdeaUI 组件替换原有 A2UI 组件
 * - 支持卡片操作（收藏/选中/投屏/关闭）
 * - 支持智能提示快速生成
 * - 支持会话持久化
 * - 支持导出功能
 * - 支持全屏演示模式
 */

import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useA2UIStream } from '@/hooks/useA2UIStream';
import { useResponsive } from '@/hooks/useResponsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Meeting } from '@/utils/a2ui-types';

// A2IdeaUI 组件
import {
  Card,
  AgendaRenderer,
  PollRenderer,
  NoteRenderer,
  QARenderer,
  TaskListRenderer,
  SmartTips,
} from '@/components/a2ideaui';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface A2UIComponent {
  id: string;
  type: string;
  title?: string;
  description?: string;
  items?: any[];
  options?: any[];
  content?: string;
  tags?: string[];
  [key: string]: any;
}

// Interaction-related components shown in the right column on tablet
const INTERACTION_TYPES = new Set(['poll', 'qa', 'task_list', 'action_button']);
const INFO_TYPES = new Set(['heading', 'text', 'agenda', 'note', 'divider']);

export default function MeetingDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const { id } = useSafeSearchParams<{ id: string }>();
  const { shouldUseTwoColumn, isTablet } = useResponsive();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [cards, setCards] = useState<A2UIComponent[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [favoritedCards, setFavoritedCards] = useState<Set<string>>(new Set());
  const [castingCards, setCastingCards] = useState<Set<string>>(new Set());
  const [inputMessage, setInputMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { components, isLoading: streamLoading, startStream } = useA2UIStream();

  // 加载会议数据
  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id) return;
      try {
        const response = await fetch(
          `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/meetings/${id}`
        );
        const json = await response.json();
        if (json.success) {
          setMeeting(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch meeting:', error);
      } finally {
        setLoadingMeeting(false);
      }
    };
    fetchMeeting();
  }, [id]);

  // 自动加载 A2UI 组件流
  useEffect(() => {
    if (id && !streamLoading && components.length === 0) {
      startStream('/api/v1/a2ui/stream', {
        meetingId: id,
        action: 'load',
      });
    }
  }, [id, streamLoading, components.length, startStream]);

  // 将会话数据转换为卡片
  useEffect(() => {
    if (components.length > 0) {
      // 将组件分组为卡片
      const newCards: A2UIComponent[] = [];
      let currentCard: A2UIComponent | null = null;

      components.forEach((comp, index) => {
        if (comp.type === 'heading' || index === 0) {
          if (currentCard) {
            newCards.push(currentCard);
          }
          currentCard = {
            id: `card-${index}`,
            type: 'card',
            title: comp.title || '会议卡片',
            content: comp.description || '',
            items: [],
          };
        }
        if (currentCard && comp.type !== 'heading') {
          currentCard.items?.push(comp);
        }
      });

      if (currentCard) {
        newCards.push(currentCard);
      }

      setCards(newCards);
    }
  }, [components]);

  // 加载收藏状态
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = await AsyncStorage.getItem(`meeting-${id}-favorites`);
        if (saved) {
          setFavoritedCards(new Set(JSON.parse(saved)));
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    };
    loadFavorites();
  }, [id]);

  // 保存收藏状态
  const saveFavorites = async (favorites: Set<string>) => {
    try {
      await AsyncStorage.setItem(
        `meeting-${id}-favorites`,
        JSON.stringify(Array.from(favorites))
      );
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  };

  // 切换收藏
  const handleToggleFavorite = useCallback(
    (cardId: string) => {
      const newFavorites = new Set(favoritedCards);
      if (newFavorites.has(cardId)) {
        newFavorites.delete(cardId);
      } else {
        newFavorites.add(cardId);
      }
      setFavoritedCards(newFavorites);
      saveFavorites(newFavorites);
    },
    [favoritedCards, id]
  );

  // 切换选中
  const handleToggleSelect = useCallback((cardId: string) => {
    setSelectedCardId((prev) => (prev === cardId ? null : cardId));
  }, []);

  // 切换投屏
  const handleToggleCast = useCallback((cardId: string) => {
    setCastingCards((prev) => {
      const newCasting = new Set(prev);
      if (newCasting.has(cardId)) {
        newCasting.delete(cardId);
      } else {
        newCasting.add(cardId);
      }
      return newCasting;
    });
  }, []);

  // 关闭卡片
  const handleCloseCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  // 智能提示点击
  const handleSmartTipClick = useCallback(
    (tip: string) => {
      setInputMessage(tip);
      // 可以触发 AI 生成
    },
    []
  );

  // 发送消息
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;
    Alert.alert('消息已发送', inputMessage);
    setInputMessage('');
  }, [inputMessage]);

  // 导出功能
  const handleExport = useCallback(() => {
    Alert.alert('导出', '选择导出格式：PDF / Word / Markdown');
  }, []);

  // 全屏模式
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Split components into info and interaction columns for tablet landscape
  const { infoComponents, interactionComponents } = useMemo(() => {
    if (!shouldUseTwoColumn) {
      return { infoComponents: cards, interactionComponents: [] as A2UIComponent[] };
    }
    const info: A2UIComponent[] = [];
    const interaction: A2UIComponent[] = [];
    cards.forEach((c) => {
      const hasInteraction = c.items?.some((item: any) =>
        INTERACTION_TYPES.has(item.type)
      );
      if (hasInteraction) {
        interaction.push(c);
      } else {
        info.push(c);
      }
    });
    return { infoComponents: info, interactionComponents: interaction };
  }, [cards, shouldUseTwoColumn]);

  if (loadingMeeting) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007DFF" />
        </View>
      </Screen>
    );
  }

  // 渲染卡片内容
  const renderCardContent = (card: A2UIComponent) => {
    return card.items?.map((item: any, index: number) => {
      switch (item.type) {
        case 'agenda':
          return <AgendaRenderer key={index} items={item.items || []} onToggle={() => {}} />;
        case 'poll':
          return <PollRenderer key={index} options={item.options || []} onVote={() => {}} />;
        case 'note':
          return <NoteRenderer key={index} content={item.content || ''} tags={item.tags || []} />;
        case 'qa':
          return <QARenderer key={index} items={item.items || []} onAsk={() => {}} />;
        case 'task_list':
          return <TaskListRenderer key={index} items={item.items || []} onToggle={() => {}} />;
        default:
          return null;
      }
    });
  };

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (isTablet ? 16 : 8) }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left" size={18} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {meeting?.title || '会议详情'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {meeting?.organizer} · {meeting?.participants}人参与 · {meeting?.location}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {streamLoading && (
            <View style={styles.streamingIndicator}>
              <ActivityIndicator size="small" color="#007DFF" />
              <Text style={styles.streamingText}>AI 生成中</Text>
            </View>
          )}
          <Pressable style={styles.headerBtn} onPress={handleExport}>
            <FontAwesome6 name="download" size={18} color="#1E293B" />
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={handleToggleFullscreen}>
            <FontAwesome6 name="expand" size={18} color="#1E293B" />
          </Pressable>
        </View>
      </View>

      {/* 智能提示 */}
      <SmartTips onTipClick={handleSmartTipClick} />

      {/* Tablet landscape: two-column layout */}
      {shouldUseTwoColumn ? (
        <View style={styles.twoColumnContainer}>
          {/* Left: info / agenda / notes */}
          <ScrollView
            style={styles.leftColumn}
            contentContainerStyle={styles.twoColumnContent}
            showsVerticalScrollIndicator={false}
          >
            {infoComponents.map((card) => (
              <Card
                key={card.id}
                title={card.title || '会议卡片'}
                isFavorited={favoritedCards.has(card.id)}
                isSelected={selectedCardId === card.id}
                isCasting={castingCards.has(card.id)}
                onToggleFavorite={() => handleToggleFavorite(card.id)}
                onToggleSelect={() => handleToggleSelect(card.id)}
                onToggleCast={() => handleToggleCast(card.id)}
                onClose={() => handleCloseCard(card.id)}
              >
                {renderCardContent(card)}
              </Card>
            ))}
          </ScrollView>

          {/* Right: interaction */}
          <ScrollView
            style={styles.rightColumn}
            contentContainerStyle={styles.twoColumnContent}
            showsVerticalScrollIndicator={false}
          >
            {interactionComponents.map((card) => (
              <Card
                key={card.id}
                title={card.title || '互动卡片'}
                isFavorited={favoritedCards.has(card.id)}
                isSelected={selectedCardId === card.id}
                isCasting={castingCards.has(card.id)}
                onToggleFavorite={() => handleToggleFavorite(card.id)}
                onToggleSelect={() => handleToggleSelect(card.id)}
                onToggleCast={() => handleToggleCast(card.id)}
                onClose={() => handleCloseCard(card.id)}
              >
                {renderCardContent(card)}
              </Card>
            ))}
          </ScrollView>
        </View>
      ) : (
        /* Mobile: single column */
        <ScrollView
          style={styles.singleColumn}
          contentContainerStyle={styles.singleColumnContent}
          showsVerticalScrollIndicator={false}
        >
          {cards.map((card) => (
            <Card
              key={card.id}
              title={card.title || '会议卡片'}
              isFavorited={favoritedCards.has(card.id)}
              isSelected={selectedCardId === card.id}
              isCasting={castingCards.has(card.id)}
              onToggleFavorite={() => handleToggleFavorite(card.id)}
              onToggleSelect={() => handleToggleSelect(card.id)}
              onToggleCast={() => handleToggleCast(card.id)}
              onClose={() => handleCloseCard(card.id)}
            >
              {renderCardContent(card)}
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Input area */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom + 12 }]}>
        <TextInput
          style={styles.input}
          placeholder="输入消息迭代修改卡片..."
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
        />
        <Pressable style={styles.sendBtn} onPress={handleSendMessage}>
          <FontAwesome6 name="paper-plane" size={18} color="#FFF" />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
  },
  streamingText: {
    fontSize: 12,
    color: '#007DFF',
    fontWeight: '600',
  },
  twoColumnContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1.4,
  },
  rightColumn: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  twoColumnContent: {
    padding: 16,
    gap: 16,
  },
  singleColumn: {
    flex: 1,
  },
  singleColumnContent: {
    padding: 16,
    gap: 16,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    fontSize: 15,
    color: '#1E293B',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
