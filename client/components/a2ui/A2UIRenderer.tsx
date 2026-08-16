import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import type { A2UIComponent } from '@/utils/a2ui-types';
import { AgendaRenderer } from './AgendaRenderer';
import { PollRenderer } from './PollRenderer';
import { QARenderer } from './QARenderer';
import { NoteRenderer } from './NoteRenderer';
import { TaskListRenderer } from './TaskListRenderer';

interface A2UIRendererProps {
  components: A2UIComponent[];
  onAction?: (action: string, data: Record<string, unknown>) => void;
  isLoading?: boolean;
}

function HeadingRenderer({ data }: { data: { text: string; level: number } }) {
  const fontSize = data.level === 1 ? 22 : data.level === 2 ? 18 : 16;
  return (
    <Text style={[styles.heading, { fontSize }]}>{data.text}</Text>
  );
}

function TextRenderer({ data }: { data: { text: string } }) {
  return <Text style={styles.text}>{data.text}</Text>;
}

function DividerRenderer() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <FontAwesome6 name="diamond" size={8} color="#CBD5E1" />
      <View style={styles.dividerLine} />
    </View>
  );
}

function ActionButtonRenderer({
  data,
  onPress,
}: {
  data: { text: string; action: string; variant: string };
  onPress: () => void;
}) {
  const isPrimary = data.variant === 'primary';
  return (
    <Pressable
      style={[styles.actionButton, isPrimary ? styles.primaryButton : styles.secondaryButton]}
      onPress={onPress}
    >
      <FontAwesome6
        name={isPrimary ? 'comments' : 'download'}
        size={14}
        color={isPrimary ? '#FFFFFF' : '#4F46E5'}
      />
      <Text
        style={[
          styles.actionButtonText,
          isPrimary ? styles.primaryButtonText : styles.secondaryButtonText,
        ]}
      >
        {data.text}
      </Text>
    </Pressable>
  );
}

// 单个组件的动画包装器
function AnimatedComponentWrapper({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const [opacity] = React.useState(() => new Animated.Value(0));
  const [translateY] = React.useState(() => new Animated.Value(20));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export function A2UIRenderer({ components, onAction, isLoading }: A2UIRendererProps) {
  const renderComponent = (component: A2UIComponent, index: number) => {
    const content = (() => {
      switch (component.type) {
        case 'heading':
          return (
            <HeadingRenderer
              data={component.data as { text: string; level: number }}
            />
          );
        case 'text':
          return (
            <TextRenderer data={component.data as { text: string }} />
          );
        case 'divider':
          return <DividerRenderer />;
        case 'agenda':
          return (
            <AgendaRenderer
              data={
                component.data as {
                  title: string;
                  items: { id: string; text: string; completed: boolean }[];
                }
              }
            />
          );
        case 'poll':
          return (
            <PollRenderer
              data={
                component.data as {
                  question: string;
                  type: 'single' | 'multiple';
                  options: { id: string; text: string; votes: number }[];
                  totalVotes: number;
                }
              }
            />
          );
        case 'qa':
          return (
            <QARenderer
              data={
                component.data as {
                  question: string;
                  answers: { author: string; content: string; isExpert: boolean }[];
                }
              }
            />
          );
        case 'note':
          return (
            <NoteRenderer
              data={
                component.data as {
                  title: string;
                  content: string;
                  tags?: string[];
                }
              }
            />
          );
        case 'task_list':
          return (
            <TaskListRenderer
              data={
                component.data as {
                  title: string;
                  tasks: { id: string; text: string; assignee: string; priority: 'high' | 'medium' | 'low' }[];
                }
              }
            />
          );
        case 'action_button':
          return (
            <ActionButtonRenderer
              data={
                component.data as {
                  text: string;
                  action: string;
                  variant: string;
                }
              }
              onPress={() =>
                onAction?.(
                  (component.data as { action: string }).action,
                  component.data
                )
              }
            />
          );
        default:
          return (
            <View style={styles.unknown}>
              <Text style={styles.unknownText}>
                Unknown component: {component.type}
              </Text>
            </View>
          );
      }
    })();

    return (
      <AnimatedComponentWrapper key={component.id} index={index}>
        {content}
      </AnimatedComponentWrapper>
    );
  };

  return (
    <View style={styles.container}>
      {components.map(renderComponent)}
      {isLoading && (
        <View style={styles.loadingIndicator}>
          <View style={styles.loadingDots}>
            <View style={[styles.loadingDot, styles.dot1]} />
            <View style={[styles.loadingDot, styles.dot2]} />
            <View style={[styles.loadingDot, styles.dot3]} />
          </View>
          <Text style={styles.loadingText}>AI 正在生成内容...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  heading: {
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'rgba(79,70,229,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.2)',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#4F46E5',
  },
  unknown: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  unknownText: {
    fontSize: 12,
    color: '#EF4444',
  },
  loadingIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  loadingText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
