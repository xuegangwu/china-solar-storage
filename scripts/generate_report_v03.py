#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成 31 省完整评估报告 v0.3
使用行业经验值快速生成第一版
"""

import json
from datetime import datetime
from pathlib import Path

# 引入评估器
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "models"))
from evaluator import InvestmentEvaluator, calculate_roi

# 31 省完整数据（经验值）
PROVINCES_DATA = [
    # 西北地区（光照好，消纳差）
    {
        "name": "青海省", "abbr": "青海",
        "annual_hours": 1650, "benchmark_price": 0.3247,
        "peak_valley_spread": 0.45, "market_rate": 0.92,
        "curtailed_rate": 6.0, "grid_capacity_rate": 0.55,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": True, "grid_guarantee": False, "approval_fast": False}
    },
    {
        "name": "甘肃省", "abbr": "甘肃",
        "annual_hours": 1550, "benchmark_price": 0.3078,
        "peak_valley_spread": 0.50, "market_rate": 0.95,
        "curtailed_rate": 12.0, "grid_capacity_rate": 0.45,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": True, "grid_guarantee": False, "approval_fast": False}
    },
    {
        "name": "新疆", "abbr": "新疆",
        "annual_hours": 1500, "benchmark_price": 0.2620,
        "peak_valley_spread": 0.40, "market_rate": 0.90,
        "curtailed_rate": 15.0, "grid_capacity_rate": 0.40,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": True, "grid_guarantee": False, "approval_fast": False}
    },
    {
        "name": "宁夏", "abbr": "宁夏",
        "annual_hours": 1480, "benchmark_price": 0.3019,
        "peak_valley_spread": 0.45, "market_rate": 0.93,
        "curtailed_rate": 8.0, "grid_capacity_rate": 0.50,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": True, "grid_guarantee": False, "approval_fast": False}
    },
    {
        "name": "内蒙古", "abbr": "内蒙古",
        "annual_hours": 1450, "benchmark_price": 0.3020,
        "peak_valley_spread": 0.50, "market_rate": 0.88,
        "curtailed_rate": 7.0, "grid_capacity_rate": 0.55,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": True, "grid_guarantee": False, "approval_fast": False}
    },
    
    # 华北地区（资源较好，消纳一般）
    {
        "name": "河北省", "abbr": "河北",
        "annual_hours": 1300, "benchmark_price": 0.3644,
        "peak_valley_spread": 0.70, "market_rate": 0.87,
        "curtailed_rate": 5.0, "grid_capacity_rate": 0.65,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "山东省", "abbr": "山东",
        "annual_hours": 1280, "benchmark_price": 0.3949,
        "peak_valley_spread": 0.85, "market_rate": 0.85,
        "curtailed_rate": 8.0, "grid_capacity_rate": 0.60,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": False, "approval_fast": False}
    },
    {
        "name": "山西省", "abbr": "山西",
        "annual_hours": 1320, "benchmark_price": 0.3320,
        "peak_valley_spread": 0.65, "market_rate": 0.90,
        "curtailed_rate": 6.0, "grid_capacity_rate": 0.60,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "北京市", "abbr": "北京",
        "annual_hours": 1280, "benchmark_price": 0.3939,
        "peak_valley_spread": 0.80, "market_rate": 0.90,
        "curtailed_rate": 2.0, "grid_capacity_rate": 0.80,
        "policies": {"provincial_subsidy": False, "city_subsidy": True, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": True}
    },
    {
        "name": "天津市", "abbr": "天津",
        "annual_hours": 1260, "benchmark_price": 0.3781,
        "peak_valley_spread": 0.75, "market_rate": 0.88,
        "curtailed_rate": 3.0, "grid_capacity_rate": 0.75,
        "policies": {"provincial_subsidy": False, "city_subsidy": True, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "河南省", "abbr": "河南",
        "annual_hours": 1250, "benchmark_price": 0.3695,
        "peak_valley_spread": 0.70, "market_rate": 0.88,
        "curtailed_rate": 4.0, "grid_capacity_rate": 0.70,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    
    # 华东地区（消纳好，电价高，资源一般）
    {
        "name": "江苏省", "abbr": "江苏",
        "annual_hours": 1180, "benchmark_price": 0.3910,
        "peak_valley_spread": 0.75, "market_rate": 0.88,
        "curtailed_rate": 4.0, "grid_capacity_rate": 0.70,
        "policies": {"provincial_subsidy": True, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "浙江省", "abbr": "浙江",
        "annual_hours": 1100, "benchmark_price": 0.4155,
        "peak_valley_spread": 0.90, "market_rate": 0.90,
        "curtailed_rate": 2.0, "grid_capacity_rate": 0.85,
        "policies": {"provincial_subsidy": True, "city_subsidy": True, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": True}
    },
    {
        "name": "安徽省", "abbr": "安徽",
        "annual_hours": 1200, "benchmark_price": 0.3716,
        "peak_valley_spread": 0.70, "market_rate": 0.89,
        "curtailed_rate": 3.5, "grid_capacity_rate": 0.72,
        "policies": {"provincial_subsidy": True, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "上海市", "abbr": "上海",
        "annual_hours": 1150, "benchmark_price": 0.4155,
        "peak_valley_spread": 0.85, "market_rate": 0.92,
        "curtailed_rate": 1.5, "grid_capacity_rate": 0.85,
        "policies": {"provincial_subsidy": False, "city_subsidy": True, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": True}
    },
    {
        "name": "江西省", "abbr": "江西",
        "annual_hours": 1100, "benchmark_price": 0.3830,
        "peak_valley_spread": 0.65, "market_rate": 0.90,
        "curtailed_rate": 3.0, "grid_capacity_rate": 0.75,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "福建省", "abbr": "福建",
        "annual_hours": 1150, "benchmark_price": 0.3932,
        "peak_valley_spread": 0.70, "market_rate": 0.91,
        "curtailed_rate": 2.5, "grid_capacity_rate": 0.78,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    
    # 华南地区
    {
        "name": "广东省", "abbr": "广东",
        "annual_hours": 1200, "benchmark_price": 0.4530,
        "peak_valley_spread": 0.85, "market_rate": 0.90,
        "curtailed_rate": 3.0, "grid_capacity_rate": 0.75,
        "policies": {"provincial_subsidy": False, "city_subsidy": True, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "广西", "abbr": "广西",
        "annual_hours": 1150, "benchmark_price": 0.3828,
        "peak_valley_spread": 0.65, "market_rate": 0.90,
        "curtailed_rate": 3.5, "grid_capacity_rate": 0.72,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "海南省", "abbr": "海南",
        "annual_hours": 1250, "benchmark_price": 0.4298,
        "peak_valley_spread": 0.70, "market_rate": 0.92,
        "curtailed_rate": 2.0, "grid_capacity_rate": 0.80,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    
    # 华中地区
    {
        "name": "湖北省", "abbr": "湖北",
        "annual_hours": 1100, "benchmark_price": 0.3891,
        "peak_valley_spread": 0.70, "market_rate": 0.89,
        "curtailed_rate": 3.5, "grid_capacity_rate": 0.73,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "湖南省", "abbr": "湖南",
        "annual_hours": 1080, "benchmark_price": 0.3880,
        "peak_valley_spread": 0.68, "market_rate": 0.89,
        "curtailed_rate": 4.0, "grid_capacity_rate": 0.70,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    
    # 东北地区
    {
        "name": "辽宁省", "abbr": "辽宁",
        "annual_hours": 1200, "benchmark_price": 0.3749,
        "peak_valley_spread": 0.65, "market_rate": 0.88,
        "curtailed_rate": 5.0, "grid_capacity_rate": 0.65,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "吉林省", "abbr": "吉林",
        "annual_hours": 1180, "benchmark_price": 0.3731,
        "peak_valley_spread": 0.60, "market_rate": 0.88,
        "curtailed_rate": 5.5, "grid_capacity_rate": 0.62,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "黑龙江省", "abbr": "黑龙江",
        "annual_hours": 1150, "benchmark_price": 0.3731,
        "peak_valley_spread": 0.58, "market_rate": 0.87,
        "curtailed_rate": 6.0, "grid_capacity_rate": 0.60,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    
    # 西南地区
    {
        "name": "四川省", "abbr": "四川",
        "annual_hours": 1050, "benchmark_price": 0.3515,
        "peak_valley_spread": 0.60, "market_rate": 0.90,
        "curtailed_rate": 3.0, "grid_capacity_rate": 0.75,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "云南省", "abbr": "云南",
        "annual_hours": 1150, "benchmark_price": 0.3358,
        "peak_valley_spread": 0.55, "market_rate": 0.90,
        "curtailed_rate": 2.5, "grid_capacity_rate": 0.78,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "贵州省", "abbr": "贵州",
        "annual_hours": 1100, "benchmark_price": 0.3586,
        "peak_valley_spread": 0.60, "market_rate": 0.89,
        "curtailed_rate": 4.0, "grid_capacity_rate": 0.70,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "重庆市", "abbr": "重庆",
        "annual_hours": 1000, "benchmark_price": 0.3515,
        "peak_valley_spread": 0.65, "market_rate": 0.88,
        "curtailed_rate": 4.5, "grid_capacity_rate": 0.68,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
    {
        "name": "陕西省", "abbr": "陕西",
        "annual_hours": 1350, "benchmark_price": 0.3545,
        "peak_valley_spread": 0.60, "market_rate": 0.90,
        "curtailed_rate": 5.0, "grid_capacity_rate": 0.65,
        "policies": {"provincial_subsidy": False, "city_subsidy": False, "tax_benefit": True, "land_benefit": False, "grid_guarantee": True, "approval_fast": False}
    },
]


def generate_report():
    """生成 31 省完整评估报告"""
    
    # 使用新权重：消纳 50%
    evaluator = InvestmentEvaluator(weights={
        "resource": 0.15,
        "price": 0.20,
        "policy": 0.15,
        "grid": 0.50
    })
    
    print("=" * 80)
    print("中国区光储电站投资评估报告 v0.3 - 31 省完整版")
    print(f"生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"权重配置：资源{evaluator.weights['resource']*100:.0f}% | "
          f"电价{evaluator.weights['price']*100:.0f}% | "
          f"政策{evaluator.weights['policy']*100:.0f}% | "
          f"消纳{evaluator.weights['grid']*100:.0f}%")
    print("=" * 80)
    
    results = []
    
    for province in PROVINCES_DATA:
        result = evaluator.evaluate_province(province)
        roi = calculate_roi(province, capacity_mw=100)
        results.append({**result, "roi": roi})
    
    # 按总分排序
    results.sort(key=lambda x: x["scores"]["total"], reverse=True)
    
    # 打印摘要
    print(f"\n{'排名':<4} {'省份':<8} {'总分':<6} {'等级':<4} {'建议':<10} {'回收期':<8}")
    print("-" * 80)
    
    for i, r in enumerate(results, 1):
        payback = r["roi"]["payback_years"]
        if isinstance(payback, float):
            payback_str = f"{payback:.1f}年"
        else:
            payback_str = "N/A"
        
        print(f"{i:<4} {r['province']:<8} {r['scores']['total']:<6.1f} {r['grade']:<4} {r['suggestion']:<10} {payback_str:<8}")
    
    # 统计
    grade_count = {"A": 0, "B": 0, "C": 0, "D": 0}
    for r in results:
        grade_count[r["grade"]] += 1
    
    print("\n" + "=" * 80)
    print("投资等级分布:")
    print(f"  A 级 (优先投资): {grade_count['A']} 省")
    print(f"  B 级 (推荐投资): {grade_count['B']} 省")
    print(f"  C 级 (谨慎投资): {grade_count['C']} 省")
    print(f"  D 级 (暂不建议): {grade_count['D']} 省")
    print("=" * 80)
    
    # 保存 JSON
    output_path = Path(__file__).parent.parent / "data" / "processed" / "province_evaluation.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "weights": evaluator.get_weights(),
            "version": "v0.3",
            "data": results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 数据已保存至：{output_path}")
    
    # 保存 Markdown 报告
    md_path = Path(__file__).parent.parent / "docs" / "evaluation-report-v0.3.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# 中国区光储电站投资评估报告 v0.3\n\n")
        f.write(f"> 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
        f.write(f"> 数据来源：行业经验值（第一版）\n\n")
        f.write("## 评估权重\n\n")
        f.write("| 维度 | 权重 |\n|-----|------|\n")
        for k, v in evaluator.get_weights().items():
            names = {"resource": "资源条件", "price": "电价水平", "policy": "政策支持", "grid": "消纳条件"}
            f.write(f"| {names[k]} | {v*100:.0f}% |\n")
        
        f.write("\n## 完整排名\n\n")
        f.write(f"{'排名':<4} {'省份':<8} {'总分':<6} {'等级':<4} {'建议':<12} {'回收期':<8}\n")
        f.write("-" * 80 + "\n")
        
        for i, r in enumerate(results, 1):
            payback = r["roi"]["payback_years"]
            payback_str = f"{payback:.1f}年" if isinstance(payback, float) else "N/A"
            f.write(f"{i:<4} {r['province']:<8} {r['scores']['total']:<6.1f} {r['grade']:<4} {r['suggestion']:<12} {payback_str:<8}\n")
        
        f.write("\n## 投资等级分布\n\n")
        f.write(f"- A 级 (优先投资): {grade_count['A']} 省\n")
        f.write(f"- B 级 (推荐投资): {grade_count['B']} 省\n")
        f.write(f"- C 级 (谨慎投资): {grade_count['C']} 省\n")
        f.write(f"- D 级 (暂不建议): {grade_count['D']} 省\n")
    
    print(f"📄 报告已保存至：{md_path}")
    
    return results


if __name__ == "__main__":
    generate_report()
