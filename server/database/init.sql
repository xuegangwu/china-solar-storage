-- 光储投资地图 - 数据库初始化脚本
-- PostgreSQL 14+

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 省份/国家数据表
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    code VARCHAR(10) UNIQUE NOT NULL,
    type VARCHAR(20) DEFAULT 'province', -- province/country
    country VARCHAR(50) DEFAULT 'CN', -- CN/EU/ASEAN
    capital VARCHAR(100),
    region VARCHAR(50),
    eu_member BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 评分数据表
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES regions(id),
    year INTEGER NOT NULL,
    total_score DECIMAL(5,2) NOT NULL,
    resource_score INTEGER,
    price_score INTEGER,
    market_score INTEGER,
    grid_score INTEGER,
    policy_score INTEGER,
    risk_score INTEGER,
    grade VARCHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(region_id, year)
);

-- 详细数据表
CREATE TABLE IF NOT EXISTS region_data (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES regions(id),
    year INTEGER NOT NULL,
    coal_price DECIMAL(10,4),
    peak_valley_price DECIMAL(10,4),
    market_ratio DECIMAL(5,2),
    utilization_hours INTEGER,
    solar_irradiation INTEGER,
    land_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    grid_capacity INTEGER,
    policy_stability INTEGER,
    exchange_risk DECIMAL(5,2),
    tax_incentive DECIMAL(5,2),
    subsidy DECIMAL(10,4),
    feed_in_tariff DECIMAL(10,4),
    carbon_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(region_id, year)
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    region_id INTEGER REFERENCES regions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, region_id)
);

-- 用户对比表
CREATE TABLE IF NOT EXISTS user_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    region_ids INTEGER[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- policy/price/update/system
    title VARCHAR(255) NOT NULL,
    content TEXT,
    data JSONB,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 报告表
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    template VARCHAR(50),
    format VARCHAR(10) DEFAULT 'pdf',
    region_ids INTEGER[],
    file_url VARCHAR(500),
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- pending/processing/completed/failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 通知订阅表
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    notification_types VARCHAR(50)[],
    email_enabled BOOLEAN DEFAULT false,
    sms_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_regions_code ON regions(code);
CREATE INDEX idx_regions_country ON regions(country);
CREATE INDEX idx_scores_region_year ON scores(region_id, year);
CREATE INDEX idx_region_data_region_year ON region_data(region_id, year);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);

-- 使用 trigram 索引优化搜索
CREATE INDEX idx_regions_name_trgm ON regions USING gin (name gin_trgm_ops);

-- 插入示例数据（中国省份）
INSERT INTO regions (name, name_en, code, type, country, capital, region) VALUES
('上海市', 'Shanghai', 'SH', 'province', 'CN', '上海', '华东'),
('江苏省', 'Jiangsu', 'JS', 'province', 'CN', '南京', '华东'),
('浙江省', 'Zhejiang', 'ZJ', 'province', 'CN', '杭州', '华东'),
('广东省', 'Guangdong', 'GD', 'province', 'CN', '广州', '华南')
ON CONFLICT (code) DO NOTHING;

-- 插入示例评分数据
INSERT INTO scores (region_id, year, total_score, resource_score, price_score, market_score, grid_score, policy_score, risk_score, grade) VALUES
(1, 2026, 83.5, 70, 90, 85, 90, 88, 85, 'B'),
(2, 2026, 86.2, 75, 88, 90, 92, 90, 88, 'A'),
(3, 2026, 85.8, 72, 92, 88, 90, 86, 87, 'B'),
(4, 2026, 88.5, 80, 95, 92, 88, 90, 86, 'A')
ON CONFLICT (region_id, year) DO NOTHING;

-- 创建视图：最新评分
CREATE OR REPLACE VIEW v_latest_scores AS
SELECT 
    r.id,
    r.name,
    r.code,
    r.country,
    s.year,
    s.total_score,
    s.grade,
    ROW_NUMBER() OVER (PARTITION BY r.country ORDER BY s.total_score DESC) as rank
FROM regions r
JOIN scores s ON r.id = s.region_id
WHERE s.year = (SELECT MAX(year) FROM scores);

-- 创建视图：历史趋势
CREATE OR REPLACE VIEW v_score_trends AS
SELECT 
    r.id,
    r.name,
    s.year,
    s.total_score,
    s.grade,
    LAG(s.total_score) OVER (PARTITION BY r.id ORDER BY s.year) as prev_score,
    s.total_score - LAG(s.total_score) OVER (PARTITION BY r.id ORDER BY s.year) as score_change
FROM regions r
JOIN scores s ON r.id = s.region_id
ORDER BY r.id, s.year;

-- 授予用户权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO solar_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO solar_user;

-- 输出完成信息
SELECT '✅ 数据库初始化完成！' as status;
SELECT COUNT(*) as total_regions FROM regions;
SELECT COUNT(*) as total_scores FROM scores;
