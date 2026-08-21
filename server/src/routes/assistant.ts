import { Router } from 'express';
import { LLMClient } from 'coze-coding-dev-sdk';
import type { A2UIComponent } from '../types.js';

export const assistantRouter = Router();

// 创建 LLM 客户端
const llmClient = new LLMClient();

/**
 * AI 助手对话接口
 * 通过 SSE 流式返回文本和动态 UI 组件
 * 
 * POST /api/v1/assistant/chat
 * Body: { message: string, context?: string }
 */
assistantRouter.post('/chat', async (req, res) => {
  const { message, context } = req.body;

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    // 构建系统提示词
    const systemPrompt = `你是 MeetFlow AI 助手，一个专业的会议和教育场景助手。你的任务是帮助用户：
1. 创建会议议程
2. 发起实时投票
3. 生成任务列表
4. 记录会议笔记
5. 分析讨论内容

当用户请求创建 A2UI 组件时，请在文本中嵌入 JSON 格式的组件定义，格式如下：
\`\`\`a2ui
{"type": "poll", "data": {...}}
\`\`\`

支持的组件类型：
- poll: 投票组件
- agenda: 议程组件
- task_list: 任务列表
- note: 笔记组件
- qa: 问答组件

请用中文回复，保持专业、简洁、友好。`;

    // 调用大模型（流式）
    const stream = await llmClient.createChatCompletion({
      model: 'doubao-seed-2-0-pro-260215',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: context ? `${context}\n\n用户消息：${message}` : message },
      ],
      stream: true,
    });

    let fullResponse = '';

    // 流式处理响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        
        // 检查是否包含 A2UI 组件
        const a2uiMatch = content.match(/```a2ui\n([\s\S]*?)\n```/);
        if (a2uiMatch) {
          try {
            const componentData = JSON.parse(a2uiMatch[1]);
            const component: A2UIComponent = {
              id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: componentData.type,
              data: componentData.data,
              timestamp: Date.now(),
            };
            
            // 发送组件前的文本
            const textBefore = fullResponse.split('```a2ui')[0];
            if (textBefore) {
              res.write(`data: ${JSON.stringify({ type: 'text_chunk', data: textBefore })}\n\n`);
            }
            
            // 发送组件
            res.write(`data: ${JSON.stringify({ type: 'component', data: component })}\n\n`);
            
            // 重置 fullResponse
            fullResponse = '';
          } catch (e) {
            // 解析失败，继续作为文本处理
            res.write(`data: ${JSON.stringify({ type: 'text_chunk', data: content })}\n\n`);
          }
        } else {
          // 发送文本块
          res.write(`data: ${JSON.stringify({ type: 'text_chunk', data: content })}\n\n`);
        }
      }
    }

    // 发送剩余的文本
    if (fullResponse) {
      res.write(`data: ${JSON.stringify({ type: 'text_chunk', data: fullResponse })}\n\n`);
    }

    // 发送结束标记
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('LLM 调用失败:', error);
    
    // 降级到硬编码响应
    const fallbackResponse = generateFallbackResponse(message, context);
    let index = 0;
    const items = fallbackResponse.items;
    
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
  }
});

interface StreamItem {
  type: 'text_chunk' | 'component';
  data: string | A2UIComponent;
}

// 降级响应（当 LLM 调用失败时使用）
function generateFallbackResponse(message: string, _context?: string): { items: StreamItem[] } {
  const timestamp = Date.now();
  const lowerMessage = message.toLowerCase();
  
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
  
  return {
    items: [
      { type: 'text_chunk', data: '我是 MeetFlow AI 助手，可以帮你：\n\n' },
      { type: 'text_chunk', data: '• 创建会议议程\n• 发起实时投票\n• 生成任务列表\n• 记录会议笔记\n\n' },
      { type: 'text_chunk', data: '试试对我说"创建一个投票"或"生成议程"吧！' },
    ],
  };
}
