/**
 * 认证中间件
 */

const jwt = require('jsonwebtoken');
const { getDatabase, saveDatabase } = require('../utils/database');

// 验证 JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '令牌无效或已过期' });
    }
    
    req.user = user;
    next();
  });
}

// 验证管理员权限
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
}

// 记录操作日志
function logOperation(action) {
  return async (req, res, next) => {
    try {
      const db = await getDatabase();
      
      const originalJson = res.json;
      res.json = function(data) {
        try {
          db.run(
            'INSERT INTO operation_logs (user_id, username, action, resource, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user?.id || null, req.user?.username || 'anonymous', action, req.path, req.ip, req.get('user-agent')]
          );
          saveDatabase();
        } catch (err) {
          console.error('记录日志失败:', err);
        }
        
        return originalJson.call(this, data);
      };
    } catch (err) {
      console.error('初始化日志失败:', err);
    }
    
    next();
  };
}

// 记录访问日志
function logAccess(req, res, next) {
  const db = getDatabase();
  
  if (req.user) {
    db.then(database => {
      database.run(
        'INSERT INTO access_logs (user_id, username, ip_address, user_agent) VALUES (?, ?, ?, ?)',
        [req.user.id, req.user.username, req.ip, req.get('user-agent')]
      );
      saveDatabase();
    }).catch(err => {
      console.error('记录访问日志失败:', err);
    });
  }
  
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  logOperation,
  logAccess
};
