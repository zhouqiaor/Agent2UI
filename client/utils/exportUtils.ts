/**
 * 导出工具
 * 支持导出为 Markdown 格式
 */

import { Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export interface ExportData {
  title: string;
  messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  cards?: Array<{
    type: string;
    title: string;
    data: any;
  }>;
}

/**
 * 导出为 Markdown 格式
 */
export const exportToMarkdown = async (data: ExportData): Promise<string> => {
  let markdown = `# ${data.title}\n\n`;
  markdown += `导出时间：${new Date().toLocaleString('zh-CN')}\n\n`;
  markdown += `---\n\n`;

  // 导出消息
  if (data.messages && data.messages.length > 0) {
    markdown += `## 对话记录\n\n`;
    data.messages.forEach((msg) => {
      const role = msg.role === 'user' ? '👤 用户' : '🤖 AI';
      markdown += `### ${role}\n\n`;
      markdown += `${msg.content}\n\n`;
      markdown += `*${new Date(msg.timestamp).toLocaleString('zh-CN')}*\n\n`;
      markdown += `---\n\n`;
    });
  }

  // 导出卡片
  if (data.cards && data.cards.length > 0) {
    markdown += `## 卡片内容\n\n`;
    data.cards.forEach((card, index) => {
      markdown += `### ${index + 1}. ${card.title}\n\n`;
      markdown += `**类型**：${card.type}\n\n`;

      // 根据卡片类型导出内容
      switch (card.type) {
        case 'agenda':
          if (card.data.items) {
            markdown += `**议程项**：\n\n`;
            card.data.items.forEach((item: any, i: number) => {
              markdown += `${i + 1}. ${item.title}${item.time ? ` (${item.time})` : ''}${item.completed ? ' ✅' : ''}\n`;
            });
            markdown += `\n`;
          }
          break;

        case 'poll':
          if (card.data.options) {
            markdown += `**投票选项**：\n\n`;
            card.data.options.forEach((opt: any) => {
              markdown += `- ${opt.text}: ${opt.votes || 0} 票\n`;
            });
            markdown += `\n`;
          }
          break;

        case 'note':
          if (card.data.content) {
            markdown += `${card.data.content}\n\n`;
          }
          if (card.data.tags && card.data.tags.length > 0) {
            markdown += `**标签**：${card.data.tags.join(', ')}\n\n`;
          }
          break;

        case 'qa':
          if (card.data.items) {
            markdown += `**问答**：\n\n`;
            card.data.items.forEach((item: any, i: number) => {
              markdown += `**Q${i + 1}**: ${item.question}\n\n`;
              markdown += `**A**: ${item.answer}\n\n`;
            });
          }
          break;

        case 'task':
          if (card.data.items) {
            markdown += `**任务列表**：\n\n`;
            card.data.items.forEach((item: any, i: number) => {
              markdown += `- [${item.completed ? 'x' : ' '}] ${item.title}`;
              if (item.assignee) markdown += ` (负责人: ${item.assignee})`;
              if (item.deadline) markdown += ` (截止: ${item.deadline})`;
              markdown += `\n`;
            });
            markdown += `\n`;
          }
          break;

        default:
          markdown += `**数据**：\n\n\`\`\`json\n${JSON.stringify(card.data, null, 2)}\n\`\`\`\n\n`;
      }

      markdown += `---\n\n`;
    });
  }

  return markdown;
};

/**
 * 保存 Markdown 到文件
 */
export const saveMarkdownToFile = async (markdown: string, filename: string): Promise<string> => {
  try {
    const fileUri = `${FileSystem.documentDirectory}${filename}.md`;
    await (FileSystem as any).writeAsStringAsync(fileUri, markdown, {
      encoding: (FileSystem as any).EncodingType.UTF8,
    });
    return fileUri;
  } catch (error) {
    console.error('Failed to save markdown:', error);
    throw error;
  }
};

/**
 * 分享文件
 */
export const shareFile = async (fileUri: string, title: string): Promise<void> => {
  try {
    await Share.share({
      url: Platform.OS === 'ios' ? fileUri : undefined,
      message: Platform.OS === 'android' ? fileUri : undefined,
      title,
    });
  } catch (error) {
    console.error('Failed to share file:', error);
    throw error;
  }
};

/**
 * 导出并分享
 */
export const exportAndShare = async (data: ExportData): Promise<void> => {
  try {
    const markdown = await exportToMarkdown(data);
    const filename = `${data.title}_${new Date().getTime()}`;
    const fileUri = await saveMarkdownToFile(markdown, filename);
    await shareFile(fileUri, data.title);
  } catch (error) {
    console.error('Failed to export and share:', error);
    throw error;
  }
};
