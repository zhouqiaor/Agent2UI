/**
 * 课程详情页 - 教育场景
 * 
 * 功能：
 * - 使用 A2IdeaUI 教育组件
 * - 支持课堂测验（Quiz）
 * - 支持知识点标注（KnowledgePoint）
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
  Alert,
  TextInput,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useResponsive } from '@/hooks/useResponsive';
import AsyncStorage from '@react-native-async-storage/async-storage';

// A2IdeaUI 教育组件
import {
  Card,
  AgendaRenderer,
  PollRenderer,
  NoteRenderer,
  QARenderer,
  TaskListRenderer,
  SmartTips,
  QuizRenderer,
  KnowledgePointRenderer,
} from '@/components/a2ideaui';

interface Course {
  id: string;
  title: string;
  teacher: string;
  students: number;
  duration: string;
  schedule: string;
  description: string;
}

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

// 教育场景智能提示
const EDUCATION_TIPS = [
  '📝 生成课堂测验',
  '📚 标注重点知识点',
  '📊 创建学习进度跟踪',
  '❓ 生成课堂问答',
  '✅ 布置课后作业',
];

export default function CourseDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const { id } = useSafeSearchParams<{ id: string }>();
  const { shouldUseTwoColumn, isTablet } = useResponsive();
  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [cards, setCards] = useState<A2UIComponent[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [favoritedCards, setFavoritedCards] = useState<Set<string>>(new Set());
  const [castingCards, setCastingCards] = useState<Set<string>>(new Set());
  const [inputMessage, setInputMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 模拟课程数据
  useEffect(() => {
    const mockCourse: Course = {
      id: id || '1',
      title: 'React Native 高级开发',
      teacher: '张老师',
      students: 45,
      duration: '90分钟',
      schedule: '每周三 14:00-15:30',
      description: '深入学习 React Native 的高级特性，包括性能优化、原生模块开发、动画系统等',
    };
    setCourse(mockCourse);
    setLoadingCourse(false);

    // 模拟课程卡片数据
    const mockCards: A2UIComponent[] = [
      {
        id: 'card-1',
        type: 'card',
        title: '课程议程',
        items: [
          {
            type: 'agenda',
            title: '课程议程',
            items: [
              { id: '1', text: 'React Native 架构回顾', completed: true },
              { id: '2', text: '性能优化技巧', completed: false },
              { id: '3', text: '原生模块开发', completed: false },
              { id: '4', text: '动画系统详解', completed: false },
            ],
          },
        ],
      },
      {
        id: 'card-2',
        type: 'card',
        title: '课堂测验',
        items: [
          {
            type: 'quiz',
            title: 'React Native 基础测验',
            description: '测试你对 React Native 基础知识的掌握程度',
            questions: [
              {
                id: 'q1',
                question: 'React Native 使用什么作为底层渲染引擎？',
                options: ['DOM', 'Native Views', 'Canvas', 'WebView'],
                correctAnswer: 1,
                type: 'single',
              },
              {
                id: 'q2',
                question: '以下哪些是 React Native 的核心组件？（多选）',
                options: ['View', 'Text', 'div', 'span'],
                correctAnswer: [0, 1],
                type: 'multiple',
              },
            ],
          },
        ],
      },
      {
        id: 'card-3',
        type: 'card',
        title: '重点知识点',
        items: [
          {
            type: 'knowledge_point',
            title: 'React Native 性能优化',
            description: '掌握 React Native 应用性能优化的关键技巧',
            points: [
              {
                id: 'kp1',
                title: '使用 FlatList 替代 ScrollView',
                importance: 'high',
                category: '性能',
              },
              {
                id: 'kp2',
                title: '避免在渲染函数中创建新对象',
                importance: 'high',
                category: '性能',
              },
              {
                id: 'kp3',
                title: '使用 React.memo 优化组件渲染',
                importance: 'medium',
                category: '优化',
              },
            ],
          },
        ],
      },
      {
        id: 'card-4',
        type: 'card',
        title: '课后作业',
        items: [
          {
            type: 'task_list',
            title: '课后作业',
            items: [
              {
                id: 'task1',
                text: '完成性能优化练习',
                completed: false,
                assignee: '全体学生',
                dueDate: '2024-01-20',
              },
              {
                id: 'task2',
                text: '提交原生模块开发作业',
                completed: false,
                assignee: '全体学生',
                dueDate: '2024-01-25',
              },
            ],
          },
        ],
      },
    ];
    setCards(mockCards);
  }, [id]);

  // 加载收藏状态
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = await AsyncStorage.getItem(`course-${id}-favorites`);
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
        `course-${id}-favorites`,
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
  const handleSmartTipClick = useCallback((tip: string) => {
    setInputMessage(tip);
  }, []);

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
    cards.forEach((card, index) => {
      if (index % 2 === 0) {
        info.push(card);
      } else {
        interaction.push(card);
      }
    });
    return { infoComponents: info, interactionComponents: interaction };
  }, [cards, shouldUseTwoColumn]);

  if (loadingCourse) {
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
          return <AgendaRenderer key={index} data={item} onAction={() => {}} />;
        case 'poll':
          return <PollRenderer key={index} data={item} onAction={() => {}} />;
        case 'note':
          return <NoteRenderer key={index} data={item} onAction={() => {}} />;
        case 'qa':
          return <QARenderer key={index} data={item} onAction={() => {}} />;
        case 'task_list':
          return <TaskListRenderer key={index} data={item} onAction={() => {}} />;
        case 'quiz':
          return <QuizRenderer key={index} data={item} onAction={() => {}} />;
        case 'knowledge_point':
          return <KnowledgePointRenderer key={index} data={item} onAction={() => {}} />;
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
            {course?.title || '课程详情'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {course?.teacher} · {course?.students}名学生 · {course?.duration}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn} onPress={handleExport}>
            <FontAwesome6 name="download" size={18} color="#1E293B" />
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={handleToggleFullscreen}>
            <FontAwesome6 name="expand" size={18} color="#1E293B" />
          </Pressable>
        </View>
      </View>

      {/* 课程信息 */}
      <View style={styles.courseInfo}>
        <Text style={styles.courseDescription}>{course?.description}</Text>
        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <FontAwesome6 name="calendar" size={14} color="#64748B" />
            <Text style={styles.metaText}>{course?.schedule}</Text>
          </View>
        </View>
      </View>

      {/* 智能提示 */}
      <SmartTips tips={EDUCATION_TIPS} onTipClick={handleSmartTipClick} />

      {/* Tablet landscape: two-column layout */}
      {shouldUseTwoColumn ? (
        <View style={styles.twoColumnContainer}>
          {/* Left: info */}
          <ScrollView
            style={styles.leftColumn}
            contentContainerStyle={styles.twoColumnContent}
            showsVerticalScrollIndicator={false}
          >
            {infoComponents.map((card) => (
              <Card
                key={card.id}
                title={card.title || '课程卡片'}
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
              title={card.title || '课程卡片'}
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
  courseInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  courseDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  courseMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
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
