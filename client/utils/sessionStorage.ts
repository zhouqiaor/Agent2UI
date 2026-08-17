/**
 * 会话持久化工具
 * 使用 AsyncStorage 存储会话数据
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SESSIONS: 'a2idea_sessions',
  FAVORITES: 'a2idea_favorites',
  CASTING: 'a2idea_casting',
};

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Card {
  id: string;
  type: string;
  title: string;
  data: any;
  isFavorite?: boolean;
  isCasting?: boolean;
}

/**
 * 保存会话列表
 */
export const saveSessions = async (sessions: Session[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save sessions:', error);
  }
};

/**
 * 加载会话列表
 */
export const loadSessions = async (): Promise<Session[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
};

/**
 * 保存单个会话
 */
export const saveSession = async (session: Session): Promise<void> => {
  try {
    const sessions = await loadSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      sessions.push(session);
    }
    
    await saveSessions(sessions);
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

/**
 * 删除会话
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const sessions = await loadSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    await saveSessions(filtered);
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
};

/**
 * 保存收藏状态
 */
export const saveFavorites = async (favorites: Set<string>): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([...favorites]));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
};

/**
 * 加载收藏状态
 */
export const loadFavorites = async (): Promise<Set<string>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return new Set();
  }
};

/**
 * 保存投屏状态
 */
export const saveCasting = async (casting: Set<string>): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CASTING, JSON.stringify([...casting]));
  } catch (error) {
    console.error('Failed to save casting:', error);
  }
};

/**
 * 加载投屏状态
 */
export const loadCasting = async (): Promise<Set<string>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CASTING);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (error) {
    console.error('Failed to load casting:', error);
    return new Set();
  }
};

/**
 * 清除所有数据
 */
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.SESSIONS,
      STORAGE_KEYS.FAVORITES,
      STORAGE_KEYS.CASTING,
    ]);
  } catch (error) {
    console.error('Failed to clear all:', error);
  }
};
