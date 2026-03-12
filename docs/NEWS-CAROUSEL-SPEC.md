# 光储龙虾·新闻轮播与多语言翻译方案

> 版本：v1.1  
> 日期：2026-03-11  
> 功能：新闻轮播 + 多语言翻译

## 1. 功能概述

### 1.1 新闻轮播
在光储龙虾首页顶部展示最新政策新闻轮播，点击直达政策详情页面。

### 1.2 多语言翻译
根据用户浏览器语言设置，自动将政策内容翻译成对应语言（默认支持中文/英文）。

### 1.3 用户体验流程
```
用户访问首页
  ↓
看到新闻轮播（最新 5-10 条政策）
  ↓
点击新闻标题
  ↓
跳转到政策详情页
  ↓
自动翻译成用户语言（中/英）
  ↓
阅读完整政策内容
```

## 2. 新闻轮播设计

### 2.1 首页轮播位置

```
┌─────────────────────────────────────────────────────┐
│  🦞 光储龙虾 Logo    [搜索框]    [导航]             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  📰 政策快讯 [轮播区域]                      │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │   │
│  │  │ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │       │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘       │   │
│  │  ◀ ◀ ◀           ● ○ ○ ○ ○           ▶ ▶ ▶ │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [搜索框 - 全局搜索]                                 │
└─────────────────────────────────────────────────────┘
```

### 2.2 轮播数据结构

```json
{
  "news_id": "NEWS_001",
  "policy_id": "POL_CN_20260311_001",
  "title": "国家能源局：2026 年风电光伏新增装机目标 200GW",
  "title_en": "NEA: 2026 Wind and Solar Target Set at 200GW",
  "summary": "国家能源局发布 2026 年可再生能源发展目标...",
  "summary_en": "The National Energy Administration released 2026 renewable energy targets...",
  "publish_date": "2026-03-10",
  "country": "CN",
  "agency": "国家能源局",
  "category": "development_plan",
  "impact_level": "high",
  "source_url": "http://www.nea.gov.cn/...",
  "thumbnail": "https://...",
  "is_featured": true,
  "view_count": 1250,
  "created_at": "2026-03-11T08:00:00Z"
}
```

### 2.3 轮播配置

| 配置项 | 值 | 说明 |
|-------|-----|------|
| 轮播数量 | 5-10 条 | 最新/最重要政策 |
| 自动播放 | 5 秒 | 每条停留时间 |
| 显示语言 | 用户浏览器语言 | 自动检测 |
| 排序规则 | 时间 + 重要性 | 最新 + 高影响优先 |

## 3. 政策详情页设计

### 3.1 页面布局

```
┌─────────────────────────────────────────────────────┐
│  [返回首页] [上一篇] [下一篇] [分享] [打印]          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📜 政策标题（中英文切换）                           │
│  Policy Title                                       │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 基本信息                                     │   │
│  │ 发布机构：国家能源局                         │   │
│  │ 发布日期：2026-03-10                         │   │
│  │ 生效日期：2026-03-10                         │   │
│  │ 政策类别：发展规划                           │   │
│  │ 影响地区：全国                               │   │
│  │ 影响行业：风电、光伏、储能                   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 政策摘要（用户语言）                          │   │
│  │ Policy Summary                               │   │
│  │ ...                                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 政策全文（用户语言）                          │   │
│  │ Full Text                                    │   │
│  │ ...                                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 附件下载                                     │   │
│  │ 📎 政策解读.pdf                               │   │
│  │ 📎 原文.pdf                                   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ 相关政策                                     │   │
│  │ · 关于推进可再生能源发展的指导意见            │   │
│  │ · 新型储能发展实施方案                        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.2 语言切换

```
[🇨🇳 中文] [🇺🇸 English] [自动检测]
```

**默认逻辑**:
1. 检测浏览器语言设置
2. 如果是中文 → 显示中文
3. 如果是其他 → 显示英文
4. 用户可手动切换

## 4. 翻译技术方案

### 4.1 翻译架构

```
政策原文（中文/英文/其他）
  ↓
翻译服务接口
  ├─ DeepL API（高质量）
  ├─ Google Translate API
  ├─ 百度翻译 API
  └─ 有道翻译 API
  ↓
翻译结果存储
  ↓
缓存（Redis）
  ↓
前端展示（用户语言）
```

### 4.2 翻译流程

```
1. 政策采集完成
   ↓
2. 检测原文语言
   ↓
3. 如果不是中文/英文 → 翻译成中文 + 英文
   ↓
4. 存储翻译结果
   ↓
5. 用户访问时根据语言展示
```

### 4.3 翻译数据模型

```json
{
  "policy_id": "POL_CN_20260311_001",
  "original": {
    "language": "zh-CN",
    "title": "国家能源局：2026 年风电光伏新增装机目标 200GW",
    "summary": "国家能源局发布 2026 年可再生能源发展目标...",
    "full_text": "..."
  },
  "translations": {
    "en": {
      "title": "NEA: 2026 Wind and Solar Target Set at 200GW",
      "summary": "The National Energy Administration released 2026 renewable energy targets...",
      "full_text": "...",
      "translated_at": "2026-03-11T08:05:00Z",
      "translator": "DeepL"
    },
    "ja": {
      "title": "国家エネルギー局：2026 年の風力・太陽光新規設置目標 200GW",
      "summary": "国家エネルギー局は 2026 年の再生可能エネルギー発展目標を発表...",
      "full_text": "...",
      "translated_at": "2026-03-11T08:05:00Z",
      "translator": "DeepL"
    }
  }
}
```

### 4.4 翻译 API 集成

```python
# 翻译服务示例
import requests
import hashlib

class TranslationService:
    def __init__(self):
        self.deepl_api_key = "your_api_key"
        self.cache = Redis()
    
    def translate(self, text, source_lang, target_lang):
        # 检查缓存
        cache_key = f"translate:{hashlib.md5(text.encode()).hexdigest()}:{target_lang}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        # 调用 DeepL API
        response = requests.post(
            'https://api.deepl.com/v2/translate',
            headers={'Authorization': f'DeepL-Auth-Key {self.deepl_api_key}'},
            data={
                'text': text,
                'source_lang': source_lang,
                'target_lang': target_lang
            }
        )
        
        result = response.json()['translations'][0]['text']
        
        # 缓存 24 小时
        self.cache.setex(cache_key, 86400, result)
        
        return result
    
    def translate_policy(self, policy):
        """翻译政策文档"""
        original_lang = detect_language(policy['title'])
        
        translations = {}
        
        # 翻译成中文和英文
        for target_lang in ['zh-CN', 'en']:
            if target_lang != original_lang:
                translations[target_lang] = {
                    'title': self.translate(policy['title'], original_lang, target_lang),
                    'summary': self.translate(policy['summary'], original_lang, target_lang),
                    'full_text': self.translate(policy['full_text'], original_lang, target_lang)
                }
        
        return translations
```

### 4.5 翻译成本估算

| 服务商 | 价格 | 月度成本（1000 条/天） |
|-------|------|---------------------|
| DeepL | $25/100 万字符 | $150/月 |
| Google Translate | $20/100 万字符 | $120/月 |
| 百度翻译 | ¥49/100 万字符 | ¥300/月 |
| 有道翻译 | ¥50/100 万字符 | ¥300/月 |

**推荐**: DeepL（质量最好）+ 百度翻译（备用）

## 5. 前端实现

### 5.1 新闻轮播组件

```jsx
// NewsCarousel.jsx
import React, { useState, useEffect } from 'react';

function NewsCarousel({ news, language }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [news.length]);
  
  const getTitle = (item) => {
    return language === 'zh-CN' ? item.title : item.title_en;
  };
  
  const getSummary = (item) => {
    return language === 'zh-CN' ? item.summary : item.summary_en;
  };
  
  return (
    <div className="news-carousel">
      <div className="carousel-header">
        <h2>📰 政策快讯</h2>
        <span className="carousel-language">
          {language === 'zh-CN' ? '中文' : 'English'}
        </span>
      </div>
      
      <div className="carousel-content">
        {news.slice(0, 5).map((item, index) => (
          <div
            key={item.news_id}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => window.location.href = `/policy/${item.policy_id}`}
          >
            <div className="item-flag">
              {getCountryFlag(item.country)}
            </div>
            <div className="item-content">
              <h3>{getTitle(item)}</h3>
              <p>{getSummary(item)}</p>
              <div className="item-meta">
                <span>{item.agency}</span>
                <span>{item.publish_date}</span>
                <span className="impact-level">{item.impact_level}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="carousel-controls">
        <button onClick={() => prev()}>◀</button>
        <div className="carousel-dots">
          {news.slice(0, 5).map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
        <button onClick={() => next()}>▶</button>
      </div>
    </div>
  );
}
```

### 5.2 语言检测

```javascript
// 检测用户语言
function detectUserLanguage() {
  // 1. 检查 URL 参数
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) return urlLang;
  
  // 2. 检查 localStorage
  const savedLang = localStorage.getItem('preferred_language');
  if (savedLang) return savedLang;
  
  // 3. 检测浏览器语言
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('zh')) return 'zh-CN';
  
  // 4. 默认英文
  return 'en';
}

// 设置语言
function setLanguage(lang) {
  localStorage.setItem('preferred_language', lang);
  window.location.reload();
}
```

### 5.3 政策详情页

```jsx
// PolicyDetail.jsx
import React, { useState, useEffect } from 'react';

function PolicyDetail({ policyId }) {
  const [policy, setPolicy] = useState(null);
  const [language, setLanguage] = useState(detectUserLanguage());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPolicy(policyId);
  }, [policyId]);
  
  async function fetchPolicy(id) {
    const response = await fetch(`/api/policies/${id}`);
    const data = await response.json();
    setPolicy(data);
    setLoading(false);
  }
  
  function getContent(field) {
    if (!policy) return '';
    
    if (language === 'zh-CN') {
      return policy.original.language === 'zh-CN' 
        ? policy.original[field]
        : policy.translations['zh-CN']?.[field] || policy.original[field];
    } else {
      return policy.original.language === 'en'
        ? policy.original[field]
        : policy.translations['en']?.[field] || policy.original[field];
    }
  }
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="policy-detail">
      <div className="language-switcher">
        <button 
          className={language === 'zh-CN' ? 'active' : ''}
          onClick={() => setLanguage('zh-CN')}
        >
          🇨🇳 中文
        </button>
        <button 
          className={language === 'en' ? 'active' : ''}
          onClick={() => setLanguage('en')}
        >
          🇺🇸 English
        </button>
      </div>
      
      <h1>{getContent('title')}</h1>
      
      <div className="policy-meta">
        <div className="meta-item">
          <label>发布机构 / Agency:</label>
          <span>{policy.agency.name}</span>
        </div>
        <div className="meta-item">
          <label>发布日期 / Date:</label>
          <span>{policy.publish_date}</span>
        </div>
        <div className="meta-item">
          <label>政策类别 / Category:</label>
          <span>{policy.category}</span>
        </div>
      </div>
      
      <div className="policy-summary">
        <h2>摘要 / Summary</h2>
        <p>{getContent('summary')}</p>
      </div>
      
      <div className="policy-content">
        <h2>全文 / Full Text</h2>
        <div dangerouslySetInnerHTML={{ __html: getContent('full_text') }} />
      </div>
      
      {policy.attachments && (
        <div className="policy-attachments">
          <h2>附件 / Attachments</h2>
          {policy.attachments.map((att, i) => (
            <a key={i} href={att.url} className="attachment-link">
              📎 {att.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 6. API 接口设计

### 6.1 新闻轮播 API

```javascript
GET /api/news/featured?limit=10&lang=zh-CN

Response:
{
  "news": [
    {
      "news_id": "NEWS_001",
      "policy_id": "POL_CN_20260311_001",
      "title": "国家能源局：2026 年风电光伏新增装机目标 200GW",
      "title_en": "NEA: 2026 Wind and Solar Target Set at 200GW",
      "summary": "...",
      "summary_en": "...",
      "publish_date": "2026-03-10",
      "country": "CN",
      "agency": "国家能源局",
      "impact_level": "high",
      "thumbnail": "https://..."
    }
  ]
}
```

### 6.2 政策详情 API

```javascript
GET /api/policies/{policy_id}?lang=zh-CN

Response:
{
  "policy_id": "POL_CN_20260311_001",
  "original": {
    "language": "zh-CN",
    "title": "...",
    "summary": "...",
    "full_text": "..."
  },
  "translations": {
    "en": {
      "title": "...",
      "summary": "...",
      "full_text": "..."
    }
  },
  "agency": {...},
  "publish_date": "...",
  "attachments": [...]
}
```

### 6.3 翻译 API

```javascript
POST /api/translate
{
  "text": "...",
  "source_lang": "zh-CN",
  "target_lang": "en"
}

Response:
{
  "translated_text": "...",
  "translator": "DeepL",
  "cached": false
}
```

## 7. 实施计划

| 阶段 | 时间 | 任务 | 交付物 |
|-----|------|------|--------|
| P0 | 2 天 | 新闻轮播前端 | 轮播组件 |
| P1 | 2 天 | 政策详情页 | 详情页面 |
| P2 | 3 天 | 翻译集成 | 翻译服务 |
| P3 | 1 天 | 语言切换 | 多语言支持 |
| P4 | 2 天 | 测试优化 | 上线 |

**总计**: 10 天

## 8. 验收标准

### 8.1 功能验收
- [ ] 新闻轮播正常显示
- [ ] 点击跳转到详情页
- [ ] 详情页支持中英文切换
- [ ] 翻译质量良好
- [ ] 自动检测用户语言

### 8.2 性能验收
- [ ] 轮播加载 <1 秒
- [ ] 详情页加载 <2 秒
- [ ] 翻译缓存命中率 >80%

### 8.3 数据验收
- [ ] 每日新增政策自动翻译
- [ ] 历史政策逐步翻译
- [ ] 翻译准确率 >90%

---

**方案状态**: ✅ 已完成  
**预计启动**: 2026-03-12  
**预计完成**: 2026-03-22
