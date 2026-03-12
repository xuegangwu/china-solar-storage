#!/usr/bin/env node
/**
 * 数据库初始化脚本 (sql.js 版本)
 */

const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'solar-storage.db');

async function initDB() {
  console.log('📦 初始化数据库...');
  
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  
  // 创建用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      is_active INTEGER DEFAULT 1
    )
  `);
  console.log('✅ 创建用户表');
  
  // 创建省份数据表
  db.run(`
    CREATE TABLE IF NOT EXISTS provinces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      abbr TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      annual_hours INTEGER,
      benchmark_price REAL,
      peak_valley_spread REAL,
      market_rate REAL DEFAULT 0.9,
      curtailed_rate REAL,
      grid_capacity_rate REAL DEFAULT 0.8,
      policies TEXT,
      scores TEXT,
      grade TEXT,
      suggestion TEXT,
      roi TEXT,
      country TEXT DEFAULT 'CN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ 创建省份数据表');
  
  // 创建项目数据表
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      province TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      capacity_mw REAL,
      status TEXT NOT NULL,
      developer TEXT,
      commission_date DATETIME,
      investment REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ 创建项目数据表');
  
  // 创建操作日志表
  db.run(`
    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      resource TEXT,
      resource_id INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ 创建操作日志表');
  
  // 创建系统设置表
  db.run(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_name TEXT UNIQUE NOT NULL,
      value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ 创建系统设置表');
  
  // 创建访问记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      ip_address TEXT,
      user_agent TEXT,
      accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ 创建访问记录表');
  
  // 插入默认用户
  const defaultUsers = [
    { username: 'admin', password: 'admin123', name: '系统管理员', role: 'admin' },
    { username: 'terry', password: 'terry123', name: '伍学纲', role: 'admin' },
    { username: 'user', password: 'user123', name: '普通用户', role: 'user' },
    { username: 'viewer', password: 'viewer123', name: '访客', role: 'viewer' }
  ];
  
  defaultUsers.forEach(user => {
    const passwordHash = bcrypt.hashSync(user.password, 10);
    try {
      db.run(
        'INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)',
        [user.username, passwordHash, user.name, user.role]
      );
      console.log(`✅ 创建默认用户：${user.username}`);
    } catch (err) {
      if (!err.message.includes('UNIQUE')) {
        throw err;
      }
    }
  });
  
  // 插入默认系统设置
  const defaultSettings = [
    { key: 'weight_resource', value: '15', description: '资源条件权重 (%)' },
    { key: 'weight_price', value: '20', description: '电价水平权重 (%)' },
    { key: 'weight_policy', value: '15', description: '政策支持权重 (%)' },
    { key: 'weight_grid', value: '50', description: '消纳条件权重 (%)' }
  ];
  
  defaultSettings.forEach(setting => {
    try {
      db.run(
        'INSERT OR IGNORE INTO system_settings (key_name, value, description) VALUES (?, ?, ?)',
        [setting.key, setting.value, setting.description]
      );
      console.log(`✅ 创建系统设置：${setting.key}`);
    } catch (err) {
      if (!err.message.includes('UNIQUE')) {
        throw err;
      }
    }
  });
  
  // 创建电价政策表
  db.run(`
    CREATE TABLE IF NOT EXISTS electricity_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      province_name TEXT NOT NULL,
      benchmark_price REAL,
      peak_price REAL,
      valley_price REAL,
      peak_hours TEXT,
      valley_hours TEXT,
      spread REAL,
      policy TEXT,
      storage_requirement TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ 创建电价政策表');
  
  // 插入中国省份电价政策
  const pricePolicies = [
    {province:'上海市',benchmark:0.4155,peak:0.6233,valley:0.2078,peak_hours:'8:00-11:00, 15:00-22:00',valley_hours:'23:00-次日 8:00',policy:'工商业储能补贴 0.1 元/kWh',storage:'无强制配储'},
    {province:'浙江省',benchmark:0.4155,peak:0.6233,valley:0.2078,peak_hours:'8:00-11:00, 15:00-22:00',valley_hours:'23:00-次日 8:00',policy:'省级补贴 0.1 元/kWh',storage:'鼓励配储 10%'},
    {province:'广东省',benchmark:0.4530,peak:0.6795,valley:0.2265,peak_hours:'9:00-12:00, 14:00-19:00',valley_hours:'23:00-次日 9:00',policy:'深圳市补贴 0.3 元/kWh',storage:'配储 20%，2 小时'},
    {province:'北京市',benchmark:0.3939,peak:0.5909,valley:0.1970,peak_hours:'8:00-11:00, 16:00-21:00',valley_hours:'23:00-次日 7:00',policy:'区级补贴 0.1-0.2 元/kWh',storage:'鼓励配储'},
    {province:'江苏省',benchmark:0.3910,peak:0.5865,valley:0.1955,peak_hours:'8:00-12:00, 17:00-21:00',valley_hours:'23:00-次日 8:00',policy:'工商业储能补贴 0.1 元/kWh（前 3 年）',storage:'配储 15%，2 小时'},
    {province:'山东省',benchmark:0.3949,peak:0.5924,valley:0.1975,peak_hours:'8:00-11:00, 16:00-21:00',valley_hours:'23:00-次日 7:00',policy:'无省级补贴',storage:'配储 10-20%，2-4 小时'},
    {province:'天津市',benchmark:0.3781,peak:0.5672,valley:0.1890,peak_hours:'8:00-11:00, 16:00-21:00',valley_hours:'23:00-次日 7:00',policy:'滨海新区补贴',storage:'鼓励配储'},
    {province:'安徽省',benchmark:0.3716,peak:0.5574,valley:0.1858,peak_hours:'8:00-11:00, 16:00-21:00',valley_hours:'23:00-次日 7:00',policy:'省级补贴 0.05 元/kWh',storage:'配储 10%'},
    {province:'福建省',benchmark:0.3932,peak:0.5898,valley:0.1966,peak_hours:'8:00-11:00, 16:00-21:00',valley_hours:'23:00-次日 7:00',policy:'无省级补贴',storage:'鼓励配储'},
    {province:'海南省',benchmark:0.4298,peak:0.6447,valley:0.2149,peak_hours:'8:00-11:00, 16:00-21:00',valley_hours:'23:00-次日 7:00',policy:'自贸港政策',storage:'鼓励配储'}
  ];
  
  pricePolicies.forEach(p => {
    try {
      db.run(
        'INSERT INTO electricity_prices (province_name, benchmark_price, peak_price, valley_price, peak_hours, valley_hours, spread, policy, storage_requirement) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.province, p.benchmark, p.peak, p.valley, p.peak_hours, p.valley_hours, p.spread, p.policy, p.storage]
      );
    } catch (err) {
      if (!err.message.includes('UNIQUE')) {
        throw err;
      }
    }
  });
  console.log('✅ 创建 10 省份电价政策数据');
  
  // 插入 30 省份数据（中国）
  const provinces = [
    {name:'上海市',abbr:'上海',lat:31.2304,lng:121.4737,annual_hours:1150,benchmark_price:0.4155,peak_valley_spread:0.85,curtailed_rate:1.5,grade:'B',total:83.5,country:'CN'},
    {name:'浙江省',abbr:'浙江',lat:30.2741,lng:120.1551,annual_hours:1100,benchmark_price:0.4155,peak_valley_spread:0.90,curtailed_rate:2.0,grade:'B',total:75.0,country:'CN'},
    {name:'广东省',abbr:'广东',lat:23.1291,lng:113.2644,annual_hours:1200,benchmark_price:0.4530,peak_valley_spread:0.85,curtailed_rate:3.0,grade:'B',total:74.0,country:'CN'},
    {name:'北京市',abbr:'北京',lat:39.9042,lng:116.4074,annual_hours:1280,benchmark_price:0.3939,peak_valley_spread:0.80,curtailed_rate:2.0,grade:'B',total:73.0,country:'CN'},
    {name:'海南省',abbr:'海南',lat:20.0444,lng:110.1999,annual_hours:1250,benchmark_price:0.4298,peak_valley_spread:0.70,curtailed_rate:2.0,grade:'C',total:69.8,country:'CN'},
    {name:'福建省',abbr:'福建',lat:26.0745,lng:119.2965,annual_hours:1150,benchmark_price:0.3932,peak_valley_spread:0.70,curtailed_rate:2.5,grade:'C',total:69.0,country:'CN'},
    {name:'天津市',abbr:'天津',lat:39.3434,lng:117.3616,annual_hours:1260,benchmark_price:0.3781,peak_valley_spread:0.75,curtailed_rate:3.0,grade:'C',total:66.0,country:'CN'},
    {name:'安徽省',abbr:'安徽',lat:31.8206,lng:117.2272,annual_hours:1200,benchmark_price:0.3716,peak_valley_spread:0.70,curtailed_rate:3.5,grade:'C',total:64.8,country:'CN'},
    {name:'云南省',abbr:'云南',lat:25.0389,lng:102.7183,annual_hours:1150,benchmark_price:0.3358,peak_valley_spread:0.55,curtailed_rate:2.5,grade:'C',total:64.0,country:'CN'},
    {name:'江西省',abbr:'江西',lat:28.6829,lng:115.8579,annual_hours:1100,benchmark_price:0.3830,peak_valley_spread:0.65,curtailed_rate:3.0,grade:'C',total:63.8,country:'CN'},
    {name:'湖北省',abbr:'湖北',lat:30.5928,lng:114.3055,annual_hours:1100,benchmark_price:0.3891,peak_valley_spread:0.70,curtailed_rate:3.5,grade:'C',total:63.0,country:'CN'},
    {name:'广西',abbr:'广西',lat:22.8170,lng:108.3665,annual_hours:1150,benchmark_price:0.3828,peak_valley_spread:0.65,curtailed_rate:3.5,grade:'C',total:62.6,country:'CN'},
    {name:'四川省',abbr:'四川',lat:30.5728,lng:104.0668,annual_hours:1050,benchmark_price:0.3515,peak_valley_spread:0.60,curtailed_rate:3.0,grade:'C',total:60.8,country:'CN'},
    {name:'江苏省',abbr:'江苏',lat:32.0603,lng:118.7969,annual_hours:1180,benchmark_price:0.3910,peak_valley_spread:0.75,curtailed_rate:4.0,grade:'C',total:57.0,country:'CN'},
    {name:'河北省',abbr:'河北',lat:38.0428,lng:114.5149,annual_hours:1300,benchmark_price:0.3644,peak_valley_spread:0.70,curtailed_rate:5.0,grade:'C',total:56.3,country:'CN'},
    {name:'陕西省',abbr:'陕西',lat:34.3416,lng:108.9398,annual_hours:1350,benchmark_price:0.3545,peak_valley_spread:0.60,curtailed_rate:5.0,grade:'C',total:56.3,country:'CN'},
    {name:'河南省',abbr:'河南',lat:34.7466,lng:113.6253,annual_hours:1250,benchmark_price:0.3695,peak_valley_spread:0.70,curtailed_rate:4.0,grade:'D',total:54.8,country:'CN'},
    {name:'贵州省',abbr:'贵州',lat:26.6470,lng:106.6302,annual_hours:1100,benchmark_price:0.3586,peak_valley_spread:0.60,curtailed_rate:4.0,grade:'D',total:54.8,country:'CN'},
    {name:'辽宁省',abbr:'辽宁',lat:41.8057,lng:123.4315,annual_hours:1200,benchmark_price:0.3749,peak_valley_spread:0.65,curtailed_rate:5.0,grade:'D',total:53.3,country:'CN'},
    {name:'吉林省',abbr:'吉林',lat:43.8171,lng:125.3235,annual_hours:1180,benchmark_price:0.3731,peak_valley_spread:0.60,curtailed_rate:5.5,grade:'D',total:52.4,country:'CN'},
    {name:'湖南省',abbr:'湖南',lat:28.2282,lng:112.9388,annual_hours:1080,benchmark_price:0.3880,peak_valley_spread:0.68,curtailed_rate:4.0,grade:'D',total:51.8,country:'CN'},
    {name:'重庆市',abbr:'重庆',lat:29.4316,lng:106.9123,annual_hours:1000,benchmark_price:0.3515,peak_valley_spread:0.65,curtailed_rate:4.5,grade:'D',total:51.2,country:'CN'},
    {name:'山西省',abbr:'山西',lat:37.8706,lng:112.5489,annual_hours:1320,benchmark_price:0.3320,peak_valley_spread:0.65,curtailed_rate:6.0,grade:'D',total:44.8,country:'CN'},
    {name:'黑龙江省',abbr:'黑龙江',lat:45.8038,lng:126.5340,annual_hours:1150,benchmark_price:0.3731,peak_valley_spread:0.58,curtailed_rate:6.0,grade:'D',total:44.8,country:'CN'},
    {name:'青海省',abbr:'青海',lat:36.6171,lng:101.7782,annual_hours:1650,benchmark_price:0.3247,peak_valley_spread:0.45,curtailed_rate:6.0,grade:'D',total:44.3,country:'CN'},
    {name:'山东省',abbr:'山东',lat:36.6512,lng:117.1209,annual_hours:1280,benchmark_price:0.3949,peak_valley_spread:0.85,curtailed_rate:8.0,grade:'D',total:43.8,country:'CN'},
    {name:'内蒙古',abbr:'内蒙古',lat:40.8414,lng:111.7519,annual_hours:1450,benchmark_price:0.3020,peak_valley_spread:0.50,curtailed_rate:7.0,grade:'D',total:41.3,country:'CN'},
    {name:'宁夏',abbr:'宁夏',lat:38.4872,lng:106.2309,annual_hours:1480,benchmark_price:0.3019,peak_valley_spread:0.45,curtailed_rate:8.0,grade:'D',total:40.3,country:'CN'},
    {name:'甘肃省',abbr:'甘肃',lat:36.0611,lng:103.8343,annual_hours:1550,benchmark_price:0.3078,peak_valley_spread:0.50,curtailed_rate:12.0,grade:'D',total:37.8,country:'CN'},
    {name:'新疆',abbr:'新疆',lat:43.8256,lng:87.6168,annual_hours:1500,benchmark_price:0.2620,peak_valley_spread:0.40,curtailed_rate:15.0,grade:'D',total:35.3,country:'CN'}
  ];
  
  provinces.forEach(province => {
    try {
      db.run(
        'INSERT OR IGNORE INTO provinces (name, abbr, lat, lng, annual_hours, benchmark_price, peak_valley_spread, curtailed_rate, grade, scores, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [province.name, province.abbr, province.lat, province.lng, province.annual_hours, province.benchmark_price, province.peak_valley_spread, province.curtailed_rate, province.grade, JSON.stringify({ total: province.total }), province.country]
      );
    } catch (err) {
      if (!err.message.includes('UNIQUE')) {
        throw err;
      }
    }
  });
  console.log('✅ 创建 30 省份数据（中国）');
  
  // 插入越南省份数据
  const vietnamProvinces = [
    {name:'胡志明市',abbr:'HCMC',lat:10.8231,lng:106.6297,annual_hours:1400,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:2.0,grade:'B',total:72.0,country:'VN'},
    {name:'河内市',abbr:'HN',lat:21.0285,lng:105.8542,annual_hours:1350,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:2.5,grade:'B',total:70.0,country:'VN'},
    {name:'岘港市',abbr:'DN',lat:16.0544,lng:108.2022,annual_hours:1450,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:1.5,grade:'B',total:73.0,country:'VN'},
    {name:'海防市',abbr:'HP',lat:20.8449,lng:106.6881,annual_hours:1300,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:3.0,grade:'C',total:65.0,country:'VN'},
    {name:'芹苴市',abbr:'CT',lat:10.0340,lng:105.7882,annual_hours:1380,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:2.5,grade:'C',total:68.0,country:'VN'},
    {name:'广宁省',abbr:'QN',lat:21.0064,lng:107.2925,annual_hours:1320,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:3.0,grade:'C',total:64.0,country:'VN'},
    {name:'清化省',abbr:'TH',lat:19.8067,lng:105.7851,annual_hours:1350,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:3.5,grade:'C',total:63.0,country:'VN'},
    {name:'乂安省',abbr:'NA',lat:19.2342,lng:104.9200,annual_hours:1300,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:4.0,grade:'C',total:61.0,country:'VN'},
    {name:'林同省',abbr:'LT',lat:11.5753,lng:108.1422,annual_hours:1500,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:1.5,grade:'B',total:75.0,country:'VN'},
    {name:'平顺省',abbr:'BT',lat:11.0904,lng:108.0721,annual_hours:1550,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:1.0,grade:'A',total:78.0,country:'VN'},
    {name:'宁顺省',abbr:'NT',lat:11.6739,lng:108.8629,annual_hours:1600,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:1.0,grade:'A',total:80.0,country:'VN'},
    {name:'嘉莱省',abbr:'GL',lat:13.8078,lng:108.1094,annual_hours:1450,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:2.0,grade:'B',total:71.0,country:'VN'},
    {name:'多乐省',abbr:'DL',lat:12.7100,lng:108.2378,annual_hours:1420,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:2.5,grade:'B',total:69.0,country:'VN'},
    {name:'庆和省',abbr:'KH',lat:12.2585,lng:109.0526,annual_hours:1500,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:1.5,grade:'B',total:74.0,country:'VN'},
    {name:'平定省',abbr:'BD',lat:14.1665,lng:108.9026,annual_hours:1480,benchmark_price:0.08,peak_valley_spread:0.05,curtailed_rate:2.0,grade:'B',total:72.0,country:'VN'}
  ];
  
  vietnamProvinces.forEach(province => {
    try {
      db.run(
        'INSERT OR IGNORE INTO provinces (name, abbr, lat, lng, annual_hours, benchmark_price, peak_valley_spread, curtailed_rate, grade, scores, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [province.name, province.abbr, province.lat, province.lng, province.annual_hours, province.benchmark_price, province.peak_valley_spread, province.curtailed_rate, province.grade, JSON.stringify({ total: province.total }), province.country]
      );
    } catch (err) {
      if (!err.message.includes('UNIQUE')) {
        throw err;
      }
    }
  });
  console.log('✅ 创建 15 省份数据（越南）');
  
  // 插入 6 个示例项目
  const projects = [
    {name:'山东德州光伏储能项目',province:'山东省',lat:37.4513,lng:116.3558,capacity_mw:200,status:'operating',developer:'国家电投'},
    {name:'浙江杭州工商业储能',province:'浙江省',lat:30.2741,lng:120.1551,capacity_mw:50,status:'operating',developer:'宁德时代'},
    {name:'广东深圳光储一体化',province:'广东省',lat:22.5431,lng:114.0579,capacity_mw:100,status:'construction',developer:'南方电网'},
    {name:'甘肃酒泉光伏基地',province:'甘肃省',lat:39.7790,lng:98.5168,capacity_mw:500,status:'planned',developer:'华能集团'},
    {name:'江苏南通储能电站',province:'江苏省',lat:32.0162,lng:120.8942,capacity_mw:80,status:'operating',developer:'国网江苏'},
    {name:'青海海南州光伏',province:'青海省',lat:36.2800,lng:100.6200,capacity_mw:1000,status:'construction',developer:'国家能源集团'}
  ];
  
  projects.forEach(project => {
    try {
      db.run(
        'INSERT OR IGNORE INTO projects (name, province, lat, lng, capacity_mw, status, developer) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [project.name, project.province, project.lat, project.lng, project.capacity_mw, project.status, project.developer]
      );
    } catch (err) {
      if (!err.message.includes('UNIQUE')) {
        throw err;
      }
    }
  });
  console.log('✅ 创建 6 个示例项目');
  
  // 保存数据库到文件
  const data = db.export();
  const buffer = Buffer.from(data);
  
  // 确保目录存在
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(dbPath, buffer);
  
  console.log('\n🎉 数据库初始化完成！');
  console.log(`📁 数据库位置：${dbPath}`);
  
  db.close();
}

initDB().catch(err => {
  console.error('❌ 初始化失败:', err);
  process.exit(1);
});
