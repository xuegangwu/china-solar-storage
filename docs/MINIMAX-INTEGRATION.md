# Minimax Coding Plan 集成方案

> 版本：v1.0  
> 日期：2026-03-11  
> 目标：为光储投资地图项目接入 Minimax AI 编程助手

## 1. 概述

### 1.1 集成目标
- 接入 Minimax AI 编程助手
- 提供智能代码生成
- 支持自然语言查询
- 自动化文档生成

### 1.2 应用场景
| 场景 | 功能 | 优先级 |
|-----|------|--------|
| 代码生成 | 根据需求生成代码 | P0 |
| 代码解释 | 解释复杂代码逻辑 | P0 |
| Bug 修复 | 定位并修复问题 | P1 |
| 文档生成 | 自动生成 API 文档 | P1 |
| 代码审查 | 代码质量检查 | P2 |

## 2. Minimax API 规格

### 2.1 API 端点

```
Base URL: https://api.minimax.chat/v1
Auth: Bearer Token
```

### 2.2 认证方式

```bash
# 获取 API Key
# 访问：https://platform.minimax.chat/

# 使用示例
curl -X POST https://api.minimax.chat/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "abab6.5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 2.3 核心接口

#### 对话接口
```json
POST /v1/chat/completions

Request:
{
  "model": "abab6.5",
  "messages": [
    {"role": "system", "content": "你是一个编程助手"},
    {"role": "user", "content": "帮我写一个 Python 函数计算 IRR"}
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}

Response:
{
  "choices": [{
    "message": {
      "content": "def calculate_irr(cash_flows):..."
    }
  }]
}
```

#### 代码生成接口
```json
POST /v1/code/generate

Request:
{
  "language": "python",
  "description": "计算内部收益率 IRR",
  "context": "财务计算，现金流数组"
}

Response:
{
  "code": "def calculate_irr(cash_flows):...",
  "explanation": "使用 scipy.optimize 求解..."
}
```

#### 代码解释接口
```json
POST /v1/code/explain

Request:
{
  "language": "python",
  "code": "def npv(rate, cash_flows):..."
}

Response:
{
  "explanation": "这个函数计算净现值...",
  "complexity": "中等",
  "suggestions": ["可以添加输入验证"]
}
```

## 3. 集成架构

### 3.1 系统架构

```
┌─────────────────────────────────────────────┐
│           光储投资地图系统                    │
├─────────────────────────────────────────────┤
│  前端界面 (React/Vue)                        │
├─────────────────────────────────────────────┤
│  后端 API (Node.js)                          │
│  ├─ /api/roi/calculate                      │
│  ├─ /api/roi/sensitivity                    │
│  └─ /api/ai/assist ← 新增                   │
├─────────────────────────────────────────────┤
│  Minimax AI 集成层                            │
│  ├─ CodeGenerator                           │
│  ├─ CodeExplainer                           │
│  └─ ChatAssistant                           │
├─────────────────────────────────────────────┤
│  Minimax API (外部服务)                       │
└─────────────────────────────────────────────┘
```

### 3.2 数据流

```
用户请求
  ↓
Node.js 后端
  ↓
Minimax 集成层
  ↓
Minimax API
  ↓
AI 响应
  ↓
格式化输出
  ↓
用户界面
```

## 4. 实现方案

### 4.1 后端集成（Node.js）

#### 安装依赖
```bash
npm install axios dotenv
```

#### 创建 Minimax 客户端
```javascript
// backend/utils/minimax.js
const axios = require('axios');
require('dotenv').config();

class MinimaxClient {
  constructor() {
    this.apiKey = process.env.MINIMAX_API_KEY;
    this.baseUrl = 'https://api.minimax.chat/v1';
  }

  // 对话
  async chat(messages, options = {}) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: options.model || 'abab6.5',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  }

  // 代码生成
  async generateCode(description, language = 'javascript', context = '') {
    const messages = [
      {
        role: 'system',
        content: `你是一个${language}编程专家。请根据描述生成代码。`
      },
      {
        role: 'user',
        content: `请用${language}实现：${description}\n\n上下文：${context}`
      }
    ];
    return await this.chat(messages);
  }

  // 代码解释
  async explainCode(code, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `请解释这段${language}代码的功能和逻辑。`
      },
      {
        role: 'user',
        content: code
      }
    ];
    return await this.chat(messages);
  }

  // Bug 修复
  async fixBug(code, error, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `请修复这段${language}代码中的错误。`
      },
      {
        role: 'user',
        content: `代码：\n${code}\n\n错误信息：\n${error}`
      }
    ];
    return await this.chat(messages);
  }
}

module.exports = MinimaxClient;
```

#### 创建 AI 助手路由
```javascript
// backend/routes/ai-assist.js
const express = require('express');
const MinimaxClient = require('../utils/minimax');
const router = express.Router();
const minimax = new MinimaxClient();

// 代码生成
router.post('/generate', async (req, res) => {
  try {
    const { description, language, context } = req.body;
    const code = await minimax.generateCode(description, language, context);
    res.json({ code, language });
  } catch (err) {
    console.error('代码生成失败:', err);
    res.status(500).json({ error: 'AI 服务暂时不可用' });
  }
});

// 代码解释
router.post('/explain', async (req, res) => {
  try {
    const { code, language } = req.body;
    const explanation = await minimax.explainCode(code, language);
    res.json({ explanation });
  } catch (err) {
    console.error('代码解释失败:', err);
    res.status(500).json({ error: 'AI 服务暂时不可用' });
  }
});

// Bug 修复
router.post('/fix', async (req, res) => {
  try {
    const { code, error, language } = req.body;
    const fixedCode = await minimax.fixBug(code, error, language);
    res.json({ code: fixedCode });
  } catch (err) {
    console.error('Bug 修复失败:', err);
    res.status(500).json({ error: 'AI 服务暂时不可用' });
  }
});

// 通用对话
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await minimax.chat(messages);
    res.json({ response });
  } catch (err) {
    console.error('对话失败:', err);
    res.status(500).json({ error: 'AI 服务暂时不可用' });
  }
});

module.exports = router;
```

#### 注册路由
```javascript
// backend/server.js
const aiAssistRoutes = require('./routes/ai-assist');
app.use('/api/ai', aiAssistRoutes);
```

### 4.2 前端集成（可选）

#### AI 助手组件
```html
<!-- web/components/ai-assistant.html -->
<div id="ai-assistant" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
  <!-- 悬浮按钮 -->
  <button onclick="toggleAIAssistant()" style="
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  ">🤖</button>
  
  <!-- 对话框 -->
  <div id="ai-chat-window" style="
    display: none;
    width: 400px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    margin-bottom: 10px;
    flex-direction: column;
  ">
    <!-- 标题栏 -->
    <div style="
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <span style="font-weight: 600;">💡 AI 编程助手</span>
      <button onclick="toggleAIAssistant()" style="
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>
    
    <!-- 消息区域 -->
    <div id="ai-messages" style="
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background: #f9fafb;
    "></div>
    
    <!-- 输入区域 -->
    <div style="
      padding: 15px;
      border-top: 1px solid #e1e5eb;
      display: flex;
      gap: 10px;
    ">
      <input 
        type="text" 
        id="ai-input"
        placeholder="输入问题，如：帮我写一个 IRR 计算函数..."
        style="
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        "
        onkeypress="if(event.key==='Enter') sendAIMessage()"
      >
      <button onclick="sendAIMessage()" style="
        padding: 10px 20px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      ">发送</button>
    </div>
  </div>
</div>

<script>
function toggleAIAssistant() {
  const window = document.getElementById('ai-chat-window');
  window.style.display = window.style.display === 'flex' ? 'none' : 'flex';
}

async function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const messages = document.getElementById('ai-messages');
  const question = input.value.trim();
  
  if (!question) return;
  
  // 添加用户消息
  messages.innerHTML += `
    <div style="margin-bottom: 15px; text-align: right;">
      <div style="
        display: inline-block;
        padding: 10px 15px;
        background: #667eea;
        color: white;
        border-radius: 12px;
        max-width: 80%;
        text-align: left;
      ">${question}</div>
    </div>
  `;
  
  input.value = '';
  
  // 显示加载中
  messages.innerHTML += `
    <div id="ai-loading" style="margin-bottom: 15px;">
      <div style="color: #999; font-size: 12px;">AI 思考中...</div>
    </div>
  `;
  
  messages.scrollTop = messages.scrollHeight;
  
  // 调用 API
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: '你是一个编程助手，擅长光储电站投资计算和 Web 开发' },
          { role: 'user', content: question }
        ]
      })
    });
    
    const data = await response.json();
    
    // 移除加载提示
    document.getElementById('ai-loading').remove();
    
    // 添加 AI 回复
    messages.innerHTML += `
      <div style="margin-bottom: 15px;">
        <div style="
          display: inline-block;
          padding: 10px 15px;
          background: white;
          color: #333;
          border-radius: 12px;
          max-width: 80%;
          text-align: left;
          border: 1px solid #e1e5eb;
        ">${data.response}</div>
      </div>
    `;
    
    messages.scrollTop = messages.scrollHeight;
  } catch (err) {
    document.getElementById('ai-loading').remove();
    messages.innerHTML += `
      <div style="margin-bottom: 15px; color: #ff4d4f; font-size: 12px;">
        ❌ AI 服务暂时不可用
      </div>
    `;
  }
}
</script>
```

## 5. 环境变量配置

### .env 文件
```bash
# Minimax API 配置
MINIMAX_API_KEY=your_api_key_here
MINIMAX_MODEL=abab6.5

# 其他配置
PORT=3000
JWT_SECRET=your-secret-key
```

## 6. 使用示例

### 6.1 代码生成

**请求**:
```javascript
POST /api/ai/generate
{
  "description": "计算内部收益率 IRR",
  "language": "python",
  "context": "财务计算，输入为现金流数组"
}
```

**响应**:
```python
def calculate_irr(cash_flows):
    """
    计算内部收益率 (IRR)
    
    参数:
        cash_flows: 现金流数组，如 [-1000, 200, 300, 400, 500]
    
    返回:
        IRR (百分比)
    """
    from scipy.optimize import brentq
    
    def npv(rate):
        return sum([cf / (1 + rate)**t for t, cf in enumerate(cash_flows)])
    
    try:
        irr = brentq(npv, -0.99, 1.0)
        return irr * 100  # 转换为百分比
    except:
        return None

# 使用示例
cash_flows = [-10000, 2000, 3000, 4000, 5000]
irr = calculate_irr(cash_flows)
print(f"IRR: {irr:.2f}%")
```

### 6.2 代码解释

**请求**:
```javascript
POST /api/ai/explain
{
  "code": "def npv(rate, cash_flows):...",
  "language": "python"
}
```

**响应**:
```
这个函数计算净现值 (NPV)：

1. 参数说明:
   - rate: 折现率
   - cash_flows: 现金流数组

2. 计算逻辑:
   - 对每期现金流进行折现
   - 累加所有折现值
   - 返回 NPV 结果

3. 使用场景:
   - 投资项目评估
   - 财务决策分析

4. 建议改进:
   - 添加输入验证
   - 处理异常情况
   - 添加文档字符串
```

### 6.3 Bug 修复

**请求**:
```javascript
POST /api/ai/fix
{
  "code": "def calculate_irr(cash_flows):\n    return sum(cash_flows)",
  "error": "计算结果不正确，应该使用 IRR 公式",
  "language": "python"
}
```

**响应**:
```python
# 修复后的代码
def calculate_irr(cash_flows):
    """
    计算内部收益率 (IRR)
    使用 scipy.optimize 求解 NPV=0 的折现率
    """
    from scipy.optimize import brentq
    
    def npv(rate):
        return sum([cf / (1 + rate)**t for t, cf in enumerate(cash_flows)])
    
    try:
        irr = brentq(npv, -0.99, 1.0)
        return irr * 100
    except ValueError:
        return None  # 无解
```

## 7. 成本估算

### Minimax API 定价

| 模型 | 价格 | 适用场景 |
|-----|------|---------|
| abab6.5 | ¥0.01/1K tokens | 通用对话 |
| abab6.0 | ¥0.005/1K tokens | 简单任务 |
| abab5.5 | ¥0.002/1K tokens | 基础功能 |

### 月度成本估算

**假设**:
- 日均请求：100 次
- 平均 tokens：500/次
- 使用模型：abab6.5

**计算**:
```
月度成本 = 100 次/天 × 30 天 × 500 tokens × ¥0.01/1K tokens
         = ¥15/月
```

**建议**:
- 开发环境：abab6.5（高质量）
- 生产环境：abab6.0（性价比）
- 简单任务：abab5.5（低成本）

## 8. 安全与隐私

### 8.1 API Key 管理
- ✅ 存储在环境变量
- ✅ 不提交到版本控制
- ✅ 定期轮换

### 8.2 数据保护
- ✅ 不发送敏感数据
- ✅ 脱敏处理
- ✅ 日志记录

### 8.3 使用限制
- ✅ 请求频率限制
- ✅ Token 数量限制
- ✅ 内容审核

## 9. 测试方案

### 单元测试
```javascript
// test/minimax.test.js
const MinimaxClient = require('../utils/minimax');

describe('MinimaxClient', () => {
  let client;
  
  beforeAll(() => {
    client = new MinimaxClient();
  });
  
  test('代码生成', async () => {
    const code = await client.generateCode('Hello World', 'javascript');
    expect(code).toContain('console.log');
  });
  
  test('代码解释', async () => {
    const explanation = await client.explainCode('print("Hello")', 'python');
    expect(explanation).toContain('打印');
  });
});
```

### 集成测试
```bash
# 测试代码生成 API
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"测试","language":"javascript"}'
```

## 10. 部署清单

- [ ] 申请 Minimax API Key
- [ ] 配置环境变量
- [ ] 安装依赖
- [ ] 部署后端代码
- [ ] 测试 API 接口
- [ ] 集成前端组件
- [ ] 监控使用情况
- [ ] 设置告警阈值

---

**状态**: 📋 待实施  
**优先级**: P1  
**预计工期**: 2-3 天
