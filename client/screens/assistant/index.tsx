import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SSE from 'react-native-sse';
import { A2UIRenderer } from '@/components/a2ui/A2UIRenderer';
import type { A2UIComponent } from '@/utils/a2ui-types';
import { useResponsive } from '@/hooks/useResponsive';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  components: A2UIComponent[];
}

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '你好！我是 MeetFlow AI 助手。我可以帮你创建投票、生成议程、管理任务等。试试对我说"创建一个投票"或"生成议程"吧！',
      components: [],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sseRef = useRef<SSE | null>(null);

  const sendMessage = useCallback(() => {
    if (!inputText.trim() || isStreaming) return;

    const userMessage: AssistantMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: inputText.trim(),
      components: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsStreaming(true);

    // 创建空的 assistant message
    const assistantId = `assistant_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', text: '', components: [] },
    ]);

    const url = `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/assistant/chat`;

    /**
     * 服务端文件：server/src/routes/assistant.ts
     * 接口：POST /api/v1/assistant/chat
     * Body 参数：message: string, context?: string
     */
    const sse = new SSE(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: currentInput }),
    });

    sseRef.current = sse;
    let accumulatedText = '';

    sse.addEventListener('message', (event) => {
      if (event.data === '[DONE]') {
        // 解析文本中的 A2UI 组件
        const a2uiRegex = /```a2ui\n([\s\S]*?)\n```/g;
        const components: A2UIComponent[] = [];
        let match;
        while ((match = a2uiRegex.exec(accumulatedText)) !== null) {
          try {
            const component = JSON.parse(match[1]);
            components.push(component);
          } catch (e) {
            console.warn('Failed to parse A2UI component:', e);
          }
        }
        
        // 移除文本中的代码块
        const cleanText = accumulatedText.replace(a2uiRegex, '').trim();
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, text: cleanText, components }
              : msg
          )
        );
        
        setIsStreaming(false);
        sse.close();
        return;
      }

      try {
        const item = JSON.parse(event.data as string);

        if (item.type === 'text_chunk') {
          accumulatedText += item.data;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        } else if (item.type === 'component') {
          const component = item.data as A2UIComponent;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, components: [...msg.components, component] }
                : msg
            )
          );
        }
      } catch (e) {
        console.warn('Failed to parse assistant response:', e);
      }
    });

    sse.addEventListener('error', () => {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, text: msg.text || '抱歉，出现了错误，请重试。' }
            : msg
        )
      );
    });
  }, [inputText, isStreaming]);

  const quickActions = [
    { label: '创建投票', icon: 'chart-bar' as const, text: '创建一个投票' },
    { label: '生成议程', icon: 'list-check' as const, text: '生成一个会议议程' },
    { label: '任务列表', icon: 'clipboard-list' as const, text: '创建一个任务列表' },
    { label: '会议纪要', icon: 'file-lines' as const, text: '帮我整理会议纪要' },
    { label: '头脑风暴', icon: 'lightbulb' as const, text: '帮我头脑风暴一下' },
  ];

  const suggestions = [
    { icon: 'calendar-plus' as const, title: '安排会议', desc: '创建会议并生成议程' },
    { icon: 'people-group' as const, title: '分组讨论', desc: '将参会者自动分组' },
    { icon: 'chart-pie' as const, title: '数据可视化', desc: '生成图表展示结果' },
    { icon: 'file-export' as const, title: '导出纪要', desc: '一键导出会议记录' },
  ];

  const { shouldUseTwoColumn } = useResponsive();

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIconContainer}>
            <FontAwesome6 name="robot" size={20} color="#4F46E5" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI 助手</Text>
            <Text style={styles.headerStatus}>
              {isStreaming ? '正在生成...' : '在线'}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {shouldUseTwoColumn ? (
          <View style={styles.twoColumnChat}>
            {/* Left: suggestion panel */}
            <View style={styles.aiSidebar}>
              <Text style={styles.aiSidebarTitle}>常用功能</Text>
              <View style={styles.suggestionGrid}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s.title}
                    style={styles.suggestionCard}
                    onPress={() => setInputText(s.desc)}
                  >
                    <View style={styles.suggestionIcon}>
                      <FontAwesome6 name={s.icon} size={18} color="#4F46E5" />
                    </View>
                    <Text style={styles.suggestionTitle}>{s.title}</Text>
                    <Text style={styles.suggestionDesc}>{s.desc}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.sidebarDivider} />
              <Text style={styles.aiSidebarTitle}>快捷提示</Text>
              <View style={styles.quickHints}>
                {['"帮我创建项目评审投票"', '"总结本次会议要点"', '"分配待办任务给成员"'].map((hint, i) => (
                  <Pressable
                    key={i}
                    style={styles.hintBtn}
                    onPress={() => setInputText(hint.replace(/"/g, ''))}
                  >
                    <FontAwesome6 name="wand-magic-sparkles" size={12} color="#4F46E5" />
                    <Text style={styles.hintText}>{hint}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Right: chat area */}
            <View style={styles.chatArea}>
              <ScrollView
                ref={scrollViewRef}
                style={styles.flex}
                contentContainerStyle={[styles.messagesContent, styles.tabletMsgContent]}
                onContentSizeChange={() =>
                  scrollViewRef.current?.scrollToEnd({ animated: true })
                }
              >
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      msg.role === 'user' ? styles.userRow : styles.assistantRow,
                    ]}
                  >
                    {msg.role === 'assistant' && (
                      <View style={styles.aiAvatar}>
                        <FontAwesome6 name="robot" size={14} color="#4F46E5" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                      ]}
                    >
                      {msg.text ? (
                        <Text
                          style={[
                            styles.messageText,
                            msg.role === 'user' ? styles.userText : styles.assistantText,
                          ]}
                        >
                          {msg.text}
                        </Text>
                      ) : null}
                      {msg.components.length > 0 && (
                        <View style={styles.componentsContainer}>
                          <A2UIRenderer components={msg.components} />
                        </View>
                      )}
                    </View>
                  </View>
                ))}

                {isStreaming && messages[messages.length - 1]?.text === '' && (
                  <View style={[styles.messageRow, styles.assistantRow]}>
                    <View style={styles.aiAvatar}>
                      <FontAwesome6 name="robot" size={14} color="#4F46E5" />
                    </View>
                    <View style={styles.assistantBubble}>
                      <ActivityIndicator size="small" color="#4F46E5" />
                    </View>
                  </View>
                )}

                <View style={{ height: 20 }} />
              </ScrollView>

              {/* Input Bar */}
              <View style={[styles.inputBar, styles.tabletInputBar, { paddingBottom: insets.bottom + 12 }]}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="输入消息..."
                    placeholderTextColor="#94A3B8"
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                    editable={!isStreaming}
                    multiline
                  />
                  <Pressable
                    style={[
                      styles.sendBtn,
                      (!inputText.trim() || isStreaming) && styles.sendBtnDisabled,
                    ]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || isStreaming}
                  >
                    <FontAwesome6
                      name="paper-plane"
                      size={16}
                      color={!inputText.trim() || isStreaming ? '#CBD5E1' : '#FFFFFF'}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.role === 'user' ? styles.userRow : styles.assistantRow,
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <FontAwesome6 name="robot" size={14} color="#4F46E5" />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.role === 'user'
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                {msg.text ? (
                  <Text
                    style={[
                      styles.messageText,
                      msg.role === 'user'
                        ? styles.userText
                        : styles.assistantText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                ) : null}
                {msg.components.length > 0 && (
                  <View style={styles.componentsContainer}>
                    <A2UIRenderer components={msg.components} />
                  </View>
                )}
              </View>
            </View>
          ))}

          {isStreaming && messages[messages.length - 1]?.text === '' && (
            <View style={[styles.messageRow, styles.assistantRow]}>
              <View style={styles.aiAvatar}>
                <FontAwesome6 name="robot" size={14} color="#4F46E5" />
              </View>
              <View style={styles.assistantBubble}>
                <ActivityIndicator size="small" color="#4F46E5" />
              </View>
            </View>
          )}

          {/* Quick Actions */}
          {messages.length <= 1 && !isStreaming && (
            <View style={styles.quickActions}>
              <Text style={styles.quickActionsTitle}>快捷操作</Text>
              <View style={styles.quickActionsRow}>
                {quickActions.map((action) => (
                  <Pressable
                    key={action.label}
                    style={styles.quickActionBtn}
                    onPress={() => {
                      setInputText(action.text);
                    }}
                  >
                    <FontAwesome6 name={action.icon} size={14} color="#4F46E5" />
                    <Text style={styles.quickActionText}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="输入消息..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              editable={!isStreaming}
              multiline
            />
            <Pressable
              style={[
                styles.sendBtn,
                (!inputText.trim() || isStreaming) && styles.sendBtnDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isStreaming}
            >
              <FontAwesome6
                name="paper-plane"
                size={16}
                color={
                  !inputText.trim() || isStreaming ? '#CBD5E1' : '#FFFFFF'
                }
              />
            </Pressable>
          </View>
        </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F0F0F3',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '90%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  assistantRow: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 14,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: '#F0F0F3',
    borderBottomLeftRadius: 6,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#334155',
  },
  componentsContainer: {
    marginTop: 10,
  },
  quickActions: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  quickActionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(79,70,229,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.12)',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#F0F0F3',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#E8E8EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#E8E8EB',
  },
  // Tablet landscape two-column
  twoColumnChat: {
    flex: 1,
    flexDirection: 'row',
  },
  aiSidebar: {
    width: 280,
    padding: 20,
    paddingTop: 8,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(148,163,184,0.2)',
    backgroundColor: 'rgba(79,70,229,0.02)',
  },
  aiSidebarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  suggestionGrid: {
    gap: 10,
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 6,
    ...Platform.select({
      ios: { shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
      web: { boxShadow: '0 2px 6px rgba(79,70,229,0.06)' },
    }),
  },
  suggestionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  suggestionDesc: {
    fontSize: 12,
    color: '#94A3B8',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.15)',
    marginVertical: 20,
  },
  quickHints: {
    gap: 8,
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(79,70,229,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  chatArea: {
    flex: 1,
  },
  tabletMsgContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 20,
  },
  tabletInputBar: {
    paddingHorizontal: 28,
  },
});
