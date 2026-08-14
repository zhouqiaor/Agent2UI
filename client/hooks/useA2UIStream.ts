import { useState, useCallback, useRef } from 'react';
import SSE from 'react-native-sse';
import type { A2UIComponent } from '@/utils/a2ui-types';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

interface UseA2UIStreamOptions {
  onComponent?: (component: A2UIComponent) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useA2UIStream(options: UseA2UIStreamOptions = {}) {
  const [components, setComponents] = useState<A2UIComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const sseRef = useRef<SSE | null>(null);

  const startStream = useCallback(
    (endpoint: string, body: Record<string, unknown>) => {
      // 重置状态
      setComponents([]);
      setIsLoading(true);
      setError(null);

      // 关闭之前的连接
      if (sseRef.current) {
        sseRef.current.close();
      }

      const url = `${EXPO_PUBLIC_BACKEND_BASE_URL}${endpoint}`;

      const sse = new SSE(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      sseRef.current = sse;

      sse.addEventListener('message', (event) => {
        if (event.data === '[DONE]') {
          setIsLoading(false);
          sse.close();
          options.onComplete?.();
          return;
        }

        try {
          const component = JSON.parse(event.data as string) as A2UIComponent;
          setComponents((prev) => [...prev, component]);
          options.onComponent?.(component);
        } catch (e) {
          console.warn('Failed to parse A2UI component:', e);
        }
      });

      sse.addEventListener('error', (event) => {
        const err = new Error(
          'message' in event ? event.message || 'SSE connection error' : 'SSE connection error'
        );
        setError(err);
        setIsLoading(false);
        options.onError?.(err);
      });
    },
    [options]
  );

  const stopStream = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    setComponents([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    components,
    isLoading,
    error,
    startStream,
    stopStream,
    reset,
  };
}
