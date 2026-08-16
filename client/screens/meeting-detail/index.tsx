import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { A2UIRenderer } from '@/components/a2ui/A2UIRenderer';
import { useA2UIStream } from '@/hooks/useA2UIStream';
import type { Meeting } from '@/utils/a2ui-types';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

export default function MeetingDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useSafeRouter();
  const { id } = useSafeSearchParams<{ id: string }>();
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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome6 name="chevron-left" size={18} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {meeting?.title || '会议详情'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {meeting?.organizer} · {meeting?.participants}人参与
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

      {/* A2UI Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <A2UIRenderer 
          components={components} 
          onAction={handleAction} 
          isLoading={streamLoading && components.length === 0}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
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
  loadingState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
});
