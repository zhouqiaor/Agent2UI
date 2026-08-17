/**
 * 平板侧边导航组件
 * 用于平板横屏时替代底部 Tab Bar
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useResponsive } from '@/hooks/useResponsive';
import { FontAwesome6 } from '@expo/vector-icons';
import { useCSSVariable } from 'uniwind';

interface SidebarNavProps {
  currentTab: 'meetings' | 'assistant' | 'profile';
}

interface NavItem {
  key: 'meetings' | 'assistant' | 'profile';
  label: string;
  icon: keyof typeof FontAwesome6.glyphMap;
  route: string;
}

const navItems: NavItem[] = [
  { key: 'meetings', label: '会议', icon: 'calendar', route: '/' },
  { key: 'assistant', label: 'AI 助手', icon: 'robot', route: '/assistant' },
  { key: 'profile', label: '我的', icon: 'user', route: '/profile' },
];

export default function SidebarNav({ currentTab }: SidebarNavProps) {
  const router = useSafeRouter();
  const { shouldUseSidebar } = useResponsive();
  const [accent, bg, text, muted] = useCSSVariable([
    '--color-accent',
    '--color-background',
    '--color-text',
    '--color-muted',
  ]) as string[];

  if (!shouldUseSidebar) return null;

  const handleNavigate = (route: string) => {
    if (route === '/') {
      router.navigate('/');
    } else {
      router.navigate(route);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg, borderRightColor: muted + '20' }]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: accent + '15' }]}>
          <FontAwesome6 name="bolt" size={20} color={accent} />
        </View>
        <Text style={[styles.logoText, { color: text }]}>MF</Text>
      </View>

      {/* Navigation Items */}
      <View style={styles.navItems}>
        {navItems.map((item) => {
          const isActive = currentTab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => handleNavigate(item.route)}
              style={[
                styles.navItem,
                isActive && { backgroundColor: accent + '15' },
              ]}
            >
              <FontAwesome6
                name={item.icon}
                size={20}
                color={isActive ? accent : muted}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: isActive ? accent : muted },
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
        <Text style={[styles.version, { color: muted }]}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  navItems: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  navItem: {
    width: 64,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomInfo: {
    alignItems: 'center',
  },
  version: {
    fontSize: 10,
  },
});
