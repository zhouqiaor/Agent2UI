import { Router } from 'express';
import { meetingsData } from '../data.js';

export const meetingsRouter = Router();

// GET /api/v1/meetings - 获取会议列表
// Query 参数：status?: 'ongoing' | 'upcoming' | 'completed'
meetingsRouter.get('/', (req, res) => {
  const { status } = req.query;
  
  let filtered = meetingsData;
  if (status && typeof status === 'string') {
    filtered = meetingsData.filter(m => m.status === status);
  }
  
  res.json({
    success: true,
    data: filtered,
  });
});

// GET /api/v1/meetings/:id - 获取会议详情
// Path 参数：id: string
meetingsRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const meeting = meetingsData.find(m => m.id === id);
  
  if (!meeting) {
    res.status(404).json({
      success: false,
      message: 'Meeting not found',
    });
    return;
  }
  
  res.json({
    success: true,
    data: meeting,
  });
});
