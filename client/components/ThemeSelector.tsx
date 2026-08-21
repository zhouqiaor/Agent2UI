import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme, ThemeType } from '@/contexts/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { theme, themeType, setTheme, themes } = useTheme();

  const handleSelectTheme = (type: ThemeType) => {
    setTheme(type);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        style={styles.menuItem}
        onPress={() => setVisible(true)}
      >
        <View style={styles.menuIconContainer}>
          <FontAwesome6 name="palette" size={16} color={theme.colors.primary} />
        </View>
        <Text style={[styles.menuLabel, { color: theme.colors.text }]}>主题外观</Text>
        <View style={styles.menuRight}>
          <Text style={[styles.currentTheme, { color: theme.colors.textSecondary }]}>
            {theme.name}
          </Text>
          <FontAwesome6 name="chevron-right" size={14} color={theme.colors.textSecondary} />
        </View>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>选择主题</Text>
              <Pressable onPress={() => setVisible(false)}>
                <FontAwesome6 name="xmark" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            {/* Theme List */}
            <ScrollView style={styles.themeList}>
              {themes.map((t) => (
                <Pressable
                  key={t.type}
                  style={[
                    styles.themeItem,
                    {
                      backgroundColor: t.colors.background,
                      borderColor: themeType === t.type ? t.colors.primary : t.colors.border,
                      borderWidth: themeType === t.type ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleSelectTheme(t.type)}
                >
                  {/* Theme Preview */}
                  <View style={styles.themePreview}>
                    <View
                      style={[
                        styles.previewCard,
                        { backgroundColor: t.colors.surface },
                      ]}
                    >
                      <View
                        style={[
                          styles.previewDot,
                          { backgroundColor: t.colors.primary },
                        ]}
                      />
                      <View
                        style={[
                          styles.previewLine,
                          { backgroundColor: t.colors.text },
                        ]}
                      />
                      <View
                        style={[
                          styles.previewLineShort,
                          { backgroundColor: t.colors.textSecondary },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Theme Info */}
                  <View style={styles.themeInfo}>
                    <Text style={[styles.themeName, { color: t.colors.text }]}>
                      {t.name}
                    </Text>
                    <Text style={[styles.themeDesc, { color: t.colors.textSecondary }]}>
                      {getThemeDescription(t.type)}
                    </Text>
                  </View>

                  {/* Selected Indicator */}
                  {themeType === t.type && (
                    <View style={[styles.checkIcon, { backgroundColor: t.colors.primary }]}>
                      <FontAwesome6 name="check" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const getThemeDescription = (type: ThemeType): string => {
  switch (type) {
    case 'harmony':
      return '华为鸿蒙设计语言，简洁现代';
    case 'neumorphism':
      return '柔和卡片风格，新拟态设计';
    case 'aurora':
      return '极光柔和风格，梦幻渐变';
    case 'cyber':
      return '暗黑科技风格，赛博朋克';
    default:
      return '';
  }
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentTheme: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  themeList: {
    padding: 16,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  previewCard: {
    width: '100%',
    height: '100%',
    padding: 8,
    justifyContent: 'center',
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  previewLine: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
    width: '80%',
  },
  previewLineShort: {
    height: 4,
    borderRadius: 2,
    width: '60%',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDesc: {
    fontSize: 13,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
