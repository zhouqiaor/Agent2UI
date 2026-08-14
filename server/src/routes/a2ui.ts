import { Router } from 'express';
import type { A2UIComponent } from '../types.js';

export const a2uiRouter = Router();

/**
 * A2UI 协议实现
 * 参考 AGenUI 项目，通过 SSE 流式传输 UI 组件定义
 * 
 * POST /api/v1/a2ui/stream
 * Body: { meetingId: string, action: string }
 */
a2uiRouter.post('/stream', (req, res) => {
  const { meetingId, action } = req.body;

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // 根据会议 ID 生成不同的组件流
  const components = generateComponentsForMeeting(meetingId, action);
  
  let index = 0;
  
  const sendNextComponent = () => {
    if (index >= components.length) {
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    const component = components[index];
    res.write(`data: ${JSON.stringify(component)}\n\n`);
    index++;
    
    // 模拟 Agent 思考延迟
    setTimeout(sendNextComponent, 300 + Math.random() * 400);
  };

  // 开始流式发送
  setTimeout(sendNextComponent, 500);
});

/**
 * 根据会议类型和动作生成 A2UI 组件
 */
function generateComponentsForMeeting(meetingId: string, action: string): A2UIComponent[] {
  const timestamp = Date.now();
  
  // 教育场景组件
  if (meetingId === '1' || meetingId === '3' || meetingId === '5') {
    return [
      {
        id: `comp_${timestamp}_1`,
        type: 'heading',
        data: { text: 'React Native 新架构深度解析', level: 1 },
        timestamp,
      },
      {
        id: `comp_${timestamp}_2`,
        type: 'text',
        data: { text: '本次研讨将深入探讨 React Native 的新架构设计，包括 Fabric 渲染器、TurboModules 和 JSI 的核心原理。' },
        timestamp: timestamp + 100,
      },
      {
        id: `comp_${timestamp}_3`,
        type: 'divider',
        data: {},
        timestamp: timestamp + 200,
      },
      {
        id: `comp_${timestamp}_4`,
        type: 'agenda',
        data: {
          title: '今日议程',
          items: [
            { id: 'a1', text: '新架构概览与演进历程', completed: true },
            { id: 'a2', text: 'Fabric 渲染器原理', completed: true },
            { id: 'a3', text: 'TurboModules 实战', completed: false },
            { id: 'a4', text: 'JSI 与宿主通信机制', completed: false },
            { id: 'a5', text: 'Q&A 互动环节', completed: false },
          ],
        },
        timestamp: timestamp + 300,
      },
      {
        id: `comp_${timestamp}_5`,
        type: 'poll',
        data: {
          question: '你最期待哪个主题？',
          type: 'single',
          options: [
            { id: 'p1', text: 'Fabric 渲染器', votes: 12 },
            { id: 'p2', text: 'TurboModules', votes: 18 },
            { id: 'p3', text: 'JSI 通信机制', votes: 8 },
            { id: 'p4', text: '迁移最佳实践', votes: 15 },
          ],
          totalVotes: 53,
        },
        timestamp: timestamp + 400,
      },
      {
        id: `comp_${timestamp}_6`,
        type: 'note',
        data: {
          title: '关键要点',
          content: 'Fabric 渲染器采用同步渲染模式，解决了旧架构中的线程通信延迟问题。TurboModules 实现了按需加载，显著减少了启动时间。',
          tags: ['核心概念', '架构设计'],
        },
        timestamp: timestamp + 500,
      },
      {
        id: `comp_${timestamp}_7`,
        type: 'qa',
        data: {
          question: 'Fabric 渲染器与旧架构的主要区别是什么？',
          answers: [
            { author: '张教授', content: 'Fabric 采用同步渲染，消除了异步通信的延迟。', isExpert: true },
            { author: '陈工程师', content: '新架构支持了 React 的并发特性，提升了交互体验。', isExpert: false },
          ],
        },
        timestamp: timestamp + 600,
      },
      {
        id: `comp_${timestamp}_8`,
        type: 'task_list',
        data: {
          title: '课后任务',
          tasks: [
            { id: 't1', text: '阅读 Fabric 源码文档', assignee: '全体', priority: 'high' },
            { id: 't2', text: '完成 TurboModules Demo', assignee: '开发组', priority: 'medium' },
            { id: 't3', text: '撰写学习心得', assignee: '全体', priority: 'low' },
          ],
        },
        timestamp: timestamp + 700,
      },
      {
        id: `comp_${timestamp}_9`,
        type: 'action_button',
        data: { text: '加入讨论', action: 'join_discussion', variant: 'primary' },
        timestamp: timestamp + 800,
      },
    ];
  }
  
  // 会议场景组件
  return [
    {
      id: `comp_${timestamp}_1`,
      type: 'heading',
      data: { text: 'Q1 产品规划会议', level: 1 },
      timestamp,
    },
    {
      id: `comp_${timestamp}_2`,
      type: 'text',
      data: { text: '本次会议将讨论 2025 年第一季度的产品路线图、资源分配与关键里程碑。请各位积极参与讨论。' },
      timestamp: timestamp + 100,
    },
    {
      id: `comp_${timestamp}_3`,
      type: 'divider',
      data: {},
      timestamp: timestamp + 200,
    },
    {
      id: `comp_${timestamp}_4`,
      type: 'agenda',
      data: {
        title: '会议议程',
        items: [
          { id: 'a1', text: '回顾 Q4 目标完成情况', completed: true },
          { id: 'a2', text: 'Q1 核心目标讨论', completed: false },
          { id: 'a3', text: '资源分配与优先级', completed: false },
          { id: 'a4', text: '风险评估与应对策略', completed: false },
          { id: 'a5', text: '下一步行动计划', completed: false },
        ],
      },
      timestamp: timestamp + 300,
    },
    {
      id: `comp_${timestamp}_5`,
      type: 'poll',
      data: {
        question: 'Q1 最优先的产品方向是？',
        type: 'single',
        options: [
          { id: 'p1', text: '用户体验优化', votes: 5 },
          { id: 'p2', text: '新功能开发', votes: 3 },
          { id: 'p3', text: '性能与稳定性', votes: 4 },
          { id: 'p4', text: '国际化拓展', votes: 2 },
        ],
        totalVotes: 14,
      },
      timestamp: timestamp + 400,
    },
    {
      id: `comp_${timestamp}_6`,
      type: 'note',
      data: {
        title: '会议记录',
        content: 'Q4 完成率 85%，主要差距在于国际化功能延期。Q1 建议聚焦核心功能打磨，暂缓新市场拓展。',
        tags: ['决策', '规划'],
      },
      timestamp: timestamp + 500,
    },
    {
      id: `comp_${timestamp}_7`,
      type: 'task_list',
      data: {
        title: '行动项',
        tasks: [
          { id: 't1', text: '制定详细的产品路线图', assignee: '产品组', priority: 'high' },
          { id: 't2', text: '完成技术债务评估', assignee: '技术组', priority: 'high' },
          { id: 't3', text: '更新项目里程碑', assignee: 'PM', priority: 'medium' },
        ],
      },
      timestamp: timestamp + 600,
    },
    {
      id: `comp_${timestamp}_8`,
      type: 'action_button',
      data: { text: '导出会议纪要', action: 'export_minutes', variant: 'secondary' },
      timestamp: timestamp + 700,
    },
  ];
}
