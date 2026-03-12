/**
 * 统计路由
 */

const express = require('express');
const { getDatabase } = require('../utils/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取统计数据
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    
    // 用户统计
    const userResult = db.exec(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as users,
        SUM(CASE WHEN role = 'viewer' THEN 1 ELSE 0 END) as viewers
      FROM users
    `);
    const userStats = userResult[0] ? { 
      total: userResult[0].values[0][0], 
      admins: userResult[0].values[0][1], 
      users: userResult[0].values[0][2], 
      viewers: userResult[0].values[0][3] 
    } : { total: 0, admins: 0, users: 0, viewers: 0 };
    
    // 省份统计
    const provinceResult = db.exec(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN grade = 'B' THEN 1 ELSE 0 END) as grade_b,
        SUM(CASE WHEN grade = 'C' THEN 1 ELSE 0 END) as grade_c,
        SUM(CASE WHEN grade = 'D' THEN 1 ELSE 0 END) as grade_d
      FROM provinces
    `);
    const provinceStats = provinceResult[0] ? {
      total: provinceResult[0].values[0][0],
      grade_b: provinceResult[0].values[0][1],
      grade_c: provinceResult[0].values[0][2],
      grade_d: provinceResult[0].values[0][3]
    } : { total: 0, grade_b: 0, grade_c: 0, grade_d: 0 };
    
    // 项目统计
    const projectResult = db.exec(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'operating' THEN 1 ELSE 0 END) as operating,
        SUM(CASE WHEN status = 'construction' THEN 1 ELSE 0 END) as construction,
        SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as planned
      FROM projects
    `);
    const projectStats = projectResult[0] ? {
      total: projectResult[0].values[0][0],
      operating: projectResult[0].values[0][1],
      construction: projectResult[0].values[0][2],
      planned: projectResult[0].values[0][3]
    } : { total: 0, operating: 0, construction: 0, planned: 0 };
    
    // 今日访问
    const visitResult = db.exec(`SELECT COUNT(*) as count FROM access_logs WHERE DATE(accessed_at) = DATE('now')`);
    const todayVisits = visitResult[0] ? visitResult[0].values[0][0] : 0;
    
    // 最近访问
    const recentResult = db.exec(`
      SELECT l.*, u.name as user_name
      FROM access_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.accessed_at DESC
      LIMIT 10
    `);
    const recentVisits = recentResult[0] ? recentResult[0].values.map(row => {
      const visit = {};
      recentResult[0].columns.forEach((col, i) => { visit[col] = row[i]; });
      return visit;
    }) : [];
    
    res.json({
      stats: {
        users: userStats,
        provinces: provinceStats,
        projects: projectStats,
        visits: { today: todayVisits }
      },
      recentVisits
    });
  } catch (err) {
    console.error('获取统计数据错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户分布
router.get('/users/distribution', requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    
    if (!result || !result[0]) {
      return res.json({ distribution: [] });
    }
    
    const distribution = result[0].values.map(row => ({
      role: row[0],
      count: row[1]
    }));
    
    res.json({ distribution });
  } catch (err) {
    console.error('获取用户分布错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取省份等级分布
router.get('/provinces/grade', requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT grade, COUNT(*) as count FROM provinces GROUP BY grade');
    
    if (!result || !result[0]) {
      return res.json({ grades: [] });
    }
    
    const grades = result[0].values.map(row => ({
      grade: row[0],
      count: row[1]
    }));
    
    res.json({ grades });
  } catch (err) {
    console.error('获取省份等级分布错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
