/**
 * 数据库工具 (sql.js 版本)
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'solar-storage.db');

let db = null;
let SQL = null;

async function getDatabase() {
  if (db) return db;
  
  SQL = await initSqlJs();
  
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch (err) {
    console.error('加载数据库失败:', err);
    db = new SQL.Database();
  }
  
  return db;
}

function saveDatabase() {
  if (!db) return;
  
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('保存数据库失败:', err);
  }
}

// 自动保存（每次请求后）
function autoSave() {
  setInterval(() => {
    saveDatabase();
  }, 5000); // 每 5 秒保存一次
}

module.exports = {
  getDatabase,
  saveDatabase,
  autoSave
};
