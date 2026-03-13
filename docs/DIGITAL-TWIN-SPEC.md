# 光储电站数字孪生展示设计方案

> 版本：v1.0  
> 日期：2026-03-11  
> 目标：构建沉浸式电站数字孪生可视化系统

## 1. 概述

### 1.1 设计目标
- 实时展示电站运行状态
- 三维可视化电站设备
- 多维度数据融合展示
- 支持投资决策分析

### 1.2 核心功能
| 功能模块 | 说明 | 优先级 |
|---------|------|--------|
| 地理位置 | 电站地址、地形、周边环境 | P0 |
| 光照资源 | 实时光照、历史数据、预测 | P0 |
| 收益分析 | 实时收益、累计收益、IRR | P0 |
| 政策信息 | 补贴政策、电价政策 | P1 |
| 消纳监测 | 弃光率、上网电量 | P1 |
| 并网状态 | 并网/离网、电压、频率 | P1 |

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                  用户界面层                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 3D 视图  │ │ 数据面板 │ │ 时间轴  │ │ 控制面板 │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────────────────┤
│                  数字孪生引擎                         │
│  ┌─────────────────┐  ┌─────────────────────┐      │
│  │ Three.js 渲染   │  │ 物理引擎            │      │
│  └─────────────────┘  └─────────────────────┘      │
├─────────────────────────────────────────────────────┤
│                  数据服务层                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 电站数据 │ │ 气象数据 │ │ 电网数据 │ │ 政策数据 │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────────────────┤
│                  基础设施层                           │
│  ┌─────────────────────────────────────────────┐    │
│  │  数据库 + API + 消息队列 + 缓存              │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
数据源
  ↓
数据采集中转
  ↓
实时数据库
  ↓
数字孪生引擎
  ↓
3D 渲染 + 数据可视化
  ↓
用户界面
```

## 3. 数据模型设计

### 3.1 电站基础信息

```json
{
  "station_id": "STATION_001",
  "name": "浙江省杭州市光伏电站",
  "type": "ground_mounted",  // ground_mounted/rooftop/distributed
  "status": "operating",  // operating/construction/planned
  
  // 地理位置
  "location": {
    "address": "浙江省杭州市余杭区 XXX 镇",
    "coordinates": {
      "latitude": 30.2741,
      "longitude": 120.1551,
      "altitude": 50  // 海拔 (米)
    },
    "area": 50000,  // 占地面积 (平方米)
    "terrain": "plain",  // terrain/hilly/mountain
    "land_type": "unused_land"  // 土地类型
  },
  
  // 规模信息
  "capacity": {
    "pv_capacity_mw": 100,  // 光伏装机 (MW)
    "storage_capacity_mwh": 200,  // 储能容量 (MWh)
    "inverter_count": 20,  // 逆变器数量
    "panel_count": 300000  // 组件数量
  },
  
  // 投资信息
  "investment": {
    "total_investment": 38000,  // 总投资 (万元)
    "pv_cost_per_w": 3.5,  // 光伏单位投资 (元/W)
    "storage_cost_per_wh": 1.5,  // 储能单位投资 (元/Wh)
    "land_cost": 500,  // 土地成本 (万元)
    "construction_date": "2025-01-01",
    "commission_date": "2025-12-31"
  }
}
```

### 3.2 光照资源数据

```json
{
  "station_id": "STATION_001",
  "timestamp": "2026-03-11T14:00:00+08:00",
  
  // 实时光照
  "realtime": {
    "ghi": 850,  // 总辐射 (W/m²)
    "dni": 920,  // 法向辐射 (W/m²)
    "dhi": 120,  // 散射辐射 (W/m²)
    "temperature": 25.5,  // 环境温度 (°C)
    "wind_speed": 3.2,  // 风速 (m/s)
    "humidity": 65,  // 湿度 (%)
    "cloud_cover": 15  // 云量 (%)
  },
  
  // 日累计
  "daily": {
    "date": "2026-03-11",
    "total_radiation": 5.2,  // 累计辐射 (kWh/m²)
    "peak_hours": 5.5,  // 峰值日照小时
    "max_ghi": 920,  // 最大辐射
    "sunrise": "06:15",
    "sunset": "18:20"
  },
  
  // 历史数据 (30 天)
  "history": [
    {"date": "2026-03-10", "radiation": 5.0, "peak_hours": 5.3},
    {"date": "2026-03-09", "radiation": 4.8, "peak_hours": 5.1}
  ],
  
  // 预测数据 (7 天)
  "forecast": [
    {"date": "2026-03-12", "radiation": 5.5, "peak_hours": 5.8, "confidence": 0.85},
    {"date": "2026-03-13", "radiation": 4.5, "peak_hours": 4.8, "confidence": 0.75}
  ],
  
  // 资源评估
  "assessment": {
    "annual_radiation": 1400,  // 年辐射量 (kWh/m²)
    "annual_hours": 1100,  // 年等效小时
    "resource_grade": "B",  // 资源等级
    "stability": 0.85  // 稳定性评分
  }
}
```

### 3.3 收益率数据

```json
{
  "station_id": "STATION_001",
  "calculation_date": "2026-03-11",
  
  // 实时收益
  "realtime": {
    "timestamp": "2026-03-11T14:00:00+08:00",
    "power_output_kw": 85000,  // 当前出力 (kW)
    "revenue_per_hour": 35700,  // 小时收益 (元)
    "electricity_price": 0.42  // 当前电价 (元/kWh)
  },
  
  // 日收益
  "daily": {
    "date": "2026-03-11",
    "generation_kwh": 450000,  // 发电量 (kWh)
    "revenue": 189000,  // 收益 (元)
    "avg_price": 0.42,  // 平均电价
    "subsidy": 45000,  // 补贴 (元)
    "arbitrage": 12000  // 储能套利 (元)
  },
  
  // 累计收益
  "cumulative": {
    "total_generation_kwh": 12500000,  // 累计发电 (万 kWh)
    "total_revenue": 5250,  // 累计收益 (万元)
    "total_subsidy": 1250,  // 累计补贴 (万元)
    "operating_days": 280  // 运营天数
  },
  
  // 财务指标
  "financial": {
    "irr": 10.8,  // 内部收益率 (%)
    "npv": 2850,  // 净现值 (万元)
    "payback_years": 9.2,  // 回收期 (年)
    "lcoe": 0.32,  // 度电成本 (元/kWh)
    "roi_annual": 12.5,  // 年化 ROI (%)
    "total_revenue_25y": 42500  // 25 年累计收益 (万元)
  },
  
  // 收益构成
  "revenue_breakdown": {
    "base_electricity": 0.70,  // 基础售电 70%
    "subsidy": 0.15,  // 补贴 15%
    "storage_arbitrage": 0.10,  // 储能套利 10%
    "green_certificate": 0.05  // 绿证 5%
  }
}
```

### 3.4 政策信息

```json
{
  "station_id": "STATION_001",
  "province": "浙江省",
  "city": "杭州市",
  
  // 电价政策
  "electricity_price_policy": {
    "benchmark_price": 0.4155,  // 燃煤基准价
    "market_price": 0.3950,  // 市场化交易价
    "peak_price": 0.6233,  // 峰段电价
    "valley_price": 0.2078,  // 谷段电价
    "spread": 0.4155,  // 峰谷价差
    "peak_hours": "8:00-11:00, 15:00-22:00",
    "valley_hours": "23:00-次日 8:00",
    "effective_date": "2025-01-01"
  },
  
  // 补贴政策
  "subsidy_policy": {
    "national_subsidy": {
      "amount": 0,  // 国家补贴 (元/kWh)
      "years": 0,  // 补贴年限
      "status": "expired"  // 状态
    },
    "provincial_subsidy": {
      "amount": 0.10,  // 省级补贴
      "years": 3,
      "status": "active",
      "end_date": "2028-12-31"
    },
    "city_subsidy": {
      "amount": 0.05,  // 市级补贴
      "years": 5,
      "status": "active",
      "end_date": "2030-12-31"
    }
  },
  
  // 配储政策
  "storage_requirement": {
    "required": true,
    "ratio": 0.10,  // 配储比例 10%
    "duration_hours": 2,  // 时长 2 小时
    "policy_doc": "浙能源〔2023〕15 号"
  },
  
  // 税收优惠
  "tax_benefit": {
    "vat_refund": 0.50,  // 增值税即征即退 50%
    "income_tax": "3_free_3_half",  // 三免三减半
    "land_tax": "reduced"  // 土地使用税减免
  },
  
  // 消纳保障
  "grid_guarantee": {
    "full_purchase": true,  // 全额保障性收购
    "priority_dispatch": true,  // 优先调度
    "curtailment_limit": 0.05  // 弃光率上限 5%
  }
}
```

### 3.5 消纳数据

```json
{
  "station_id": "STATION_001",
  "timestamp": "2026-03-11T14:00:00+08:00",
  
  // 实时消纳
  "realtime": {
    "generation_kw": 85000,  // 当前发电 (kW)
    "grid_kw": 82000,  // 上网电量 (kW)
    "curtailed_kw": 3000,  // 弃光电量 (kW)
    "curtailment_rate": 0.035,  // 弃光率 3.5%
    "self_use_kw": 5000,  // 自用电量 (kW)
    "self_use_rate": 0.06  // 自用率 6%
  },
  
  // 日消纳
  "daily": {
    "date": "2026-03-11",
    "total_generation_kwh": 450000,
    "grid_kwh": 435000,
    "curtailed_kwh": 15000,
    "curtailment_rate": 0.033,
    "self_use_kwh": 27000,
    "self_use_rate": 0.06
  },
  
  // 累计消纳
  "cumulative": {
    "total_generation_kwh": 12500000,
    "total_grid_kwh": 12000000,
    "total_curtailed_kwh": 500000,
    "avg_curtailment_rate": 0.04,  // 平均弃光率 4%
    "grid_limitation_hours": 120  // 限电小时数
  },
  
  // 电网状态
  "grid_status": {
    "voltage_kv": 110,  // 电压等级
    "frequency_hz": 50.02,  // 频率
    "load_rate": 0.75,  // 负载率
    "stability": "stable",  // 稳定/波动/不稳定
    "constraint": "none"  // 约束类型
  },
  
  // 消纳评估
  "assessment": {
    "grid_capacity_rate": 0.85,  // 电网容量系数
    "accommodation_grade": "B",  // 消纳等级
    "risk_level": "low"  // 风险等级
  }
}
```

### 3.6 并网状态

```json
{
  "station_id": "STATION_001",
  "timestamp": "2026-03-11T14:00:00+08:00",
  
  // 并网状态
  "grid_connection": {
    "status": "grid_connected",  // grid_connected/off_grid/disconnected
    "connection_date": "2025-12-31",
    "connection_point": "110kV 变电站",
    "distance_km": 5.2  // 并网点距离 (km)
  },
  
  // 电气参数
  "electrical": {
    "voltage_kv": 110,  // 电压等级
    "frequency_hz": 50.02,  // 频率
    "power_factor": 0.98,  // 功率因数
    "harmonic_distortion": 0.03,  // 谐波畸变率
    "three_phase_balance": 0.99  // 三相不平衡度
  },
  
  // 出力状态
  "output": {
    "active_power_kw": 85000,  // 有功功率
    "reactive_power_kvar": 5000,  // 无功功率
    "apparent_power_kva": 85150,  // 视在功率
    "load_rate": 0.85,  // 负载率
    "efficiency": 0.98  // 转换效率
  },
  
  // 保护状态
  "protection": {
    "relay_status": "normal",  // 继电保护状态
    "islanding_protection": "active",  // 防孤岛保护
    "low_voltage_ride_through": "active",  // 低电压穿越
    "fault_count_30d": 0  // 30 天故障次数
  },
  
  // 调度指令
  "dispatch": {
    "instruction": "normal_generation",  // 调度指令
    "target_power_kw": 90000,  // 目标出力
    "ramp_rate_limit": 0.1,  // 爬坡率限制
    "agc_status": "active"  // AGC 状态
  }
}
```

## 4. 3D 可视化设计

### 4.1 场景层次

```
Scene (场景)
├── Terrain (地形)
│   ├── ElevationMap (高程图)
│   ├── SatelliteImage (卫星图)
│   └── Vegetation (植被)
├── Station (电站)
│   ├── PV_Panels (光伏组件)
│   ├── Inverters (逆变器)
│   ├── Storage_Containers (储能集装箱)
│   ├── Transformers (变压器)
│   └── Power_Lines (电力线路)
├── Environment (环境)
│   ├── Skybox (天空盒)
│   ├── Sun (太阳)
│   ├── Clouds (云层)
│   └── Buildings (周边建筑)
└── UI_Overlay (UI 覆盖)
    ├── DataPanels (数据面板)
    ├── Labels (标注)
    └── Controls (控制)
```

### 4.2 相机视角

```javascript
const cameraViews = {
  // 鸟瞰视角
  overview: {
    position: [30.2841, 120.1651, 500],
    target: [30.2741, 120.1551, 0],
    fov: 60
  },
  
  // 设备视角
  equipment: {
    position: [30.2745, 120.1555, 50],
    target: [30.2741, 120.1551, 10],
    fov: 45
  },
  
  // 第一人称
  firstPerson: {
    position: [30.2741, 120.1551, 2],
    target: [30.2741, 120.1561, 2],
    fov: 75
  },
  
  // 巡检路径
  inspection: {
    waypoints: [
      {pos: [30.2741, 120.1551, 2], target: [30.2741, 120.1561, 2]},
      {pos: [30.2745, 120.1555, 2], target: [30.2750, 120.1560, 2]}
    ]
  }
};
```

### 4.3 数据标注

```javascript
// 3D 标注样式
const labelStyles = {
  // 发电数据
  generation: {
    icon: '⚡',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    fontSize: 14,
    offset: {x: 0, y: -30}
  },
  
  // 设备状态
  equipment: {
    icon: '🔧',
    color: '#1890ff',
    backgroundColor: 'rgba(24, 144, 255, 0.9)',
    fontSize: 12,
    offset: {x: 10, y: -20}
  },
  
  // 告警信息
  alarm: {
    icon: '⚠️',
    color: '#ff4d4f',
    backgroundColor: 'rgba(255, 77, 79, 0.9)',
    fontSize: 16,
    offset: {x: 0, y: -40},
    animation: 'pulse'
  }
};
```

## 5. UI 界面设计

### 5.1 主界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  顶部栏 (60px)                                              │
│  [电站名称] [搜索] [通知] [用户]                            │
├──────────┬─────────────────────────────────────┬────────────┤
│          │                                     │            │
│  左侧栏  │          3D 主视图                   │  右侧栏    │
│  (300px) │          (自适应)                   │  (350px)   │
│          │                                     │            │
│  - 电站  │          [3D 场景]                   │  - 实时    │
│    列表  │                                     │    数据    │
│  - 设备  │                                     │            │
│    分类  │                                     │  - 发电    │
│  - 告警  │                                     │    曲线    │
│    列表  │                                     │            │
│          │                                     │  - 收益    │
│          │                                     │    统计    │
│          │                                     │            │
├──────────┴─────────────────────────────────────┴────────────┤
│  底部栏 (80px)                                              │
│  [时间轴] [播放控制] [视角切换] [图层控制] [测量工具]        │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 数据面板设计

#### 实时数据面板
```
┌─────────────────────────┐
│ 📊 实时数据             │
├─────────────────────────┤
│ ⚡ 当前出力             │
│    85,000 kW            │
│                         │
│ 💰 小时收益             │
│    35,700 元            │
│                         │
│ ☀️ 当前辐射             │
│    850 W/m²             │
│                         │
│ 📶 弃光率               │
│    3.5%                 │
└─────────────────────────┘
```

#### 收益分析面板
```
┌─────────────────────────┐
│ 💰 收益分析             │
├─────────────────────────┤
│ 今日收益                │
│ ████████░░ 189,000 元   │
│                         │
│ 本月收益                │
│ ████████░░ 5,670,000 元 │
│                         │
│ 累计收益                │
│ ██████████ 5,250 万元   │
│                         │
│ IRR: 10.8%              │
│ 回收期：9.2 年           │
└─────────────────────────┘
```

#### 政策信息面板
```
┌─────────────────────────┐
│ 📜 政策信息             │
├─────────────────────────┤
│ 电价：0.4155 元/kWh     │
│ 峰谷价差：0.4155 元      │
│                         │
│ 省级补贴：0.10 元/kWh    │
│ 市级补贴：0.05 元/kWh    │
│ 剩余年限：2.8 年         │
│                         │
│ 配储要求：10%/2h        │
│ 消纳保障：全额收购       │
└─────────────────────────┘
```

### 5.3 时间轴控制

```javascript
const timelineConfig = {
  // 时间范围
  range: {
    start: '2025-01-01T00:00:00+08:00',
    end: '2026-12-31T23:59:59+08:00',
    current: '2026-03-11T14:00:00+08:00'
  },
  
  // 播放控制
  playback: {
    speed: [0.5, 1, 2, 4, 8],  // 播放速度
    loop: true,  // 循环播放
    autoPlay: false
  },
  
  // 时间粒度
  granularity: ['hour', 'day', 'week', 'month', 'year'],
  
  // 关键时间点
  markers: [
    {time: '2025-12-31', label: '并网日期', type: 'milestone'},
    {time: '2026-01-01', label: '商业运营', type: 'event'}
  ]
};
```

## 6. 技术实现方案

### 6.1 技术栈

| 层级 | 技术选型 | 说明 |
|-----|---------|------|
| 前端框架 | React 18 + TypeScript | 组件化开发 |
| 3D 引擎 | Three.js r150+ | Web 3D 渲染 |
| 地图引擎 | Mapbox GL / Cesium | 地理信息 |
| 图表库 | ECharts 5 | 数据可视化 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 通信 | WebSocket + REST | 实时 + 请求 |
| 后端 | Node.js + Express | API 服务 |
| 数据库 | PostgreSQL + TimescaleDB | 时序数据 |
| 缓存 | Redis | 实时数据缓存 |
| 消息队列 | RabbitMQ | 异步处理 |

### 6.2 核心组件

```javascript
// 3D 场景组件
function DigitalTwinScene({ stationId }) {
  const [station, setStation] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  
  return (
    <Canvas camera={{ position: [0, 100, 100], fov: 60 }}>
      {/* 环境 */}
      <Skybox />
      <SunLight />
      <Terrain />
      
      {/* 电站设备 */}
      <StationModel station={station} />
      <PVArray data={realtimeData?.pv} />
      <StorageSystem data={realtimeData?.storage} />
      
      {/* 数据标注 */}
      <DataLabels data={realtimeData} />
      
      {/* 交互控制 */}
      <OrbitControls />
      <SelectionTool />
    </Canvas>
  );
}

// 数据面板组件
function DataPanel({ stationId }) {
  const { realtime, revenue, policy } = useStationData(stationId);
  
  return (
    <div className="data-panel">
      <RealtimePanel data={realtime} />
      <RevenuePanel data={revenue} />
      <PolicyPanel data={policy} />
    </div>
  );
}

// 时间轴组件
function Timeline({ range, onTimeChange }) {
  const [currentTime, setCurrentTime] = useState(range.current);
  
  return (
    <div className="timeline">
      <TimeSlider 
        value={currentTime}
        onChange={setCurrentTime}
        onRelease={onTimeChange}
      />
      <PlaybackControls 
        onPlay={() => startPlayback()}
        onPause={() => stopPlayback()}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
```

### 6.3 API 接口设计

```javascript
// 电站数据 API
GET /api/stations/:id
GET /api/stations/:id/realtime
GET /api/stations/:id/historical?start=xxx&end=xxx

// 光照数据 API
GET /api/stations/:id/solar/realtime
GET /api/stations/:id/solar/forecast?days=7

// 收益数据 API
GET /api/stations/:id/revenue/realtime
GET /api/stations/:id/revenue/daily
GET /api/stations/:id/revenue/financial

// 政策数据 API
GET /api/policies/:province
GET /api/policies/:province/:city

// 消纳数据 API
GET /api/stations/:id/accommodation/realtime
GET /api/stations/:id/accommodation/statistics

// 并网状态 API
GET /api/stations/:id/grid-connection/status
GET /api/stations/:id/grid-connection/electrical
```

## 7. 实施计划

### 7.1 阶段划分

| 阶段 | 时间 | 目标 | 交付物 |
|-----|------|------|--------|
| P0 | 2 周 | 基础框架 | 3D 场景 + 基础数据 |
| P1 | 3 周 | 数据集成 | 完整数据展示 |
| P2 | 2 周 | 交互优化 | 完整交互功能 |
| P3 | 1 周 | 性能优化 | 生产就绪 |

### 7.2 里程碑

- **Week 1-2**: 3D 场景搭建、基础模型
- **Week 3-5**: 数据 API 集成、实时数据展示
- **Week 6-7**: UI 完善、交互优化
- **Week 8**: 性能测试、上线部署

## 8. 验收标准

### 8.1 功能验收

- [ ] 3D 场景正常加载
- [ ] 实时数据更新 (<5 秒延迟)
- [ ] 历史数据回放功能
- [ ] 政策信息查询
- [ ] 消纳数据展示
- [ ] 并网状态监控

### 8.2 性能验收

- [ ] 首屏加载 <3 秒
- [ ] 3D 渲染 >30 FPS
- [ ] API 响应 <500ms
- [ ] 支持 100+ 并发

### 8.3 体验验收

- [ ] 相机控制流畅
- [ ] 数据标注清晰
- [ ] 响应式布局
- [ ] 多浏览器兼容

---

**文档状态**: ✅ 已完成  
**下次审查**: 2026-03-18
