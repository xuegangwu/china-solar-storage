/**
 * 用户管理路由
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase, saveDatabase } = require('../utils/database');
const { requireAdmin, logOperation } = require('../middleware/auth');

const router = express.Router();

// 获取用户列表（仅管理员）
router.get('/', requireAdmin, logOperation('获取用户列表'), async (req, res) => {
  try {
    const db = await getDatabase();
    const result = db.exec('SELECT id, username, name, role, email, created_at, last_login, is_active FROM users ORDER BY created_at DESC');
    
    if (!result || !result[0]) {
      return res.json({ users: [] });
    }
    
    const users = result[0].values.map(row => {
      const user = {};
      result[0].columns.forEach((col, i) => { user[col] = row[i]; });
      return user;
    });
    
    res.json({ users });
  } catch (err) {
    console.error('获取用户列表错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 创建用户（仅管理员）
router.post('/', requireAdmin, logOperation('创建用户'), async (req, res) => {
  const { username, password, name, role, email } = req.body;
  
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: '用户名、密码、姓名和角色为必填项' });
  }
  
  if (!['admin', 'user', 'viewer'].includes(role)) {
    return res.status(400).json({ error: '角色必须是 admin、user 或 viewer' });
  }
  
  try {
    const db = await getDatabase();
    const passwordHash = bcrypt.hashSync(password, 10);
    
    db.run('INSERT INTO users (username, password_hash, name, role, email) VALUES (?, ?, ?, ?, ?)',
      [username, passwordHash, name, role, email || null]);
    saveDatabase();
    
    const result = db.exec('SELECT last_insert_rowid()');
    const id = result[0].values[0][0];
    
    res.status(201).json({ message: '用户创建成功', user: { id, username, name, role } });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    console.error('创建用户错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新用户（仅管理员）
router.put('/:id', requireAdmin, logOperation('更新用户'), async (req, res) => {
  const { id } = req.params;
  const { name, role, email, is_active } = req.body;
  
  try {
    const db = await getDatabase();
    const updates = [];
    const values = [];
    
    if (name) { updates.push('name = ?'); values.push(name); }
    if (role && ['admin', 'user', 'viewer'].includes(role)) {
      updates.push('role = ?'); values.push(role);
    }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有提供要更新的字段' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    saveDatabase();
    
    res.json({ message: '用户更新成功' });
  } catch (err) {
    console.error('更新用户错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除用户（仅管理员）
router.delete('/:id', requireAdmin, logOperation('删除用户'), async (req, res) => {
  const { id } = req.params;
  
  if (parseInt(id) === 1) {
    return res.status(400).json({ error: '不能删除超级管理员' });
  }
  
  try {
    const db = await getDatabase();
    db.run('DELETE FROM users WHERE id = ?', [id]);
    saveDatabase();
    
    res.json({ message: '用户删除成功' });
  } catch (err) {
    console.error('删除用户错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 重置用户密码（仅管理员）
router.post('/:id/reset-password', requireAdmin, logOperation('重置密码'), async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;
  
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: '密码长度至少 6 位' });
  }
  
  try {
    const db = await getDatabase();
    const passwordHash = bcrypt.hashSync(new_password, 10);
    
    db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [passwordHash, id]);
    saveDatabase();
    
    res.json({ message: '密码重置成功' });
  } catch (err) {
    console.error('重置密码错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
