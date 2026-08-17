/**
 * 性能优化工具
 * 包含懒加载、缓存、虚拟滚动等功能
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 缓存管理器
 * 提供内存缓存和本地存储缓存
 */
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分钟

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * 设置缓存
   */
  async set(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // 内存缓存
    this.memoryCache.set(key, cacheData);

    // 本地存储缓存
    try {
      await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save to AsyncStorage:', error);
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    // 先检查内存缓存
    const memoryData = this.memoryCache.get(key);
    if (memoryData) {
      if (Date.now() - memoryData.timestamp < memoryData.ttl) {
        return memoryData.data as T;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // 再检查本地存储缓存
    try {
      const storageData = await AsyncStorage.getItem(`cache:${key}`);
      if (storageData) {
        const parsed = JSON.parse(storageData);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          this.memoryCache.set(key, parsed);
          return parsed.data as T;
        } else {
          await AsyncStorage.removeItem(`cache:${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to read from AsyncStorage:', error);
    }

    return null;
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(`cache:${key}`);
    } catch (error) {
      console.warn('Failed to delete from AsyncStorage:', error);
    }
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear AsyncStorage:', error);
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanup(): Promise<void> {
    const now = Date.now();

    // 清理内存缓存
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp >= value.ttl) {
        this.memoryCache.delete(key);
      }
    }

    // 清理本地存储缓存
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('cache:'));
      const items = await AsyncStorage.multiGet(cacheKeys);

      const expiredKeys: string[] = [];
      for (const [key, value] of items) {
        if (value) {
          const parsed = JSON.parse(value);
          if (now - parsed.timestamp >= parsed.ttl) {
            expiredKeys.push(key);
          }
        }
      }

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
      }
    } catch (error) {
      console.warn('Failed to cleanup AsyncStorage:', error);
    }
  }
}

/**
 * 懒加载 Hook
 * 支持分页加载和无限滚动
 */
export function useLazyLoad<T>(
  fetchFn: (page: number, pageSize: number) => Promise<T[]>,
  pageSize: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newData = await fetchFn(page, pageSize);
      if (newData.length < pageSize) {
        setHasMore(false);
      }
      setData((prev) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, pageSize, loading, hasMore]);

  const refresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    setData([]);
    setLoading(true);
    setError(null);

    try {
      const newData = await fetchFn(1, pageSize);
      if (newData.length < pageSize) {
        setHasMore(false);
      }
      setData(newData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pageSize]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
}

/**
 * 虚拟滚动列表组件
 * 支持大量数据的高效渲染
 */
interface VirtualListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  itemHeight: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
}

export function VirtualList<T>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
}: VirtualListProps<T>) {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={(data, index) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      })}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      contentContainerStyle={styles.listContent}
    />
  );
}

/**
 * 防抖 Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 节流 Hook
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastExecuted.current + interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = now;
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * 记忆化 Hook
 * 用于优化计算密集型操作
 */
export function useMemoized<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, { start: number; end?: number; duration?: number }> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 开始计时
   */
  start(label: string): void {
    this.metrics.set(label, { start: Date.now() });
  }

  /**
   * 结束计时
   */
  end(label: string): number | undefined {
    const metric = this.metrics.get(label);
    if (metric) {
      metric.end = Date.now();
      metric.duration = metric.end - metric.start;
      return metric.duration;
    }
    return undefined;
  }

  /**
   * 获取性能指标
   */
  getMetrics(): Record<string, number | undefined> {
    const result: Record<string, number | undefined> = {};
    for (const [label, metric] of this.metrics.entries()) {
      result[label] = metric.duration;
    }
    return result;
  }

  /**
   * 清空指标
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * 打印性能报告
   */
  report(): void {
    console.log('=== Performance Report ===');
    for (const [label, metric] of this.metrics.entries()) {
      console.log(`${label}: ${metric.duration}ms`);
    }
    console.log('=========================');
  }
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
});
