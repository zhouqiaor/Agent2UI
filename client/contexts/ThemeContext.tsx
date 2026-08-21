import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 主题类型
export type ThemeType = 'harmony' | 'neumorphism' | 'aurora' | 'cyber';

// 主题配置接口
export interface ThemeConfig {
  name: string;
  type: ThemeType;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
      '3xl': number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// 鸿蒙设计风格
const harmonyTheme: ThemeConfig = {
  name: '鸿蒙设计',
  type: 'harmony',
  colors: {
    primary: '#007DFF',        // 华为蓝
    primaryLight: '#3D9BFF',
    primaryDark: '#0066CC',
    secondary: '#FF6B35',      // 活力橙
    background: '#F5F5F5',     // 浅灰背景
    surface: '#FFFFFF',        // 白色卡片
    text: '#1A1A1A',           // 深色文字
    textSecondary: '#666666',  // 次要文字
    border: '#E0E0E0',         // 边框
    success: '#00C853',        // 成功绿
    warning: '#FFB300',        // 警告黄
    error: '#FF3B30',          // 错误红
  },
  typography: {
    fontFamily: 'HarmonyOS Sans',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
};

// 柔和卡片风格（Neumorphism）
const neumorphismTheme: ThemeConfig = {
  name: '柔和卡片',
  type: 'neumorphism',
  colors: {
    primary: '#4F46E5',        // Indigo
    primaryLight: '#6366F1',
    primaryDark: '#4338CA',
    secondary: '#F59E0B',      // Amber
    background: '#F0F0F3',     // 暖灰白
    surface: '#F0F0F3',        // 同色卡片
    text: '#1E293B',           // Slate-800
    textSecondary: '#64748B',  // Slate-500
    border: '#E8E8EB',         // 凹陷面
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    fontFamily: 'System',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(79,70,229,0.1), 0 2px 4px rgba(0,0,0,0.06)',
    lg: '0 10px 15px rgba(79,70,229,0.15), 0 4px 6px rgba(0,0,0,0.05)',
  },
};

// 极光柔和风格（Aurora）
const auroraTheme: ThemeConfig = {
  name: '极光柔和',
  type: 'aurora',
  colors: {
    primary: '#A855F7',        // 紫色
    primaryLight: '#C084FC',
    primaryDark: '#7E22CE',
    secondary: '#06B6D4',      // 青色
    background: '#0D1026',     // 深空暗底
    surface: 'rgba(255,255,255,0.05)', // 毛玻璃
    text: '#FFFFFF',           // 白色文字
    textSecondary: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.1)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    fontFamily: 'System',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    full: 999,
  },
  shadows: {
    sm: '0 2px 8px rgba(168,85,247,0.2)',
    md: '0 4px 16px rgba(168,85,247,0.3)',
    lg: '0 8px 32px rgba(168,85,247,0.4)',
  },
};

// 暗黑科技风格（Cyber Tech）
const cyberTheme: ThemeConfig = {
  name: '暗黑科技',
  type: 'cyber',
  colors: {
    primary: '#00F0FF',        // 电光青
    primaryLight: '#4DFFFF',
    primaryDark: '#00C4CC',
    secondary: '#BF00FF',      // 霓虹紫
    background: '#0A0A0F',     // 纯黑底
    surface: '#1A1A1F',        // 深灰卡片
    text: '#FFFFFF',           // 白色文字
    textSecondary: 'rgba(255,255,255,0.6)',
    border: '#2A2A2F',         // 深灰边框
    success: '#00FF88',        // 霓虹绿
    warning: '#FFD700',        // 霓虹黄
    error: '#FF0055',          // 霓虹红
  },
  typography: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12,
    full: 999,
  },
  shadows: {
    sm: '0 0 10px rgba(0,240,255,0.3)',
    md: '0 0 20px rgba(0,240,255,0.4)',
    lg: '0 0 40px rgba(0,240,255,0.5)',
  },
};

// 主题映射
const themes: Record<ThemeType, ThemeConfig> = {
  harmony: harmonyTheme,
  neumorphism: neumorphismTheme,
  aurora: auroraTheme,
  cyber: cyberTheme,
};

// Context 接口
interface ThemeContextType {
  theme: ThemeConfig;
  themeType: ThemeType;
  setTheme: (type: ThemeType) => void;
  themes: ThemeConfig[];
}

// 创建 Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider 组件
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('harmony');

  // 从 AsyncStorage 加载主题
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && themes[savedTheme as ThemeType]) {
          setThemeType(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    loadTheme();
  }, []);

  // 保存主题到 AsyncStorage
  const setTheme = async (type: ThemeType) => {
    try {
      await AsyncStorage.setItem('theme', type);
      setThemeType(type);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const theme = themes[themeType];

  return (
    <ThemeContext.Provider value={{ theme, themeType, setTheme, themes: Object.values(themes) }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
