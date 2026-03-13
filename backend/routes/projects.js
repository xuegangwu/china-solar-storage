/**
 * 项目数据路由
 */

const express = require('express');
const { getDatabase, saveDatabase } = require('../utils/database');

const router = express.Router();

// 获取所有项目
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM projects ORDER BY created_at DESC');
    
    if (!result || !result[0]) {
      return res.json({ projects: [] });
    }
    
    const projects = result[0].values.map(row => {
      const p = {};
      result[0].columns.forEach((col, i) => { p[col] = row[i]; });
      return p;
    });
    
    res.json({ projects });
  } catch (err) {
    console.error('获取项目数据错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个项目
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    
    if (!result || !result[0] || !result[0].values.length) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    const project = {};
    result[0].columns.forEach((col, i) => { project[col] = result[0].values[0][i]; });
    
    res.json({ project });
  } catch (err) {
    console.error('获取项目错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建项目（仅管理员）
router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { name, province, lat, lng, capacity_mw, status, developer, commission_date, investment } = req.body;
    
    if (!name || !province || !lat || !lng || !status) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    if (!['operating', 'construction', 'planned'].includes(status)) {
      return res.status(400).json({ error: '状态必须是 operating、construction 或 planned' });
    }
    
    db.run('INSERT INTO projects (name, province, lat, lng, capacity_mw, status, developer, commission_date, investment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, province, lat, lng, capacity_mw, status, developer || null, commission_date || null, investment || null]);
    saveDatabase();
    
    const result = db.exec('SELECT last_insert_rowid()');
    const id = result[0].values[0][0];
    
    res.status(201).json({ message: '项目创建成功', id });
  } catch (err) {
    console.error('创建项目错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新项目（仅管理员）
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const data = req.body;
    const updates = [];
    const values = [];
    
    const allowedFields = ['name', 'province', 'capacity_mw', 'status', 'developer', 'commission_date', 'investment'];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有提供要更新的字段' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);
    
    db.run(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    
    res.json({ message: '项目更新成功' });
  } catch (err) {
    console.error('更新项目错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除项目（仅管理员）
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    saveDatabase();
    
    res.json({ message: '项目删除成功' });
  } catch (err) {
    console.error('删除项目错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
