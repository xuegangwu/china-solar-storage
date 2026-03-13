/**
 * 会员和支付 API 路由
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * /api/membership/plans:
 *   get:
 *     summary: 获取会员等级列表
 *     tags: [会员]
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/plans', async (req, res) => {
  try {
    // 从数据库获取会员等级
    const plans = [
      {
        id: 1,
        name: 'free',
        name_cn: '免费会员',
        price_monthly: 0,
        price_yearly: 0,
        features: [
          '中国区基础数据',
          '每日 100 次 API 调用',
          '每月 1 份报告',
          '最多对比 2 个省份'
        ],
        limitations: [
          '无数据导出',
          '无 AI 分析',
          '无邮件支持'
        ]
      },
      {
        id: 2,
        name: 'pro',
        name_cn: '专业会员',
        price_monthly: 299,
        price_yearly: 2999,
        features: [
          '中国 + 欧洲区数据',
          '每月 1 万次 API 调用',
          '每月 10 份报告',
          '最多对比 5 个省份',
          '数据导出（CSV）',
          'AI 智能分析',
          '邮件支持'
        ],
        popular: true
      },
      {
        id: 3,
        name: 'enterprise',
        name_cn: '企业会员',
        price_monthly: 9999,
        price_yearly: 9999,
        features: [
          '全球所有区域数据',
          '每月 10 万次 API 调用',
          '无限报告生成',
          '最多对比 10 个省份/国家',
          '数据导出（CSV/Excel）',
          '高级 AI 分析',
          '专属客服',
          '电话支持',
          '定制开发',
          '私有化部署'
        ]
      }
    ];

    res.json({
      success: true,
      data: plans
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
 * /api/membership/current:
 *   get:
 *     summary: 获取当前会员信息
 *     tags: [会员]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/current', authenticateToken, async (req, res) => {
  try {
    // 查询用户会员信息
    const membership = {
      plan: 'free',
      plan_name: '免费会员',
      status: 'active',
      end_date: null,
      api_used: 0,
      api_limit: 100,
      reports_used: 0,
      reports_limit: 1
    };

    res.json({
      success: true,
      data: membership
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
 * /api/membership/upgrade:
 *   post:
 *     summary: 升级会员
 *     tags: [会员]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: integer
 *               billingCycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *               paymentMethod:
 *                 type: string
 *                 enum: [alipay, wechat, unionpay]
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const { planId, billingCycle, paymentMethod } = req.body;

    // 验证参数
    if (!planId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 获取会员等级价格
    const plans = {
      2: { monthly: 299, yearly: 2999 },
      3: { monthly: 9999, yearly: 9999 }
    };

    const price = plans[planId]?.[billingCycle || 'yearly'];
    
    if (!price) {
      return res.status(400).json({
        success: false,
        message: '无效的会员等级'
      });
    }

    // 创建订单
    const orderNo = `ORDER_${Date.now()}_${uuidv4().substring(0, 8)}`;
    const order = {
      id: uuidv4(),
      orderNo,
      userId: req.user.id,
      planId,
      amount: price,
      billingCycle,
      paymentMethod,
      status: 'pending'
    };

    // TODO: 保存订单到数据库

    // 创建支付
    let paymentResult;
    const paymentOrder = {
      orderNo,
      amount: price,
      subject: `光储投资地图会员升级 - ${billingCycle === 'yearly' ? '年付' : '月付'}`,
      ip: req.ip
    };

    if (paymentMethod === 'alipay') {
      paymentResult = await paymentService.createAlipayOrder(paymentOrder);
    } else if (paymentMethod === 'wechat') {
      paymentResult = await paymentService.createWechatOrder(paymentOrder);
    } else if (paymentMethod === 'unionpay') {
      paymentResult = await paymentService.createUnionpayOrder(paymentOrder);
    }

    res.json({
      success: true,
      message: '订单创建成功',
      data: {
        orderNo,
        amount: price,
        ...paymentResult
      }
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
 * /api/membership/orders:
 *   get:
 *     summary: 获取订单列表
 *     tags: [会员]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    // 查询用户订单
    const orders = [
      {
        orderNo: 'ORDER_1234567890',
        plan_name: '专业会员',
        amount: 2999,
        status: 'paid',
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: orders
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
 * /api/membership/invoice:
 *   post:
 *     summary: 申请发票
 *     tags: [会员]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               invoiceTitle:
 *                 type: string
 *               taxId:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/invoice', authenticateToken, async (req, res) => {
  try {
    const { orderId, invoiceTitle, taxId, email } = req.body;

    // 验证参数
    if (!orderId || !invoiceTitle || !taxId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // TODO: 创建发票申请

    res.json({
      success: true,
      message: '发票申请已提交'
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
 * /api/membership/refund:
 *   post:
 *     summary: 申请退款
 *     tags: [会员]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    // TODO: 处理退款申请

    res.json({
      success: true,
      message: '退款申请已提交'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
