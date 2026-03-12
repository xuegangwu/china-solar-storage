/**
 * 省份数据路由
 */

const express = require('express');
const { getDatabase, saveDatabase } = require('../utils/database');

const router = express.Router();

// 获取所有省份
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const provinces = db.exec('SELECT * FROM provinces ORDER BY grade DESC, name ASC')[0];
    
    if (!provinces) {
      return res.json({ provinces: [] });
    }
    
    // 格式化数据
    const formatted = provinces.values.map(row => {
      const p = {};
      provinces.columns.forEach((col, i) => {
        p[col] = row[i];
      });
      // 解析 JSON 字段
      try { p.scores = JSON.parse(p.scores); } catch(e) {}
      try { p.roi = JSON.parse(p.roi); } catch(e) {}
      try { p.policies = JSON.parse(p.policies); } catch(e) {}
      return p;
    });
    
    res.json({ provinces: formatted });
  } catch (err) {
    console.error('获取省份数据错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个省份
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM provinces WHERE id = ?', [req.params.id]);
    
    if (!result || !result[0] || !result[0].values.length) {
      return res.status(404).json({ error: '省份不存在' });
    }
    
    const row = result[0].values[0];
    const province = {};
    result[0].columns.forEach((col, i) => {
      province[col] = row[i];
    });
    
    try { province.scores = JSON.parse(province.scores); } catch(e) {}
    try { province.roi = JSON.parse(province.roi); } catch(e) {}
    try { province.policies = JSON.parse(province.policies); } catch(e) {}
    
    res.json({ province });
  } catch (err) {
    console.error('获取省份错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建省份（仅管理员）
router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { name, abbr, lat, lng, annual_hours, benchmark_price, peak_valley_spread, curtailed_rate, grade, scores } = req.body;
    
    if (!name || !abbr || !lat || !lng) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    db.run(
      'INSERT INTO provinces (name, abbr, lat, lng, annual_hours, benchmark_price, peak_valley_spread, curtailed_rate, grade, scores) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, abbr, lat, lng, annual_hours, benchmark_price, peak_valley_spread, curtailed_rate, grade, JSON.stringify(scores || {})]
    );
    saveDatabase();
    
    res.status(201).json({ message: '省份创建成功', id: db.exec('SELECT last_insert_rowid()')[0].values[0][0] });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: '省份已存在' });
    }
    console.error('创建省份错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新省份（仅管理员）
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const data = req.body;
    
    const allowedFields = ['annual_hours', 'benchmark_price', 'peak_valley_spread', 'market_rate', 'curtailed_rate', 'grid_capacity_rate', 'policies', 'scores', 'grade', 'suggestion', 'roi'];
    const updates = [];
    const values = [];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(typeof data[field] === 'object' ? JSON.stringify(data[field]) : data[field]);
      }
    });
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有提供要更新的字段' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(data.id);
    
    db.run(`UPDATE provinces SET ${updates.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    
    res.json({ message: '省份更新成功' });
  } catch (err) {
    console.error('更新省份错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除省份（仅管理员）
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM provinces WHERE id = ?', [req.params.id]);
    saveDatabase();
    
    res.json({ message: '省份删除成功' });
  } catch (err) {
    console.error('删除省份错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
