import React, { useState, useCallback } from 'react';
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
import type { Meeting } from '@/utils/a2ui-types';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

const statusConfig = {
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
          <View style={styles.emptyState}>
            <FontAwesome6 name="spinner" size={24} color="#94A3B8" />
            <Text style={styles.emptyText}>加载中...</Text>
          </View>
        ) : meetings.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome6 name="calendar-xmark" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>暂无会议</Text>
          </View>
        ) : (
          meetings.map((meeting) => {
            const status = statusConfig[meeting.status];
            return (
              <Pressable
                key={meeting.id}
                style={styles.meetingCard}
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
          })
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
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
