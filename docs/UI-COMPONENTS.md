# 光储电站数字孪生 - UI 组件库

> 版本：v1.0  
> 日期：2026-03-11  
> 技术栈：React 18 + TypeScript

## 1. 组件清单

### 核心组件

| 组件 | 说明 | 状态 |
|-----|------|------|
| DigitalTwinScene | 3D 场景容器 | ✅ 已完成 |
| DataPanel | 数据面板 | ✅ 已完成 |
| RealtimeStats | 实时统计 | ✅ 已完成 |
| RevenueChart | 收益图表 | ✅ 已完成 |
| PolicyInfo | 政策信息 | ✅ 已完成 |
| Timeline | 时间轴 | ✅ 已完成 |
| ViewControls | 视角控制 | ✅ 已完成 |
| Annotation3D | 3D 标注 | ✅ 已完成 |

## 2. 组件使用示例

### 2.1 3D 场景组件

```jsx
import { DigitalTwinScene } from './components/DigitalTwinScene';

function App() {
  return (
    <DigitalTwinScene
      stationId="STATION_001"
      initialView="overview"
      showAnnotations={true}
      onStationClick={handleStationClick}
    />
  );
}
```

### 2.2 数据面板组件

```jsx
import { DataPanel } from './components/DataPanel';

function Sidebar() {
  const { realtime, revenue, policy } = useStationData('STATION_001');
  
  return (
    <div className="sidebar">
      <DataPanel title="⚡ 实时数据">
        <RealtimeStats data={realtime} />
      </DataPanel>
      
      <DataPanel title="💰 收益分析">
        <RevenueChart data={revenue} />
      </DataPanel>
      
      <DataPanel title="📜 政策信息">
        <PolicyInfo data={policy} />
      </DataPanel>
    </div>
  );
}
```

### 2.3 时间轴组件

```jsx
import { Timeline } from './components/Timeline';

function Footer() {
  return (
    <Timeline
      range={{
        start: '2025-01-01',
        end: '2026-12-31',
        current: '2026-03-11'
      }}
      onTimeChange={handleTimeChange}
      showMarkers={true}
    />
  );
}
```

## 3. 组件 API 文档

### DigitalTwinScene

**Props**:
```typescript
interface DigitalTwinSceneProps {
  stationId: string;
  initialView?: 'overview' | 'equipment' | 'firstPerson';
  showAnnotations?: boolean;
  autoRotate?: boolean;
  onStationClick?: (station: Station) => void;
  onTimeChange?: (time: Date) => void;
}
```

**方法**:
```typescript
interface DigitalTwinSceneMethods {
  setView(view: ViewType): void;
  focusOn(stationId: string): void;
  toggleLayer(layer: string): void;
  takeScreenshot(): string;
}
```

### DataPanel

**Props**:
```typescript
interface DataPanelProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}
```

### RealtimeStats

**Props**:
```typescript
interface RealtimeStatsProps {
  data: RealtimeData;
  updateInterval?: number;
  showTrend?: boolean;
}

interface RealtimeData {
  powerOutputKw: number;
  revenuePerHour: number;
  radiation: number;
  curtailmentRate: number;
}
```

### RevenueChart

**Props**:
```typescript
interface RevenueChartProps {
  data: RevenueData;
  chartType?: 'bar' | 'line' | 'pie';
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

interface RevenueData {
  daily: number;
  monthly: number;
  cumulative: number;
  breakdown: RevenueBreakdown;
}
```

### Timeline

**Props**:
```typescript
interface TimelineProps {
  range: TimeRange;
  onTimeChange: (time: Date) => void;
  onPlay?: () => void;
  onPause?: () => void;
  markers?: TimelineMarker[];
}

interface TimeRange {
  start: string;
  end: string;
  current: string;
}

interface TimelineMarker {
  time: string;
  label: string;
  type: 'milestone' | 'event';
}
```

## 4. 样式规范

### 颜色变量

```css
:root {
  /* 主色 */
  --primary: #667eea;
  --primary-dark: #5568d3;
  --secondary: #764ba2;
  
  /* 功能色 */
  --success: #52c41a;
  --warning: #faad14;
  --danger: #ff4d4f;
  --info: #1890ff;
  
  /* 中性色 */
  --text-primary: #333;
  --text-secondary: #666;
  --text-tertiary: #999;
  --border: #e0e0e0;
  --background: #f5f7fa;
  
  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.12);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.16);
}
```

### 间距规范

```css
/* 间距系统 */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

### 圆角规范

```css
/* 圆角系统 */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

## 5. 响应式设计

### 断点

```css
/* 移动端 */
@media (max-width: 768px) {
  #sidebar-left,
  #sidebar-right {
    display: none;
  }
  
  #footer {
    flex-wrap: wrap;
    height: auto;
    padding: 15px;
  }
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  #sidebar-left {
    width: 250px;
  }
  
  #sidebar-right {
    width: 300px;
  }
}

/* 桌面 */
@media (min-width: 1025px) {
  #sidebar-left {
    width: 300px;
  }
  
  #sidebar-right {
    width: 350px;
  }
}
```

## 6. 性能优化

### 组件懒加载

```jsx
import { lazy, Suspense } from 'react';

const DigitalTwinScene = lazy(() => 
  import('./components/DigitalTwinScene')
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DigitalTwinScene stationId="STATION_001" />
    </Suspense>
  );
}
```

### 数据缓存

```jsx
import useSWR from 'swr';

function useStationData(stationId) {
  const { data, error } = useSWR(
    `/api/stations/${stationId}`,
    fetcher,
    {
      refreshInterval: 5000,  // 5 秒刷新
      dedupingInterval: 1000  // 1 秒去重
    }
  );
  
  return {
    realtime: data?.realtime,
    revenue: data?.revenue,
    policy: data?.policy,
    loading: !data && !error,
    error
  };
}
```

### 3D 渲染优化

```jsx
// 使用 instanced rendering 渲染大量相同物体
function PVArray({ count = 100 }) {
  const meshRef = useRef();
  
  useEffect(() => {
    const mesh = meshRef.current;
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        (i % 10) * 30 - 150,
        0,
        Math.floor(i / 10) * 30 - 150
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
  }, [count]);
  
  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <boxGeometry args={[2, 0.1, 1]} />
      <meshStandardMaterial color="#1e3a8a" />
    </instancedMesh>
  );
}
```

## 7. 测试

### 单元测试

```jsx
import { render, screen } from '@testing-library/react';
import { DataPanel } from './DataPanel';

describe('DataPanel', () => {
  it('renders title correctly', () => {
    render(<DataPanel title="Test Panel">Content</DataPanel>);
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
  });
  
  it('renders children', () => {
    render(<DataPanel title="Test">Child Content</DataPanel>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
```

### 集成测试

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import { DigitalTwinScene } from './DigitalTwinScene';

describe('DigitalTwinScene', () => {
  it('loads station data on mount', async () => {
    render(<DigitalTwinScene stationId="STATION_001" />);
    
    await waitFor(() => {
      expect(screen.getByText(/85,000 kW/)).toBeInTheDocument();
    });
  });
});
```

---

**组件库状态**: ✅ 已完成  
**下次更新**: 2026-03-18
