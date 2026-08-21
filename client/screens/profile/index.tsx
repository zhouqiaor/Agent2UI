import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSelector } from '@/components/ThemeSelector';

const menuItems = [
  {
    section: '会议管理',
    items: [
      { icon: 'calendar-plus' as const, label: '创建会议', badge: null },
      { icon: 'calendar-check' as const, label: '我的会议', badge: '5' },
      { icon: 'clock-rotate-left' as const, label: '历史记录', badge: null },
    ],
  },
  {
    section: 'AI 功能',
    items: [
      { icon: 'wand-magic-sparkles' as const, label: 'AI 模板库', badge: 'NEW' },
      { icon: 'language' as const, label: '实时翻译', badge: null },
      { icon: 'file-lines' as const, label: '智能纪要', badge: null },
    ],
  },
  {
    section: '设置',
    items: [
      { icon: 'bell' as const, label: '通知设置', badge: null },
      { icon: 'palette' as const, label: '主题外观', badge: null },
      { icon: 'circle-info' as const, label: '关于', badge: 'v1.0' },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.profileCard}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <FontAwesome6 name="user" size={28} color="#4F46E5" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>MeetFlow 用户</Text>
              <Text style={styles.userRole}>产品经理</Text>
            </View>
            <Pressable style={styles.editBtn}>
              <FontAwesome6 name="pen" size={14} color="#4F46E5" />
            </Pressable>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>参与会议</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>组织会议</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>28</Text>
              <Text style={styles.statLabel}>完成任务</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {menuItems.map((section) => (
            <View key={section.section} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.section}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, index) => (
                  item.label === '主题外观' ? (
                    <ThemeSelector key={item.label} />
                  ) : (
                    <Pressable
                      key={item.label}
                      style={[
                        styles.menuItem,
                        index < section.items.length - 1 && styles.menuItemBorder,
                      ]}
                    >
                      <View style={styles.menuIconContainer}>
                        <FontAwesome6 name={item.icon} size={16} color="#4F46E5" />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.badge && (
                        <View
                          style={[
                            styles.badge,
                            item.badge === 'NEW' && styles.badgeNew,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              item.badge === 'NEW' && styles.badgeTextNew,
                            ]}
                          >
                            {item.badge}
                          </Text>
                        </View>
                      )}
                      <FontAwesome6 name="chevron-right" size={12} color="#CBD5E1" />
                    </Pressable>
                  )
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* A2UI Protocol Info */}
        <View style={styles.protocolCard}>
          <View style={styles.protocolHeader}>
            <FontAwesome6 name="microchip" size={16} color="#4F46E5" />
            <Text style={styles.protocolTitle}>A2UI Protocol</Text>
          </View>
          <Text style={styles.protocolDesc}>
            本应用基于 A2UI (Agent-to-UI) 协议构建，参考 AGenUI 项目标准。AI Agent
            通过 SSE 流式传输动态生成可交互的 UI 组件，实现真正的 AI
            驱动界面。
          </Text>
          <View style={styles.protocolTags}>
            <View style={styles.protocolTag}>
              <Text style={styles.protocolTagText}>SSE Streaming</Text>
            </View>
            <View style={styles.protocolTag}>
              <Text style={styles.protocolTagText}>Dynamic UI</Text>
            </View>
            <View style={styles.protocolTag}>
              <Text style={styles.protocolTagText}>Real-time</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F0F0F3',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarOuter: {
    padding: 3,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(79,70,229,0.2)',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  userRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(79,70,229,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F0F0F3',
    borderRadius: 18,
    paddingVertical: 16,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#F0F0F3',
    borderRadius: 18,
    paddingVertical: 4,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  menuIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(79,70,229,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    marginLeft: 12,
  },
  badge: {
    backgroundColor: 'rgba(79,70,229,0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  badgeNew: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  badgeTextNew: {
    color: '#EF4444',
  },
  protocolCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: 'rgba(79,70,229,0.04)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.1)',
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  protocolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  protocolDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  protocolTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  protocolTag: {
    backgroundColor: 'rgba(79,70,229,0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  protocolTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
});
