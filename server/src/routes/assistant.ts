import { Router } from 'express';
import type { A2UIComponent } from '../types.js';

export const assistantRouter = Router();

/**
 * AI 助手对话接口
 * 通过 SSE 流式返回文本和动态 UI 组件
 * 
 * POST /api/v1/assistant/chat
 * Body: { message: string, context?: string }
 */
assistantRouter.post('/chat', (req, res) => {
  const { message, context } = req.body;

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // 根据用户消息生成响应
  const response = generateAssistantResponse(message, context);
  
  let index = 0;
  const items = response.items;
  
  const sendNext = () => {
    if (index >= items.length) {
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const item = items[index];
    res.write(`data: ${JSON.stringify(item)}\n\n`);
    index++;
    
    setTimeout(sendNext, 200 + Math.random() * 300);
  };

  setTimeout(sendNext, 300);
});

interface StreamItem {
  type: 'text_chunk' | 'component';
  data: string | A2UIComponent;
}

function generateAssistantResponse(message: string, _context?: string): { items: StreamItem[] } {
  const timestamp = Date.now();
  const lowerMessage = message.toLowerCase();
  
  // 投票相关
  if (lowerMessage.includes('投票') || lowerMessage.includes('poll')) {
    return {
      items: [
        { type: 'text_chunk', data: '好的，我来为你创建一个投票组件。' },
        {
          type: 'component',
          data: {
            id: `ai_${timestamp}_1`,
            type: 'poll',
            data: {
              question: '你希望下次会议讨论什么主题？',
              type: 'single',
              options: [
                { id: 'opt1', text: '技术架构演进', votes: 0 },
                { id: 'opt2', text: '产品策略规划', votes: 0 },
                { id: 'opt3', text: '团队文化建设', votes: 0 },
                { id: 'opt4', text: '行业趋势分析', votes: 0 },
              ],
              totalVotes: 0,
            },
            timestamp,
          },
        },
        { type: 'text_chunk', data: '\n投票已创建，参与者可以实时投票。' },
      ],
    };
  }
  
  // 议程相关
  if (lowerMessage.includes('议程') || lowerMessage.includes('agenda')) {
    return {
      items: [
        { type: 'text_chunk', data: '我来帮你生成一个会议议程模板。' },
        {
          type: 'component',
          data: {
            id: `ai_${timestamp}_1`,
            type: 'agenda',
            data: {
              title: '建议议程',
              items: [
                { id: 'a1', text: '开场与签到 (5分钟)', completed: false },
                { id: 'a2', text: '上次会议回顾 (10分钟)', completed: false },
                { id: 'a3', text: '主要议题讨论 (30分钟)', completed: false },
                { id: 'a4', text: '行动项确认 (10分钟)', completed: false },
                { id: 'a5', text: '总结与下一步 (5分钟)', completed: false },
              ],
            },
            timestamp,
          },
        },
        { type: 'text_chunk', data: '\n这是一个标准的 60 分钟会议议程模板，你可以根据需要调整时间分配。' },
      ],
    };
  }
  
  // 任务相关
  if (lowerMessage.includes('任务') || lowerMessage.includes('task')) {
    return {
      items: [
        { type: 'text_chunk', data: '我来帮你创建任务列表。' },
        {
          type: 'component',
          data: {
            id: `ai_${timestamp}_1`,
            type: 'task_list',
            data: {
              title: '待办任务',
              tasks: [
                { id: 't1', text: '完成项目需求文档', assignee: '产品组', priority: 'high' },
                { id: 't2', text: '技术方案评审', assignee: '技术组', priority: 'high' },
                { id: 't3', text: '用户调研访谈', assignee: '设计组', priority: 'medium' },
                { id: 't4', text: '竞品分析报告', assignee: '产品组', priority: 'low' },
              ],
            },
            timestamp,
          },
        },
        { type: 'text_chunk', data: '\n任务已创建，可以分配给不同的团队成员。' },
      ],
    };
  }
  
  // 默认响应
  return {
    items: [
      { type: 'text_chunk', data: '我是 MeetFlow AI 助手，可以帮你：\n\n' },
      { type: 'text_chunk', data: '• 创建会议议程\n• 发起实时投票\n• 生成任务列表\n• 记录会议笔记\n• 分析讨论内容\n\n' },
      { type: 'text_chunk', data: '试试对我说"创建一个投票"或"生成议程"吧！' },
      {
        type: 'component',
        data: {
          id: `ai_${timestamp}_1`,
          type: 'action_button',
          data: { text: '创建投票', action: 'create_poll', variant: 'primary' },
          timestamp,
        },
      },
      {
        type: 'component',
        data: {
          id: `ai_${timestamp}_2`,
          type: 'action_button',
          data: { text: '生成议程', action: 'create_agenda', variant: 'secondary' },
          timestamp: timestamp + 1,
        },
      },
    ],
  };
}
