/**
 * 平板侧边导航组件
 * 用于平板横屏时替代底部 Tab Bar
 * 使用 usePathname 自动检测当前路由，无需传入 currentTab
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useResponsive } from '@/hooks/useResponsive';
import { FontAwesome6 } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useCSSVariable } from 'uniwind';

interface NavItem {
  key: 'meetings' | 'assistant' | 'profile';
  label: string;
  icon: keyof typeof FontAwesome6.glyphMap;
  route: string;
  matchPaths: string[];
}

const navItems: NavItem[] = [
  {
    key: 'meetings',
    label: '会议',
    icon: 'calendar-days',
    route: '/',
    matchPaths: ['/', '/meeting-detail'],
  },
  {
    key: 'assistant',
    label: 'AI 助手',
    icon: 'robot',
    route: '/assistant',
    matchPaths: ['/assistant'],
  },
  {
    key: 'profile',
    label: '我的',
    icon: 'user',
    route: '/profile',
    matchPaths: ['/profile'],
  },
];

export default function SidebarNav() {
  const router = useSafeRouter();
  const pathname = usePathname();
  const { shouldUseSidebar } = useResponsive();
  const [accent, bg, text, muted] = useCSSVariable([
    '--color-accent',
    '--color-background',
    '--color-text',
    '--color-muted',
  ]) as string[];

  if (!shouldUseSidebar) return null;

  const isActive = (item: NavItem) => {
    return item.matchPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  };

  return (
    <View style={[styles.container, { backgroundColor: bg, borderRightColor: muted + '20' }]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: accent + '15' }]}>
          <FontAwesome6 name="bolt" size={22} color={accent} />
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.navItems}>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Pressable
              key={item.key}
              onPress={() => router.navigate(item.route)}
              style={[
                styles.navItem,
                active && { backgroundColor: accent + '12' },
              ]}
            >
              <View style={active ? [styles.activeIndicator, { backgroundColor: accent }] : null}>
                <FontAwesome6
                  name={item.icon}
                  size={20}
                  color={active ? accent : muted}
                />
              </View>
              <Text
                style={[
                  styles.navLabel,
                  { color: active ? accent : muted },
                  active && { fontWeight: '700' },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={[styles.versionDot, { backgroundColor: '#10B981' }]} />
        <Text style={[styles.version, { color: muted }]}>在线</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 84,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItems: {
    flex: 1,
    gap: 8,
    alignItems: 'center',
    paddingTop: 12,
  },
  navItem: {
    width: 64,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  versionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  version: {
    fontSize: 11,
    fontWeight: '500',
  },
});
