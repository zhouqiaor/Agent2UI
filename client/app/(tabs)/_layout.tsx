import { Tabs } from 'expo-router';
import { Platform, View, useWindowDimensions } from 'react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import SidebarNav from '@/components/SidebarNav';
import { useResponsive } from '@/hooks/useResponsive';

// Shared tab bar configuration
const tabScreens = [
  { name: 'index', title: '会议', icon: 'calendar-days' },
  { name: 'assistant', title: 'AI 助手', icon: 'robot' },
  { name: 'profile', title: '我的', icon: 'user' },
] as const;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { shouldUseSidebar } = useResponsive();

  // Phone: standard bottom tab bar
  const phoneTabBarStyle = {
    backgroundColor: '#F0F0F3',
    borderTopWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    height: 60 + insets.bottom,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  };

  // Tablet landscape: hide bottom tab bar (we use sidebar)
  const tabletTabBarStyle = {
    ...phoneTabBarStyle,
    height: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 0,
    borderTopWidth: 0,
    display: 'none' as const,
  };

  const tabBarStyle = shouldUseSidebar ? tabletTabBarStyle : phoneTabBarStyle;

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {shouldUseSidebar && <SidebarNav />}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: Platform.OS === 'web' && !shouldUseSidebar
              ? { ...tabBarStyle, height: 'auto' as unknown as number }
              : tabBarStyle,
            tabBarActiveTintColor: '#4F46E5',
            tabBarInactiveTintColor: '#94A3B8',
            tabBarLabelStyle: styles.tabLabel,
            tabBarShowLabel: !shouldUseSidebar,
          }}
        >
          {tabScreens.map((screen) => (
            <Tabs.Screen
              key={screen.name}
              name={screen.name}
              options={{
                title: screen.title,
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome6 name={screen.icon as any} size={size} color={color} />
                ),
              }}
            />
          ))}
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
