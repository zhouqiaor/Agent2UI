/**
 * 响应式布局 Hook
 * 用于检测屏幕尺寸和方向，提供平板适配支持
 */
import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type ScreenSize = 'small' | 'medium' | 'large' | 'extra-large';
export type Orientation = 'portrait' | 'landscape';

export interface ResponsiveState {
  /** 屏幕宽度 */
  width: number;
  /** 屏幕高度 */
  height: number;
  /** 屏幕尺寸分类 */
  size: ScreenSize;
  /** 屏幕方向 */
  orientation: Orientation;
  /** 是否为平板设备 */
  isTablet: boolean;
  /** 是否为横屏 */
  isLandscape: boolean;
  /** 是否应该使用双栏布局 */
  shouldUseTwoColumn: boolean;
  /** 是否应该使用侧边导航 */
  shouldUseSidebar: boolean;
}

/**
 * 根据宽度判断屏幕尺寸
 */
function getScreenSize(width: number): ScreenSize {
  if (width < 640) return 'small';
  if (width < 1024) return 'medium';
  if (width < 1440) return 'large';
  return 'extra-large';
}

/**
 * 判断是否为平板设备
 * 基于屏幕尺寸和像素密度
 */
function getIsTablet(width: number, height: number): boolean {
  // 平板通常最短边 >= 600px
  const minDimension = Math.min(width, height);
  return minDimension >= 600;
}

/**
 * 响应式布局 Hook
 */
export function useResponsive(): ResponsiveState {
  const [dimensions, setDimensions] = useState(() => ({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  }));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const size = getScreenSize(width);
  const orientation: Orientation = width > height ? 'landscape' : 'portrait';
  const isTablet = getIsTablet(width, height);
  const isLandscape = orientation === 'landscape';

  // 平板横屏时使用双栏布局
  const shouldUseTwoColumn = isTablet && isLandscape && width >= 1024;

  // 平板设备使用侧边导航
  const shouldUseSidebar = isTablet && width >= 768;

  return {
    width,
    height,
    size,
    orientation,
    isTablet,
    isLandscape,
    shouldUseTwoColumn,
    shouldUseSidebar,
  };
}

/**
 * 响应式布局断点
 */
export const breakpoints = {
  small: 0,
  medium: 640,
  large: 1024,
  extraLarge: 1440,
};

/**
 * 响应式样式辅助函数
 */
export function responsive<T>(
  value: { small?: T; medium?: T; large?: T; extraLarge?: T },
  size: ScreenSize
): T | undefined {
  const order: ScreenSize[] = ['small', 'medium', 'large', 'extra-large'];
  const sizeToKey: Record<ScreenSize, keyof typeof value> = {
    small: 'small',
    medium: 'medium',
    large: 'large',
    'extra-large': 'extraLarge',
  };
  const currentIndex = order.indexOf(size);

  // 从当前尺寸向下查找最近的有值尺寸
  for (let i = currentIndex; i >= 0; i--) {
    const key = sizeToKey[order[i]];
    const v = value[key];
    if (v !== undefined) return v;
  }

  return undefined;
}
