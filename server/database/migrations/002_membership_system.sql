-- 商业化功能 - 会员系统数据库迁移
-- PostgreSQL 14+

-- 会员等级表
CREATE TABLE IF NOT EXISTS membership_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- free/pro/enterprise
    name_cn VARCHAR(50) NOT NULL, -- 中文名称
    price_monthly DECIMAL(10,2) DEFAULT 0, -- 月付价格
    price_yearly DECIMAL(10,2) DEFAULT 0, -- 年付价格
    api_quota_monthly INTEGER DEFAULT 0, -- API 月度配额
    api_quota_daily INTEGER DEFAULT 0, -- API 日度配额
    report_quota_monthly INTEGER DEFAULT 0, -- 报告月度配额
    max_comparisons INTEGER DEFAULT 2, -- 最大对比数量
    data_export BOOLEAN DEFAULT false, -- 数据导出
    ai_analysis BOOLEAN DEFAULT false, -- AI 分析
    email_support BOOLEAN DEFAULT false, -- 邮件支持
    phone_support BOOLEAN DEFAULT false, -- 电话支持
    dedicated_support BOOLEAN DEFAULT false, -- 专属客服
    custom_development BOOLEAN DEFAULT false, -- 定制开发
    private_deployment BOOLEAN DEFAULT false, -- 私有化部署
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户会员表
CREATE TABLE IF NOT EXISTS user_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    plan_id INTEGER REFERENCES membership_plans(id),
    status VARCHAR(20) DEFAULT 'active', -- active/expired/cancelled
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT false, -- 自动续费
    payment_method VARCHAR(50), -- alipay/wechat/bank_transfer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    plan_id INTEGER REFERENCES membership_plans(id),
    order_no VARCHAR(100) UNIQUE NOT NULL, -- 订单号
    amount DECIMAL(10,2) NOT NULL, -- 订单金额
    currency VARCHAR(10) DEFAULT 'CNY', -- 货币
    payment_method VARCHAR(50), -- 支付方式
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending/paid/failed/refunded
    payment_time TIMESTAMP WITH TIME ZONE,
    invoice_required BOOLEAN DEFAULT false, -- 是否需要发票
    invoice_title VARCHAR(200), -- 发票抬头
    invoice_tax_id VARCHAR(100), -- 纳税人识别号
    invoice_email VARCHAR(255), -- 发票邮箱
    remark TEXT, -- 备注
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    transaction_id VARCHAR(200) UNIQUE, -- 第三方交易号
    payment_method VARCHAR(50) NOT NULL, -- alipay/wechat/unionpay
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    status VARCHAR(20) DEFAULT 'pending', -- pending/success/failed/refunded
    request_data JSONB, -- 请求数据
    response_data JSONB, -- 响应数据
    callback_data JSONB, -- 回调数据
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API 调用配额表
CREATE TABLE IF NOT EXISTS api_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    plan_id INTEGER REFERENCES membership_plans(id),
    quota_type VARCHAR(50) NOT NULL, -- daily/monthly
    quota_limit INTEGER NOT NULL, -- 配额上限
    quota_used INTEGER DEFAULT 0, -- 已使用
    reset_date TIMESTAMP WITH TIME ZONE, -- 重置日期
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quota_type, DATE(reset_date))
);

-- API 调用日志表
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    api_key VARCHAR(200),
    endpoint VARCHAR(200) NOT NULL, -- API 端点
    method VARCHAR(10) DEFAULT 'GET', -- HTTP 方法
    status_code INTEGER, -- HTTP 状态码
    request_data JSONB,
    response_data JSONB,
    ip_address INET,
    user_agent TEXT,
    response_time INTEGER, -- 响应时间（毫秒）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 发票表
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    invoice_no VARCHAR(100) UNIQUE, -- 发票号码
    invoice_type VARCHAR(50), -- electronic/paper
    invoice_title VARCHAR(200) NOT NULL,
    invoice_tax_id VARCHAR(100) NOT NULL,
    invoice_amount DECIMAL(10,2) NOT NULL,
    invoice_status VARCHAR(20) DEFAULT 'pending', -- pending/issued/delivered
    invoice_email VARCHAR(255),
    invoice_address TEXT,
    invoice_phone VARCHAR(50),
    issued_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 优惠券表
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 优惠码
    name VARCHAR(100) NOT NULL, -- 优惠券名称
    discount_type VARCHAR(20) DEFAULT 'percent', -- percent/fixed
    discount_value DECIMAL(10,2) NOT NULL, -- 折扣值（百分比或固定金额）
    min_amount DECIMAL(10,2) DEFAULT 0, -- 最低使用金额
    max_discount DECIMAL(10,2), -- 最大折扣金额
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER, -- 总使用次数限制
    usage_count INTEGER DEFAULT 0, -- 已使用次数
    per_user_limit INTEGER DEFAULT 1, -- 每用户限制
    applicable_plans INTEGER[], -- 适用会员等级
    status VARCHAR(20) DEFAULT 'active', -- active/inactive/expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户优惠券表
CREATE TABLE IF NOT EXISTS user_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    coupon_id UUID REFERENCES coupons(id),
    order_id UUID REFERENCES orders(id),
    status VARCHAR(20) DEFAULT 'unused', -- unused/used/expired
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, coupon_id)
);

-- 推荐奖励表
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id), -- 推荐人
    referred_id UUID REFERENCES users(id), -- 被推荐人
    reward_amount DECIMAL(10,2) DEFAULT 0, -- 奖励金额
    reward_status VARCHAR(20) DEFAULT 'pending', -- pending/paid
    order_id UUID REFERENCES orders(id), -- 关联订单
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(referred_id)
);

-- 创建索引
CREATE INDEX idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_status ON user_memberships(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_api_quotas_user ON api_quotas(user_id);
CREATE INDEX idx_api_logs_user ON api_logs(user_id);
CREATE INDEX idx_api_logs_created ON api_logs(created_at);
CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

-- 插入默认会员等级
INSERT INTO membership_plans (name, name_cn, price_monthly, price_yearly, api_quota_monthly, api_quota_daily, report_quota_monthly, max_comparisons, data_export, ai_analysis, email_support, phone_support, dedicated_support, custom_development, private_deployment) VALUES
('free', '免费会员', 0, 0, 0, 100, 1, 2, false, false, false, false, false, false, false),
('pro', '专业会员', 299.00, 2999.00, 10000, 1000, 10, 5, true, true, true, false, false, false, false),
('enterprise', '企业会员', 9999.00, 9999.00, 100000, 10000, -1, 10, true, true, true, true, true, true, true)
ON CONFLICT DO NOTHING;

-- 创建视图：会员权限
CREATE OR REPLACE VIEW v_user_permissions AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    mp.name as plan_name,
    mp.name_cn as plan_name_cn,
    um.status as membership_status,
    um.end_date,
    mp.api_quota_monthly,
    mp.api_quota_daily,
    mp.report_quota_monthly,
    mp.max_comparisons,
    mp.data_export,
    mp.ai_analysis,
    mp.email_support,
    mp.phone_support,
    mp.dedicated_support,
    mp.custom_development,
    mp.private_deployment
FROM users u
LEFT JOIN user_memberships um ON u.id = um.user_id
LEFT JOIN membership_plans mp ON um.plan_id = mp.id
WHERE um.status = 'active' AND (um.end_date IS NULL OR um.end_date > NOW());

-- 创建视图：API 使用情况
CREATE OR REPLACE VIEW v_api_usage AS
SELECT 
    u.id as user_id,
    u.email,
    DATE(al.created_at) as usage_date,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN al.status_code = 200 THEN 1 END) as success_calls,
    COUNT(CASE WHEN al.status_code >= 400 THEN 1 END) as error_calls,
    AVG(al.response_time) as avg_response_time
FROM users u
JOIN api_logs al ON u.id = al.user_id
GROUP BY u.id, u.email, DATE(al.created_at)
ORDER BY usage_date DESC;

-- 授权
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO solar_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO solar_user;

-- 输出完成信息
SELECT '✅ 会员系统数据库初始化完成！' as status;
SELECT COUNT(*) as total_plans FROM membership_plans;
SELECT COUNT(*) as total_members FROM user_memberships;
