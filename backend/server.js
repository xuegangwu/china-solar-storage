#!/usr/bin/env node
/**
 * 光储电站投资地图 - 后端 API 服务器 (sql.js 版本)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const provinceRoutes = require('./routes/provinces');
const projectRoutes = require('./routes/projects');
const priceRoutes = require('./routes/prices');
const logRoutes = require('./routes/logs');
const settingRoutes = require('./routes/settings');
const statsRoutes = require('./routes/stats');

// 中间件
const { authenticateToken, logOperation } = require('./middleware/auth');
const { autoSave } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// API 路由（必须在静态文件之前）
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/logs', authenticateToken, logRoutes);
app.use('/api/settings', authenticateToken, settingRoutes);
app.use('/api/stats', authenticateToken, statsRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 静态文件服务（前端）
app.use(express.static(path.join(__dirname, '../web')));

// 前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/login-v1.0.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 启动服务器
app.listen(PORT, () => {
  // 启动自动保存
  autoSave();
  
  console.log(`
╔════════════════════════════════════════════════════════╗
║   🌞 光储电站投资地图 - 后端 API 服务                    ║
╠════════════════════════════════════════════════════════╣
║   服务地址：http://localhost:${PORT}                      ║
║   环境：${process.env.NODE_ENV || 'development'}                                ║
║   数据库：data/solar-storage.db (sql.js)                ║
╠════════════════════════════════════════════════════════╣
║   API 文档：http://localhost:${PORT}/api/health           ║
║   前端页面：http://localhost:${PORT}                      ║
╚════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
