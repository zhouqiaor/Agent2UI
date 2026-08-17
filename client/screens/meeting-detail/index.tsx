import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { A2UIRenderer } from '@/components/a2ui/A2UIRenderer';
import { useA2UIStream } from '@/hooks/useA2UIStream';
import { useResponsive } from '@/hooks/useResponsive';
import type { Meeting, A2UIComponent } from '@/utils/a2ui-types';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

// Interaction-related components shown in the right column on tablet
const INTERACTION_TYPES = new Set(['poll', 'qa', 'task_list', 'action_button']);
const INFO_TYPES = new Set(['heading', 'text', 'agenda', 'note', 'divider']);

export default function MeetingDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const { id } = useSafeSearchParams<{ id: string }>();
  const { shouldUseTwoColumn, isTablet } = useResponsive();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);

  const { components, isLoading: streamLoading, startStream } = useA2UIStream();

  React.useEffect(() => {
    const fetchMeeting = async () => {
      if (!id) return;
      try {
        /**
         * 服务端文件：server/src/routes/meetings.ts
         * 接口：GET /api/v1/meetings/:id
         * Path 参数：id: string
         */
        const response = await fetch(
          `${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/meetings/${id}`
        );
        const json = await response.json();
        if (json.success) {
          setMeeting(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch meeting:', error);
      } finally {
        setLoadingMeeting(false);
      }
    };
    fetchMeeting();
  }, [id]);

  // 自动加载 A2UI 组件流
  React.useEffect(() => {
    if (id && !streamLoading && components.length === 0) {
      /**
       * 服务端文件：server/src/routes/a2ui.ts
       * 接口：POST /api/v1/a2ui/stream
       * Body 参数：meetingId: string, action: string
       */
      startStream('/api/v1/a2ui/stream', {
        meetingId: id,
        action: 'load',
      });
    }
  }, [id, streamLoading, components.length, startStream]);

  const handleAction = useCallback(
    (action: string, _data: Record<string, unknown>) => {
      console.log('Action triggered:', action);
    },
    []
  );

  // Split components into info and interaction columns for tablet landscape
  const { infoComponents, interactionComponents } = useMemo(() => {
    if (!shouldUseTwoColumn) {
      return { infoComponents: components, interactionComponents: [] as A2UIComponent[] };
    }
    const info: A2UIComponent[] = [];
    const interaction: A2UIComponent[] = [];
    components.forEach((c) => {
      if (INTERACTION_TYPES.has(c.type)) {
        interaction.push(c);
      } else if (INFO_TYPES.has(c.type) || interaction.length === 0) {
        info.push(c);
      } else {
        interaction.push(c);
      }
    });
    return { infoComponents: info, interactionComponents: interaction };
  }, [components, shouldUseTwoColumn]);

  if (loadingMeeting) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (isTablet ? 16 : 8) }]}>
        {!isTablet && (
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome6 name="chevron-left" size={18} color="#1E293B" />
          </Pressable>
        )}
        {isTablet && (
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={18} color="#1E293B" />
          </Pressable>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {meeting?.title || '会议详情'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {meeting?.organizer} · {meeting?.participants}人参与 · {meeting?.location}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {streamLoading && (
            <View style={styles.streamingIndicator}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={styles.streamingText}>AI 生成中</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tablet landscape: two-column layout */}
      {shouldUseTwoColumn ? (
        <View style={styles.twoColumnContainer}>
          {/* Left: info / agenda / notes */}
          <ScrollView
            style={styles.leftColumn}
            contentContainerStyle={styles.twoColumnContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Meeting info card */}
            {meeting && (
              <View style={styles.meetingInfoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <FontAwesome6 name="clock" size={14} color="#4F46E5" />
                  </View>
                  <Text style={styles.infoText}>{meeting.time}</Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <FontAwesome6 name="location-dot" size={14} color="#4F46E5" />
                  </View>
                  <Text style={styles.infoText}>{meeting.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(meeting.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(meeting.status) }]}>
                      {getStatusLabel(meeting.status)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <A2UIRenderer 
              components={infoComponents} 
              onAction={handleAction}
              isLoading={streamLoading && infoComponents.length === 0}
            />
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Right: interactions (polls, QA, tasks) */}
          <ScrollView
            style={styles.rightColumn}
            contentContainerStyle={styles.twoColumnContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.rightColumnHeader}>
              <FontAwesome6 name="comments" size={16} color="#4F46E5" />
              <Text style={styles.rightColumnTitle}>实时互动</Text>
            </View>
            <A2UIRenderer 
              components={interactionComponents} 
              onAction={handleAction}
              isLoading={streamLoading && interactionComponents.length === 0 && infoComponents.length > 0}
            />
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      ) : (
        /* Phone / portrait: single column */
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Meeting info card (mobile) */}
          {meeting && (
            <View style={styles.meetingInfoCardMobile}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FontAwesome6 name="clock" size={14} color="#4F46E5" />
                </View>
                <Text style={styles.infoText}>{meeting.time}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FontAwesome6 name="location-dot" size={14} color="#4F46E5" />
                </View>
                <Text style={styles.infoText}>{meeting.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(meeting.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(meeting.status) }]}>
                    {getStatusLabel(meeting.status)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <A2UIRenderer 
            components={components} 
            onAction={handleAction} 
            isLoading={streamLoading && components.length === 0}
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </Screen>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'live': return '#10B981';
    case 'upcoming': return '#4F46E5';
    case 'ended': return '#94A3B8';
    default: return '#94A3B8';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'live': return '进行中';
    case 'upcoming': return '即将开始';
    case 'ended': return '已结束';
    default: return status;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F0F0F3',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8E8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 8,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(79,70,229,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streamingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // Two-column layout (tablet landscape)
  twoColumnContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 3,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(148,163,184,0.2)',
  },
  rightColumn: {
    flex: 2,
    backgroundColor: 'rgba(79,70,229,0.02)',
  },
  twoColumnContent: {
    padding: 24,
  },
  rightColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79,70,229,0.1)',
  },
  rightColumnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  // Meeting info cards
  meetingInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0 4px 12px rgba(79,70,229,0.08)' },
    }),
  },
  meetingInfoCardMobile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(79,70,229,0.06)' },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(79,70,229,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
