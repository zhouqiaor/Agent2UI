/**
 * 可拖拽卡片列表组件
 * 支持拖拽排序、动画效果
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

export interface DraggableCardItem {
  id: string;
  order: number;
  [key: string]: any;
}

interface DraggableCardListProps<T extends DraggableCardItem> {
  items: T[];
  renderItem: (item: T, index: number, drag: () => void) => React.ReactNode;
  onReorder: (items: T[]) => void;
  itemHeight?: number;
  spacing?: number;
}

export function DraggableCardList<T extends DraggableCardItem>({
  items,
  renderItem,
  onReorder,
  itemHeight = 200,
  spacing = 12,
}: DraggableCardListProps<T>) {
  const position = useSharedValue(0);
  const activeId = useSharedValue<string | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => a.order - b.order);
  }, [items]);

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newItems = [...sortedItems];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);

      // 更新 order
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      onReorder(reorderedItems);
    },
    [sortedItems, onReorder]
  );

  const handleDragStart = useCallback(
    (id: string) => {
      activeId.value = id;
      setDraggingId(id);
    },
    [activeId]
  );

  const handleDragEnd = useCallback(() => {
    activeId.value = null;
    setDraggingId(null);
  }, [activeId]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.list}>
        {sortedItems.map((item, index) => (
          <DraggableCard
            key={item.id}
            item={item}
            index={index}
            isDragging={draggingId === item.id}
            itemHeight={itemHeight}
            spacing={spacing}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onReorder={handleReorder}
          >
            {renderItem(item, index, () => handleDragStart(item.id))}
          </DraggableCard>
        ))}
      </View>
    </GestureHandlerRootView>
  );
}

interface DraggableCardProps<T extends DraggableCardItem> {
  item: T;
  index: number;
  isDragging: boolean;
  itemHeight: number;
  spacing: number;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
}

function DraggableCard<T extends DraggableCardItem>({
  item,
  index,
  isDragging,
  itemHeight,
  spacing,
  onDragStart,
  onDragEnd,
  onReorder,
  children,
}: DraggableCardProps<T>) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
  }));

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onDragStart)(item.id);
      scale.value = withSpring(1.05);
      zIndex.value = 1000;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const dragDistance = event.translationY;
      const itemTotalHeight = itemHeight + spacing;
      const moveCount = Math.round(dragDistance / itemTotalHeight);

      if (moveCount !== 0) {
        const newIndex = Math.max(0, Math.min(index + moveCount, 999));
        runOnJS(onReorder)(index, newIndex);
      }

      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
      runOnJS(onDragEnd)();
    });

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    gap: 12,
  },
  card: {
    marginBottom: 12,
  },
});
