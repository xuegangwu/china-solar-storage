/**
 * 省份数据 API 路由
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// 模拟数据库（后续替换为真实数据库）
const provinces = require('../../data/provinces-2026.json');

/**
 * @swagger
 * /api/provinces:
 *   get:
 *     summary: 获取所有省份列表
 *     tags: [省份]
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    res.json({
      success: true,
      data: provinces.provinces,
      total: provinces.provinces.length,
      version: provinces.version
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
 * /api/provinces/:id:
 *   get:
 *     summary: 获取省份详情
 *     tags: [省份]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const province = provinces.provinces.find(p => p.id === parseInt(req.params.id));
    
    if (!province) {
      return res.status(404).json({
        success: false,
        message: '省份不存在'
      });
    }
    
    res.json({
      success: true,
      data: province
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
 * /api/provinces/search:
 *   get:
 *     summary: 搜索省份
 *     tags: [省份]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/search', optionalAuth, (req, res) => {
  try {
    const { q, grade, minScore } = req.query;
    
    let results = provinces.provinces;
    
    // 关键词搜索
    if (q) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.capital.toLowerCase().includes(q.toLowerCase())
      );
    }
    
    // 等级筛选
    if (grade) {
      results = results.filter(p => p.grade === grade.toUpperCase());
    }
    
    // 最低分数筛选
    if (minScore) {
      results = results.filter(p => p.scores.total >= parseFloat(minScore));
    }
    
    res.json({
      success: true,
      data: results,
      total: results.length
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
 * /api/provinces/:id/history:
 *   get:
 *     summary: 获取省份历史数据
 *     tags: [省份]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/:id/history', optionalAuth, (req, res) => {
  try {
    const province = provinces.provinces.find(p => p.id === parseInt(req.params.id));
    
    if (!province) {
      return res.status(404).json({
        success: false,
        message: '省份不存在'
      });
    }
    
    res.json({
      success: true,
      data: province.history
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
 * /api/provinces/rankings:
 *   get:
 *     summary: 获取省份排名
 *     tags: [省份]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/rankings', optionalAuth, (req, res) => {
  try {
    const { year } = req.query;
    
    let sorted = [...provinces.provinces].sort((a, b) => b.scores.total - a.scores.total);
    
    // 添加排名
    sorted = sorted.map((p, index) => ({
      ...p,
      rank: index + 1
    }));
    
    res.json({
      success: true,
      data: sorted,
      year: year || new Date().getFullYear()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
