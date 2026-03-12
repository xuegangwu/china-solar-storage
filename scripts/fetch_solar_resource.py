#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NASA SSE 光照资源数据获取脚本
免费 API，无需 key
"""

import requests
import json
from datetime import datetime
from pathlib import Path

# NASA POWER API 基础 URL
NASA_API_BASE = "https://power.larc.nasa.gov/api"

# 中国主要城市坐标（省会）
CHINA_CITIES = {
    "北京": {"lat": 39.9042, "lon": 116.4074},
    "天津": {"lat": 39.3434, "lon": 117.3616},
    "上海": {"lat": 31.2304, "lon": 121.4737},
    "重庆": {"lat": 29.4316, "lon": 106.9123},
    "河北": {"lat": 38.0428, "lon": 114.5149},  # 石家庄
    "河南": {"lat": 34.7466, "lon": 113.6253},  # 郑州
    "云南": {"lat": 25.0389, "lon": 102.7183},  # 昆明
    "辽宁": {"lat": 41.8057, "lon": 123.4315},  # 沈阳
    "黑龙江": {"lat": 45.8038, "lon": 126.5340},  # 哈尔滨
    "湖南": {"lat": 28.2282, "lon": 112.9388},  # 长沙
    "安徽": {"lat": 31.8206, "lon": 117.2272},  # 合肥
    "山东": {"lat": 36.6512, "lon": 117.1209},  # 济南
    "新疆": {"lat": 43.8256, "lon": 87.6168},  # 乌鲁木齐
    "江苏": {"lat": 32.0603, "lon": 118.7969},  # 南京
    "浙江": {"lat": 30.2741, "lon": 120.1551},  # 杭州
    "江西": {"lat": 28.6829, "lon": 115.8579},  # 南昌
    "湖北": {"lat": 30.5928, "lon": 114.3055},  # 武汉
    "广西": {"lat": 22.8170, "lon": 108.3665},  # 南宁
    "甘肃": {"lat": 36.0611, "lon": 103.8343},  # 兰州
    "山西": {"lat": 37.8706, "lon": 112.5489},  # 太原
    "内蒙古": {"lat": 40.8414, "lon": 111.7519},  # 呼和浩特
    "陕西": {"lat": 34.3416, "lon": 108.9398},  # 西安
    "吉林": {"lat": 43.8171, "lon": 125.3235},  # 长春
    "福建": {"lat": 26.0745, "lon": 119.2965},  # 福州
    "贵州": {"lat": 26.6470, "lon": 106.6302},  # 贵阳
    "广东": {"lat": 23.1291, "lon": 113.2644},  # 广州
    "青海": {"lat": 36.6171, "lon": 101.7782},  # 西宁
    "西藏": {"lat": 29.6500, "lon": 91.1409},  # 拉萨
    "四川": {"lat": 30.5728, "lon": 104.0668},  # 成都
    "宁夏": {"lat": 38.4872, "lon": 106.2309},  # 银川
    "海南": {"lat": 20.0444, "lon": 110.1999},  # 海口
}


def fetch_solar_resource(province, year=2023):
    """
    获取某省光照资源数据
    
    Args:
        province: 省份名称
        year: 年份（用于记录，实际获取多年平均）
    
    Returns:
        光照数据字典
    """
    if province not in CHINA_CITIES:
        print(f"⚠️  未知省份：{province}")
        return None
    
    coords = CHINA_CITIES[province]
    
    # API 参数 - 使用 climatology 气候平均数据
    params = {
        "temporal": "climatology",
        "parameters": "ALLSKY_SFC_SW_DWN",  # 表面太阳辐射
        "community": "RE",  # 可再生能源
        "longitude": coords["lon"],
        "latitude": coords["lat"],
        "format": "JSON"
    }
    
    try:
        response = requests.get(f"{NASA_API_BASE}/climatology/point", params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # 估算年等效利用小时
        # 经验公式：年等效小时 ≈ 年辐射量 (kWh/m²) × 系统效率 × 组件转换效率
        # 简化：年辐射量 (kWh/m²/day) × 365 × 0.8 (系统效率) × 0.18 (组件效率) / 1 (标准光照)
        annual_hours = avg_radiation * 365 * 0.8 * 0.18 / 1.0
        
        # 解析 climatology 数据
        if "properties" not in data:
            print(f"❌ {province} 数据解析失败")
            return None
        
        # climatology 返回的是月平均
        monthly_radiation = data["properties"].get("parameter", {}).get("ALLSKY_SFC_SW_DWN", {})
        
        values = [v for v in monthly_radiation.values() if v is not None]
        if not values:
            return None
        
        avg_radiation = sum(values) / len(values)
        result = {
            "province": province,
            "year": year,  # 记录年份
            "avg_daily_radiation": round(avg_radiation, 2),  # kWh/m²/day
            "annual_radiation": round(avg_radiation * 365, 0),  # kWh/m²/year
            "estimated_hours": round(annual_hours, 0),  # 年等效利用小时
            "latitude": coords["lat"],
            "longitude": coords["lon"],
            "source": "NASA POWER API (Climatology)",
            "fetched_at": datetime.now().isoformat()
        }
        
        return result


def fetch_all_provinces(year=2023, output_file="data/raw/solar_resource.json"):
    """
    批量获取所有省份光照数据
    
    Args:
        year: 年份
        output_file: 输出文件路径
    """
    print(f"🌞 开始获取 {year} 年全国各省光照资源数据...")
    print(f"📍 数据源：NASA POWER API")
    print("-" * 60)
    
    results = []
    
    for i, province in enumerate(CHINA_CITIES.keys(), 1):
        print(f"[{i}/{len(CHINA_CITIES)}] {province}...", end=" ")
        
        result = fetch_solar_resource(province, year)
        if result:
            results.append(result)
            print(f"✅ {result['estimated_hours']}h")
        else:
            print("❌ 失败")
        
        # 避免请求过快
        import time
        time.sleep(0.5)
    
    # 保存到文件
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "year": year,
            "source": "NASA POWER API",
            "fetched_at": datetime.now().isoformat(),
            "data": results
        }, f, ensure_ascii=False, indent=2)
    
    print("-" * 60)
    print(f"✅ 完成！共获取 {len(results)}/{len(CHINA_CITIES)} 个省份")
    print(f"📁 数据已保存至：{output_file}")
    
    return results


def print_summary(data):
    """打印光照资源摘要"""
    if not data:
        return
    
    print("\n" + "=" * 60)
    print("中国各省光照资源排名 (年等效利用小时)")
    print("=" * 60)
    
    # 按年等效小时排序
    sorted_data = sorted(data, key=lambda x: x["estimated_hours"], reverse=True)
    
    print(f"{'排名':<4} {'省份':<8} {'年辐射量':<10} {'等效小时':<8} {'等级':<6}")
    print("-" * 60)
    
    for i, item in enumerate(sorted_data, 1):
        # 资源等级
        if item["estimated_hours"] >= 1500:
            grade = "一类"
        elif item["estimated_hours"] >= 1300:
            grade = "二类"
        elif item["estimated_hours"] >= 1100:
            grade = "三类"
        else:
            grade = "四类"
        
        print(f"{i:<4} {item['province']:<8} {item['annual_radiation']:<10} {item['estimated_hours']:<8} {grade:<6}")
    
    # 统计
    avg_hours = sum(d["estimated_hours"] for d in data) / len(data)
    max_hours = max(d["estimated_hours"] for d in data)
    min_hours = min(d["estimated_hours"] for d in data)
    
    print("-" * 60)
    print(f"全国平均：{avg_hours:.0f}h")
    print(f"最高：{max_hours}h | 最低：{min_hours}h")
    print("=" * 60)


if __name__ == "__main__":
    import sys
    
    year = 2023
    if len(sys.argv) > 1:
        year = int(sys.argv[1])
    
    # 获取数据
    data = fetch_all_provinces(year)
    
    # 打印摘要
    print_summary(data)
    
    # 示例：获取单个省份
    # result = fetch_solar_resource("山东", 2023)
    # print(json.dumps(result, ensure_ascii=False, indent=2))
