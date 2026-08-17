import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Onboarding } from '@/components/Onboarding';
import { MeetingCardSkeleton } from '@/components/Skeleton';
import { useResponsive } from '@/hooks/useResponsive';
import type { Meeting } from '@/utils/a2ui-types';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

const statusConfig: Record<'ongoing' | 'upcoming' | 'completed', { label: string; color: string; bg: string }> = {
  ongoing: { label: '进行中', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  upcoming: { label: '即将开始', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  completed: { label: '已结束', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
};

type FilterType = 'all' | 'ongoing' | 'upcoming' | 'completed';

export default function MeetingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const { shouldUseSidebar } = useResponsive();

  useEffect(() => {
    AsyncStorage.getItem('@meetflow_onboarding_done').then((value) => {
      if (!value) {
        setShowOnboarding(true);
      }
      setOnboardingChecked(true);
    });
  }, []);

  const fetchMeetings = useCallback(async () => {
    try {
      const url =
        filter === 'all'
          ? `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/meetings`
          : `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/meetings?status=${filter}`;
      /**
       * 服务端文件：server/src/routes/meetings.ts
       * 接口：GET /api/v1/meetings
       * Query 参数：status?: 'ongoing' | 'upcoming' | 'completed'
       */
      const response = await fetch(url);
      const json = await response.json();
      if (json.success) {
        setMeetings(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      fetchMeetings();
    }, [fetchMeetings])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeetings();
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'ongoing', label: '进行中' },
    { key: 'upcoming', label: '即将开始' },
    { key: 'completed', label: '已结束' },
  ];

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  if (!onboardingChecked) {
    return null;
  }

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>MeetFlow</Text>
            <Text style={styles.subtitle}>智能会议助手</Text>
          </View>
          <Pressable
            style={styles.avatarBtn}
            onPress={() => router.push('/profile')}
          >
            <FontAwesome6 name="user" size={18} color="#4F46E5" />
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.filterChip,
                filter === f.key && styles.filterChipActive,
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.key && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View>
            <MeetingCardSkeleton />
            <MeetingCardSkeleton />
          </View>
        ) : meetings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FontAwesome6 name="calendar-plus" size={36} color="#4F46E5" />
            </View>
            <Text style={styles.emptyTitle}>暂无会议安排</Text>
            <Text style={styles.emptyDescription}>
              AI 助手可以帮你快速创建会议{'\n'}并自动生成议程和互动组件
            </Text>
            <Pressable
              style={styles.emptyPrimaryBtn}
              onPress={() => router.push('/assistant')}
            >
              <FontAwesome6 name="wand-magic-sparkles" size={14} color="#FFFFFF" />
              <Text style={styles.emptyPrimaryBtnText}>让 AI 帮我创建</Text>
            </Pressable>
            <Pressable
              style={styles.emptySecondaryBtn}
              onPress={() => router.push('/assistant')}
            >
              <Text style={styles.emptySecondaryBtnText}>手动创建会议</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.meetingGrid, shouldUseSidebar && styles.meetingGridTablet]}>
            {meetings.map((meeting) => {
              const status = statusConfig[meeting.status];
              return (
                <Pressable
                  key={meeting.id}
                  style={[styles.meetingCard, shouldUseSidebar && styles.meetingCardTablet]}
                  onPress={() => router.push('/meeting-detail', { id: meeting.id })}
                >
                <Image
                  source={{ uri: meeting.imageUrl }}
                  style={styles.cardImage}
                />
                <View style={styles.cardOverlay}>
                  <View style={styles.cardTop}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: status.color },
                        ]}
                      />
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                    <View style={styles.typeBadge}>
                      <FontAwesome6
                        name={meeting.type === 'education' ? 'graduation-cap' : 'users'}
                        size={10}
                        color="#4F46E5"
                      />
                      <Text style={styles.typeText}>
                        {meeting.type === 'education' ? '教育' : '会议'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {meeting.title}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <FontAwesome6 name="clock" size={11} color="#94A3B8" />
                      <Text style={styles.metaText}>
                        {new Date(meeting.startTime).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <FontAwesome6 name="user-group" size={11} color="#94A3B8" />
                      <Text style={styles.metaText}>{meeting.participants}人</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <FontAwesome6 name="user" size={11} color="#94A3B8" />
                      <Text style={styles.metaText}>{meeting.organizer}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8E8EB',
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  meetingGrid: {
    gap: 16,
  },
  meetingGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  meetingCard: {
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  meetingCardTablet: {
    width: '48%',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardOverlay: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(79,70,229,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptySecondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    backgroundColor: 'rgba(79,70,229,0.08)',
  },
  emptySecondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
  },
});
