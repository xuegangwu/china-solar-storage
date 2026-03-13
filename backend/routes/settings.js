/**
 * 系统设置路由
 */

const express = require('express');
const { getDatabase, saveDatabase } = require('../utils/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取所有设置
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM system_settings');
    
    if (!result || !result[0]) {
      return res.json({ settings: {} });
    }
    
    const formatted = {};
    result[0].values.forEach(row => {
      const setting = {};
      result[0].columns.forEach((col, i) => { setting[col] = row[i]; });
      formatted[setting.key_name] = { value: setting.value, description: setting.description };
    });
    
    res.json({ settings: formatted });
  } catch (err) {
    console.error('获取设置错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新设置
router.put('/:key', requireAdmin, async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  
  try {
    const db = await getDatabase();
    db.run('UPDATE system_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key_name = ?', [value, key]);
    saveDatabase();
    res.json({ message: '设置更新成功' });
  } catch (err) {
    console.error('更新设置错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 批量更新设置
router.put('/batch', requireAdmin, async (req, res) => {
  const settings = req.body;
  
  try {
    const db = await getDatabase();
    
    for (const [key, value] of Object.entries(settings)) {
      db.run('UPDATE system_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key_name = ?', [value, key]);
    }
    saveDatabase();
    
    res.json({ message: '设置批量更新成功' });
  } catch (err) {
    console.error('批量更新设置错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
