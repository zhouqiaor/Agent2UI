/**
 * A2UI Component Types - 前端类型定义
 * 参考 AGenUI 协议
 */

export type A2UIComponentType =
  | 'text'
  | 'heading'
  | 'agenda'
  | 'poll'
  | 'qa'
  | 'note'
  | 'action_button'
  | 'divider'
  | 'task_list';

export interface A2UIComponent {
  id: string;
  type: A2UIComponentType;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface AgendaItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface QAAnswer {
  author: string;
  content: string;
  isExpert: boolean;
}

export interface Task {
  id: string;
  text: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  type: 'education' | 'meeting';
  status: 'ongoing' | 'upcoming' | 'completed';
  time: string;
  startTime: string;
  endTime: string;
  location: string;
  participants: number;
  organizer: string;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  components: A2UIComponent[];
  timestamp: number;
}
