# 光储龙虾 - 全球光储信息采集系统

> 版本：v1.0  
> 日期：2026-03-11  
> 目标：自动收集全球光储产品、项目、政策信息

## 1. 概述

### 1.1 应用名称
**光储龙虾** 🦞
- **光** - 光伏
- **储** - 储能
- **龙虾** - 寓意"纵横四海"，收集全球信息

### 1.2 核心功能
| 功能模块 | 说明 | 优先级 |
|---------|------|--------|
| 产品收集 | 全球光伏/储能产品信息 | P0 |
| 项目追踪 | 全球光储项目动态 | P0 |
| 政策聚合 | 各国光储政策信息 | P0 |
| 市场分析 | 市场价格、趋势分析 | P1 |
| 企业库 | 光储企业信息 | P1 |
| 智能推荐 | 基于 AI 的投资建议 | P2 |

### 1.3 数据来源
| 类型 | 数据源 | 更新频率 |
|-----|-------|---------|
| 产品 | 厂商官网、B2B 平台 | 每日 |
| 项目 | 行业媒体、招投标 | 实时 |
| 政策 | 政府官网、能源局 | 每日 |
| 市场 | 交易所、资讯平台 | 每小时 |

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                  用户界面层                           │
│  [Web 门户] [移动端] [API] [邮件订阅]                │
├─────────────────────────────────────────────────────┤
│                  应用服务层                           │
│  [产品搜索] [项目追踪] [政策聚合] [市场分析]         │
├─────────────────────────────────────────────────────┤
│                  数据采集层                           │
│  [爬虫集群] [API 集成] [RSS 订阅] [人工录入]          │
├─────────────────────────────────────────────────────┤
│                  数据处理层                           │
│  [清洗] [去重] [分类] [标签化] [NLP 分析]            │
├─────────────────────────────────────────────────────┤
│                  数据存储层                           │
│  [PostgreSQL] [MongoDB] [Elasticsearch] [Redis]     │
└─────────────────────────────────────────────────────┘
```

### 2.2 数据采集流程

```
数据源
  ↓
采集器 (Crawler)
  ↓
消息队列 (RabbitMQ)
  ↓
数据清洗 (ETL)
  ↓
数据存储 (Database)
  ↓
搜索引擎 (Elasticsearch)
  ↓
API 服务
  ↓
用户界面
```

## 3. 数据模型设计

### 3.1 产品数据模型

```json
{
  "product_id": "PROD_001",
  "name": "隆基 Hi-MO 7 组件",
  "category": "pv_module",  // pv_module/inverter/battery/pcs
  "manufacturer": {
    "name": "隆基绿能",
    "country": "CN",
    "website": "https://www.longi.com"
  },
  "specifications": {
    "power_w": 580,
    "efficiency": 0.228,
    "size_mm": { "length": 2278, "width": 1134, "height": 30 },
    "weight_kg": 27.5,
    "warranty_years": 25
  },
  "pricing": {
    "price_usd": 0.15,
    "currency": "USD",
    "unit": "W",
    "moq": 1000,
    "updated_at": "2026-03-11"
  },
  "certifications": ["TUV", "CEC", "ISO9001"],
  "tags": ["n-type", "topcon", "bifacial"],
  "source_url": "https://...",
  "collected_at": "2026-03-11T10:00:00Z"
}
```

### 3.2 项目数据模型

```json
{
  "project_id": "PROJ_001",
  "name": "沙特 Al Shuaibah 光伏项目",
  "country": "SA",
  "region": "Middle East",
  "location": {
    "lat": 23.5,
    "lng": 42.5,
    "address": "Al Shuaibah, Saudi Arabia"
  },
  "capacity": {
    "pv_mw": 2600,
    "storage_mwh": 0,
    "total_mw": 2600
  },
  "status": "under_construction",  // planned/operating/cancelled
  "timeline": {
    "announced": "2023-01-15",
    "started": "2024-06-01",
    "expected_completion": "2026-12-31"
  },
  "investment": {
    "amount_usd": 1500000000,
    "currency": "USD"
  },
  "stakeholders": {
    "developer": "ACWA Power",
    "epc": "Power Construction Corp of China",
    "modules_supplier": "LONGi",
    "inverter_supplier": "Huawei"
  },
  "technology": {
    "module_type": "monocrystalline",
    "inverter_type": "central",
    "tracking": "single_axis"
  },
  "source_url": "https://...",
  "collected_at": "2026-03-11T10:00:00Z"
}
```

### 3.3 政策数据模型

```json
{
  "policy_id": "POL_001",
  "title": "沙特 2030 愿景可再生能源计划",
  "country": "SA",
  "level": "national",  // national/regional/local
  "category": "renewable_target",  // subsidy/tax/feed_in_tariff/...
  "published_date": "2023-01-01",
  "effective_date": "2023-01-01",
  "expiry_date": "2030-12-31",
  "content": {
    "summary": "到 2030 年可再生能源占比达到 50%",
    "targets": {
      "renewable_percentage": 0.50,
      "solar_capacity_gw": 40,
      "wind_capacity_gw": 27
    },
    "incentives": [
      {
        "type": "tax_exemption",
        "description": "10 年企业所得税减免",
        "value": 0.10
      }
    ]
  },
  "impact_sectors": ["solar", "wind", "storage"],
  "source_url": "https://...",
  "collected_at": "2026-03-11T10:00:00Z"
}
```

### 3.4 企业数据模型

```json
{
  "company_id": "COMP_001",
  "name": "隆基绿能",
  "name_en": "LONGi Green Energy",
  "country": "CN",
  "founded": 2000,
  "headquarters": "西安",
  "website": "https://www.longi.com",
  "stock": {
    "symbol": "601012.SH",
    "exchange": "Shanghai"
  },
  "business": {
    "segments": ["modules", "wafers", "cells", "systems"],
    "capacity": {
      "modules_gw": 80,
      "wafers_gw": 100
    }
  },
  "financials": {
    "revenue_usd": 12000000000,
    "year": 2024
  },
  "contact": {
    "email": "info@longi.com",
    "phone": "+86-29-xxxx"
  },
  "tags": ["tier1", "vertical_integration"],
  "collected_at": "2026-03-11T10:00:00Z"
}
```

## 4. 数据源列表

### 4.1 产品数据源

| 网站 | 类型 | 地区 | 优先级 |
|-----|------|------|--------|
| longi.com | 厂商 | 中国 | P0 |
| jinkosolar.com | 厂商 | 中国 | P0 |
| trinasolar.com | 厂商 | 中国 | P0 |
| huawei.com | 厂商 | 中国 | P0 |
| sungrowpower.com | 厂商 | 中国 | P0 |
| tesla.com/energy | 厂商 | 美国 | P1 |
| enphase.com | 厂商 | 美国 | P1 |

### 4.2 项目数据源

| 网站 | 类型 | 地区 | 优先级 |
|-----|------|------|--------|
| pv-magazine.com | 媒体 | 全球 | P0 |
| rechargenews.com | 媒体 | 全球 | P0 |
| energy-storage.news | 媒体 | 全球 | P0 |
| 光伏們 | 媒体 | 中国 | P0 |
| 储能头条 | 媒体 | 中国 | P0 |
| iea.org | 机构 | 全球 | P1 |
| irena.org | 机构 | 全球 | P1 |

### 4.3 政策数据源

| 网站 | 类型 | 地区 | 优先级 |
|-----|------|------|--------|
| nea.gov.cn | 政府 | 中国 | P0 |
| energy.gov | 政府 | 美国 | P1 |
| ec.europa.eu/energy | 政府 | 欧盟 | P1 |
| mewa.gov.sa | 政府 | 沙特 | P1 |

## 5. 技术实现

### 5.1 技术栈

| 层级 | 技术 | 说明 |
|-----|------|------|
| 爬虫 | Python + Scrapy | 数据采集 |
| 后端 | Node.js + Express | API 服务 |
| 数据库 | PostgreSQL + MongoDB | 结构化 + 非结构化 |
| 搜索 | Elasticsearch | 全文检索 |
| 缓存 | Redis | 热点数据 |
| 消息队列 | RabbitMQ | 异步处理 |
| 前端 | React + TypeScript | 用户界面 |
| 部署 | Docker + K8s | 容器化 |

### 5.2 爬虫架构

```python
# 爬虫示例代码
import scrapy
from datetime import datetime

class ProductSpider(scrapy.Spider):
    name = 'product_spider'
    start_urls = [
        'https://www.longi.com/products/',
        'https://www.jinkosolar.com/products/'
    ]
    
    def parse(self, response):
        for product in response.css('div.product-item'):
            yield {
                'name': product.css('h2::text').get(),
                'power': product.css('.power::text').get(),
                'efficiency': product.css('.efficiency::text').get(),
                'source_url': response.url,
                'collected_at': datetime.utcnow().isoformat()
            }
```

### 5.3 API 接口设计

```javascript
// RESTful API
GET    /api/products          // 产品列表
GET    /api/products/:id      // 产品详情
GET    /api/projects          // 项目列表
GET    /api/projects/:id      // 项目详情
GET    /api/policies          // 政策列表
GET    /api/policies/:id      // 政策详情
GET    /api/companies         // 企业列表
GET    /api/companies/:id     // 企业详情

POST   /api/search            // 全局搜索
GET    /api/stats             // 统计数据
GET    /api/trends            // 趋势分析
```

## 6. 前端设计

### 6.1 页面结构

```
┌─────────────────────────────────────────────────────┐
│  顶部栏 [Logo] [搜索] [导航] [用户]                  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  左侧栏  │            主内容区                       │
│          │                                          │
│  - 分类  │    [产品卡片] [项目列表] [政策聚合]       │
│  - 筛选  │                                          │
│  - 标签  │                                          │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│  底部栏 [关于] [联系] [API] [订阅]                   │
└─────────────────────────────────────────────────────┘
```

### 6.2 核心页面

| 页面 | URL | 功能 |
|-----|------|------|
| 首页 | / | 概览、推荐、热门 |
| 产品库 | /products | 产品搜索、筛选 |
| 项目库 | /projects | 项目追踪、地图 |
| 政策库 | /policies | 政策聚合、分类 |
| 企业库 | /companies | 企业信息、联系 |
| 市场分析 | /market | 价格、趋势 |

## 7. 实施计划

### 7.1 阶段划分

| 阶段 | 时间 | 目标 | 交付物 |
|-----|------|------|--------|
| P0 | 1 周 | 基础框架 | 爬虫 + 数据库 |
| P1 | 2 周 | 数据采集 | 产品 + 项目 + 政策 |
| P2 | 1 周 | 前端开发 | Web 门户 |
| P3 | 1 周 | 优化上线 | 性能 + 测试 |

### 7.2 里程碑

- **Week 1**: 爬虫框架、数据库设计
- **Week 2**: 产品数据采集
- **Week 3**: 项目 + 政策数据采集
- **Week 4**: 前端开发、测试上线

## 8. 验收标准

### 8.1 数据采集

- [ ] 产品数据：1000+ 条
- [ ] 项目数据：500+ 条
- [ ] 政策数据：200+ 条
- [ ] 企业数据：100+ 条

### 8.2 功能验收

- [ ] 搜索功能正常
- [ ] 筛选功能正常
- [ ] 数据更新及时
- [ ] API 响应正常

### 8.3 性能验收

- [ ] 页面加载 <3 秒
- [ ] API 响应 <500ms
- [ ] 支持 100+ 并发

---

**文档状态**: ✅ 已完成  
**下次审查**: 2026-03-18
