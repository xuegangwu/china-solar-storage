/**
 * 操作日志路由
 */

const express = require('express');
const { getDatabase, saveDatabase } = require('../utils/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取操作日志
router.get('/', requireAdmin, async (req, res) => {
  const { limit = 100, user_id, action } = req.query;
  
  try {
    const db = await getDatabase();
    let query = `
      SELECT l.*, u.name as user_name
      FROM operation_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    if (user_id) { query += ' AND l.user_id = ?'; params.push(user_id); }
    if (action) { query += ' AND l.action LIKE ?'; params.push(`%${action}%`); }
    query += ' ORDER BY l.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const result = db.exec(query, params);
    
    if (!result || !result[0]) {
      return res.json({ logs: [] });
    }
    
    const logs = result[0].values.map(row => {
      const log = {};
      result[0].columns.forEach((col, i) => { log[col] = row[i]; });
      return log;
    });
    
    res.json({ logs });
  } catch (err) {
    console.error('获取日志错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取访问日志
router.get('/access/list', requireAdmin, async (req, res) => {
  const { limit = 100 } = req.query;
  
  try {
    const db = await getDatabase();
    const result = db.exec(`
      SELECT l.*, u.name as user_name
      FROM access_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.accessed_at DESC
      LIMIT ?
    `, [parseInt(limit)]);
    
    if (!result || !result[0]) {
      return res.json({ logs: [] });
    }
    
    const logs = result[0].values.map(row => {
      const log = {};
      result[0].columns.forEach((col, i) => { log[col] = row[i]; });
      return log;
    });
    
    res.json({ logs });
  } catch (err) {
    console.error('获取访问日志错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 清空日志
router.delete('/clear', requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM operation_logs');
    saveDatabase();
    res.json({ message: '操作日志已清空' });
  } catch (err) {
    console.error('清空日志错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
