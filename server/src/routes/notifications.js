/**
 * 实时通知 API 路由
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const provinces = require('../../data/provinces-2026.json');

// 模拟通知数据库
const notifications = new Map();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 获取用户通知列表
 *     tags: [通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, policy, price, update, system]
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const { type = 'all', unread = false } = req.query;
    const userId = req.user.id;
    
    // 获取用户通知
    let userNotifications = notifications.get(userId) || [];
    
    // 筛选
    if (type !== 'all') {
      userNotifications = userNotifications.filter(n => n.type === type);
    }
    
    if (unread) {
      userNotifications = userNotifications.filter(n => !n.read);
    }
    
    // 按时间排序
    userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: userNotifications,
      total: userNotifications.length,
      unreadCount: userNotifications.filter(n => !n.read).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/notifications/:id/read:
 *   put:
 *     summary: 标记通知为已读
 *     tags: [通知]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功
 */
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const userNotifications = notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }
    
    notification.read = true;
    notification.readAt = new Date().toISOString();
    
    notifications.set(userId, userNotifications);
    
    res.json({
      success: true,
      message: '已标记为已读'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: 标记所有通知为已读
 *     tags: [通知]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.put('/read-all', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userNotifications = notifications.get(userId) || [];
    
    userNotifications.forEach(n => {
      n.read = true;
      n.readAt = new Date().toISOString();
    });
    
    notifications.set(userId, userNotifications);
    
    res.json({
      success: true,
      message: '所有通知已标记为已读'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: 获取未读通知数量
 *     tags: [通知]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/unread-count', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userNotifications = notifications.get(userId) || [];
    const unreadCount = userNotifications.filter(n => !n.read).length;
    
    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/notifications/subscribe:
 *   post:
 *     summary: 订阅通知类型
 *     tags: [通知]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               types:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [policy, price, update, system]
 *               email:
 *                 type: boolean
 *               sms:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/subscribe', authenticateToken, (req, res) => {
  try {
    const { types, email = false, sms = false } = req.body;
    const userId = req.user.id;
    
    // 保存用户订阅偏好（实际应保存到数据库）
    const preferences = {
      userId,
      types: types || ['policy', 'price', 'update'],
      email,
      sms,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: '订阅设置已保存',
      data: preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: 发送测试通知
 *     tags: [通知]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/test', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    
    // 创建测试通知
    const testNotification = {
      id: `notif_${Date.now()}`,
      userId,
      type: 'system',
      title: '🧪 测试通知',
      content: '这是一条测试通知，用于验证通知系统是否正常工作',
      data: null,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    // 保存通知
    const userNotifications = notifications.get(userId) || [];
    userNotifications.push(testNotification);
    notifications.set(userId, userNotifications);
    
    res.json({
      success: true,
      message: '测试通知已发送',
      data: testNotification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 后台任务：检查政策变化并发送通知
function checkPolicyChanges() {
  console.log('🔍 检查政策变化...');
  
  // 模拟政策变化检测
  const changedProvinces = provinces.provinces.filter(p => Math.random() > 0.8);
  
  changedProvinces.forEach(province => {
    // 创建通知
    const notification = {
      id: `notif_${Date.now()}_${province.id}`,
      userId: 'all', // 发送给所有用户
      type: 'policy',
      title: `📢 ${province.name} 电价政策调整`,
      content: `${province.name} 燃煤基准价从 ${province.data.coalPrice} 元/kWh 调整为 ${(province.data.coalPrice * 1.05).toFixed(4)} 元/kWh，涨幅 5%`,
      data: {
        provinceId: province.id,
        provinceName: province.name,
        oldPrice: province.data.coalPrice,
        newPrice: (province.data.coalPrice * 1.05).toFixed(4),
        changePercent: 5
      },
      read: false,
      createdAt: new Date().toISOString()
    };
    
    // 发送给所有用户（简化处理，实际应按订阅筛选）
    notifications.forEach((userNotifs, userId) => {
      userNotifs.push(notification);
      notifications.set(userId, userNotifs);
    });
  });
  
  if (changedProvinces.length > 0) {
    console.log(`✅ 发送 ${changedProvinces.length} 条政策变化通知`);
  }
}

// 每小时检查一次政策变化
setInterval(checkPolicyChanges, 60 * 60 * 1000);

module.exports = router;
