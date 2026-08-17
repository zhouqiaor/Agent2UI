/**
 * 全屏演示模式组件
 * 支持全屏展示卡片内容
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';

const { width, height } = Dimensions.get('window');

interface FullscreenPresentationProps {
  visible: boolean;
  cards: any[];
  onClose: () => void;
}

export const FullscreenPresentation: React.FC<FullscreenPresentationProps> = ({
  visible,
  cards,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLandscape, setIsLandscape] = useState(width > height);

  useEffect(() => {
    const updateOrientation = () => {
      const { width: w, height: h } = Dimensions.get('window');
      setIsLandscape(w > h);
    };

    const subscription = Dimensions.addEventListener('change', updateOrientation);
    return () => subscription?.remove();
  }, []);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!visible || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <View style={styles.container}>
        {/* 顶部控制栏 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {currentIndex + 1} / {cards.length}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 卡片内容 */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={isLandscape ? styles.cardContainerLandscape : styles.cardContainerPortrait}>
            <Card
              id={currentCard.id}
              type={currentCard.type}
              title={currentCard.title}
              isCasting={false}
              onFavorite={() => {}}
              onSelect={() => {}}
              onCast={() => {}}
              onClose={() => {}}
            >
              <Text>{JSON.stringify(currentCard.data)}</Text>
            </Card>
          </View>
        </ScrollView>

        {/* 底部导航 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentIndex === 0 ? '#8A8D93' : '#FFFFFF'}
            />
          </TouchableOpacity>

          <View style={styles.indicatorContainer}>
            {cards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentIndex === cards.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={currentIndex === cards.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={currentIndex === cards.length - 1 ? '#8A8D93' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardContainerPortrait: {
    width: width * 0.9,
    maxWidth: 600,
    alignSelf: 'center',
  },
  cardContainerLandscape: {
    width: width * 0.6,
    maxWidth: 800,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
});
