/**
 * A2UI Component Types
 * 参考 AGenUI 协议定义的组件类型
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

export interface Meeting {
  id: string;
  title: string;
  description: string;
  type: 'education' | 'meeting';
  status: 'ongoing' | 'upcoming' | 'completed';
  startTime: string;
  endTime: string;
  participants: number;
  organizer: string;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  components?: A2UIComponent[];
  timestamp: number;
}
