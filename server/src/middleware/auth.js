/**
 * 用户认证中间件
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 验证 JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '令牌无效或已过期'
      });
    }
    
    req.user = user;
    next();
  });
}

// 生成 Token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 刷新 Token
function refreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查是否在宽限期内（过期后 24 小时内）
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.exp;
    
    if (now - exp > 24 * 60 * 60) {
      return null; // 过期太久，需要重新登录
    }
    
    // 生成新 Token
    return generateToken(decoded);
  } catch (err) {
    return null;
  }
}

// 可选认证（不强制要求登录）
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  
  next();
}

module.exports = {
  authenticateToken,
  generateToken,
  refreshToken,
  optionalAuth,
  JWT_SECRET
};
