/**
 * 电价政策路由
 */

const express = require('express');
const { getDatabase } = require('../utils/database');

const router = express.Router();

// 获取所有电价政策
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM electricity_prices ORDER BY province_name');
    
    if (!result || !result[0]) {
      return res.json({ policies: [] });
    }
    
    const policies = result[0].values.map(row => {
      const p = {};
      result[0].columns.forEach((col, i) => { p[col] = row[i]; });
      return p;
    });
    
    res.json({ policies });
  } catch (err) {
    console.error('获取电价政策错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单个省份电价政策
router.get('/:province', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM electricity_prices WHERE province_name = ?', [req.params.province]);
    
    if (!result || !result[0] || !result[0].values.length) {
      return res.status(404).json({ error: '未找到该省份电价政策' });
    }
    
    const policy = {};
    result[0].columns.forEach((col, i) => { policy[col] = result[0].values[0][i]; });
    
    res.json({ policy });
  } catch (err) {
    console.error('获取电价政策错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
