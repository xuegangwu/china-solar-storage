#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
光储项目投资评估模型 v0.2
支持参数动态调节
"""

import json

class InvestmentEvaluator:
    """投资评估器 - 支持参数调节"""
    
    def __init__(self, weights=None):
        """
        初始化评估器
        
        Args:
            weights: 权重配置，默认值：
                {
                    "resource": 0.15,      # 资源条件
                    "price": 0.20,         # 电价水平
                    "policy": 0.15,        # 政策支持
                    "grid": 0.50           # 消纳条件 (核心)
                }
        """
        self.weights = weights or {
            "resource": 0.15,
            "price": 0.20,
            "policy": 0.15,
            "grid": 0.50
        }
        
        # 验证权重和为 1
        total = sum(self.weights.values())
        if abs(total - 1.0) > 0.01:
            raise ValueError(f"权重和必须为 1，当前为{total}")
    
    def evaluate_resource_condition(self, annual_hours):
        """评估资源条件（基于年等效利用小时）"""
        if annual_hours >= 1500:
            return 100
        elif annual_hours >= 1300:
            return 80
        elif annual_hours >= 1100:
            return 60
        elif annual_hours >= 900:
            return 40
        else:
            return 20
    
    def evaluate_price_level(self, benchmark_price, peak_valley_spread=0, market_rate=0.9):
        """
        评估电价水平
        
        Args:
            benchmark_price: 燃煤基准价（元/kWh）
            peak_valley_spread: 峰谷价差（元/kWh）
            market_rate: 市场化交易系数（0-1，越低表示市场化后电价越低）
        """
        # 考虑市场化后的实际电价
        actual_price = benchmark_price * market_rate
        
        # 基准价得分
        if actual_price >= 0.45:
            base_score = 100
        elif actual_price >= 0.40:
            base_score = 80
        elif actual_price >= 0.35:
            base_score = 60
        elif actual_price >= 0.30:
            base_score = 40
        else:
            base_score = 20
        
        # 峰谷价差加分（对储能尤其重要）
        if peak_valley_spread >= 0.8:
            spread_bonus = 25
        elif peak_valley_spread >= 0.6:
            spread_bonus = 20
        elif peak_valley_spread >= 0.4:
            spread_bonus = 15
        elif peak_valley_spread >= 0.3:
            spread_bonus = 10
        else:
            spread_bonus = 5
        
        return min(base_score + spread_bonus, 100)
    
    def evaluate_policy_support(self, policies):
        """评估政策支持"""
        base_score = 50  # 基础分降低，补贴退坡
        policy_scores = {
            'provincial_subsidy': 30,
            'city_subsidy': 15,
            'tax_benefit': 15,
            'land_benefit': 10,
            'grid_guarantee': 20,  # 消纳保障更重要
            'approval_fast': 10    # 审批绿色通道
        }
        
        for policy, enabled in policies.items():
            if enabled and policy in policy_scores:
                base_score += policy_scores[policy]
        
        return min(base_score, 100)
    
    def evaluate_grid_condition(self, curtailed_rate, grid_capacity_rate=0.8):
        """
        评估消纳条件（核心指标）
        
        Args:
            curtailed_rate: 弃光率（%）
            grid_capacity_rate: 电网剩余容量比例（0-1，越低越难接入）
        """
        # 弃光率得分（更严格）
        if curtailed_rate < 2:
            curtailed_score = 100
        elif curtailed_rate < 4:
            curtailed_score = 80
        elif curtailed_rate < 6:
            curtailed_score = 60
        elif curtailed_rate < 10:
            curtailed_score = 40
        elif curtailed_rate < 15:
            curtailed_score = 20
        else:
            curtailed_score = 10
        
        # 电网容量系数调节
        final_score = curtailed_score * grid_capacity_rate
        
        return max(final_score, 0)
    
    def calculate_investment_grade(self, total_score):
        """计算投资等级"""
        if total_score >= 85:
            return 'A', '优先投资'
        elif total_score >= 70:
            return 'B', '推荐投资'
        elif total_score >= 55:
            return 'C', '谨慎投资'
        else:
            return 'D', '暂不建议'
    
    def evaluate_province(self, province_data):
        """
        综合评估一个省份
        
        Args:
            province_data: 省份数据字典
                {
                    "name": "省份名",
                    "annual_hours": 年等效利用小时，
                    "benchmark_price": 燃煤基准价，
                    "peak_valley_spread": 峰谷价差，
                    "market_rate": 市场化系数 (可选，默认 0.9),
                    "curtailed_rate": 弃光率，
                    "grid_capacity_rate": 电网容量系数 (可选，默认 0.8),
                    "policies": {政策字典}
                }
        """
        resource_score = self.evaluate_resource_condition(
            province_data.get('annual_hours', 1100)
        )
        
        price_score = self.evaluate_price_level(
            province_data.get('benchmark_price', 0.35),
            province_data.get('peak_valley_spread', 0.3),
            province_data.get('market_rate', 0.9)
        )
        
        policy_score = self.evaluate_policy_support(
            province_data.get('policies', {})
        )
        
        grid_score = self.evaluate_grid_condition(
            province_data.get('curtailed_rate', 5),
            province_data.get('grid_capacity_rate', 0.8)
        )
        
        total_score = (
            resource_score * self.weights['resource'] +
            price_score * self.weights['price'] +
            policy_score * self.weights['policy'] +
            grid_score * self.weights['grid']
        )
        
        grade, suggestion = self.calculate_investment_grade(total_score)
        
        return {
            'province': province_data.get('name', 'Unknown'),
            'scores': {
                'resource': resource_score,
                'price': price_score,
                'policy': policy_score,
                'grid': grid_score,
                'total': round(total_score, 2)
            },
            'grade': grade,
            'suggestion': suggestion
        }
    
    def get_weights(self):
        """返回当前权重配置"""
        return self.weights.copy()
    
    def set_weights(self, weights):
        """设置新的权重配置"""
        total = sum(weights.values())
        if abs(total - 1.0) > 0.01:
            raise ValueError(f"权重和必须为 1，当前为{total}")
        self.weights = weights.copy()


def calculate_roi(province_data, capacity_mw=100, investment_per_mw=350):
    """
    简易 ROI 计算器
    
    Args:
        province_data: 省份数据
        capacity_mw: 装机容量 (MW)
        investment_per_mw: 单位投资 (万元/MW)
    
    Returns:
        ROI 估算字典
    """
    # 年收入估算
    annual_hours = province_data.get('annual_hours', 1200)
    actual_price = province_data.get('benchmark_price', 0.35) * province_data.get('market_rate', 0.9)
    
    # 考虑弃光后的实际发电小时
    curtailed_rate = province_data.get('curtailed_rate', 5) / 100
    effective_hours = annual_hours * (1 - curtailed_rate)
    
    # 年收入（万元）
    annual_revenue = capacity_mw * 1000 * effective_hours * actual_price / 10000
    
    # 年运维成本（按投资额 2% 估算）
    total_investment = capacity_mw * investment_per_mw
    annual_opex = total_investment * 0.02
    
    # 年净收益
    annual_net = annual_revenue - annual_opex
    
    # 静态投资回收期（年）
    payback_years = total_investment / annual_net if annual_net > 0 else float('inf')
    
    # IRR 估算（简化，假设 25 年运营期）
    irr_approx = (annual_net / total_investment) * 100 if total_investment > 0 else 0
    
    return {
        'capacity_mw': capacity_mw,
        'total_investment': round(total_investment, 2),  # 万元
        'annual_revenue': round(annual_revenue, 2),  # 万元
        'annual_opex': round(annual_opex, 2),  # 万元
        'annual_net': round(annual_net, 2),  # 万元
        'payback_years': round(payback_years, 2) if payback_years != float('inf') else 'N/A',
        'irr_approx': round(irr_approx, 2)
    }


# 示例使用
if __name__ == '__main__':
    # 使用新权重：消纳 50%
    evaluator = InvestmentEvaluator(weights={
        "resource": 0.15,
        "price": 0.20,
        "policy": 0.15,
        "grid": 0.50
    })
    
    print("=" * 70)
    print("中国区光储电站投资评估报告 v0.2")
    print(f"权重配置：资源{evaluator.weights['resource']*100:.0f}% | "
          f"电价{evaluator.weights['price']*100:.0f}% | "
          f"政策{evaluator.weights['policy']*100:.0f}% | "
          f"消纳{evaluator.weights['grid']*100:.0f}%")
    print("=" * 70)
    
    sample_provinces = [
        {
            'name': '山东省',
            'annual_hours': 1300,
            'benchmark_price': 0.3949,
            'peak_valley_spread': 0.85,
            'market_rate': 0.85,  # 市场化后电价打折
            'curtailed_rate': 8.0,  # 消纳问题
            'grid_capacity_rate': 0.6,  # 电网容量紧张
            'policies': {
                'provincial_subsidy': False,
                'city_subsidy': False,
                'tax_benefit': True,
                'land_benefit': False,
                'grid_guarantee': False,
                'approval_fast': False
            }
        },
        {
            'name': '江苏省',
            'annual_hours': 1200,
            'benchmark_price': 0.391,
            'peak_valley_spread': 0.75,
            'market_rate': 0.88,
            'curtailed_rate': 4.0,
            'grid_capacity_rate': 0.7,
            'policies': {
                'provincial_subsidy': True,
                'city_subsidy': False,
                'tax_benefit': True,
                'land_benefit': False,
                'grid_guarantee': True,
                'approval_fast': False
            }
        },
        {
            'name': '甘肃省',
            'annual_hours': 1500,
            'benchmark_price': 0.3078,
            'peak_valley_spread': 0.5,
            'market_rate': 0.95,
            'curtailed_rate': 12.0,  # 弃光严重
            'grid_capacity_rate': 0.5,  # 电网薄弱
            'policies': {
                'provincial_subsidy': False,
                'city_subsidy': False,
                'tax_benefit': True,
                'land_benefit': True,
                'grid_guarantee': False,
                'approval_fast': False
            }
        },
        {
            'name': '浙江省',
            'annual_hours': 1100,
            'benchmark_price': 0.4155,
            'peak_valley_spread': 0.9,  # 峰谷价差大
            'market_rate': 0.9,
            'curtailed_rate': 2.0,  # 消纳好
            'grid_capacity_rate': 0.85,
            'policies': {
                'provincial_subsidy': True,
                'city_subsidy': True,
                'tax_benefit': True,
                'land_benefit': False,
                'grid_guarantee': True,
                'approval_fast': True
            }
        }
    ]
    
    for province in sample_provinces:
        result = evaluator.evaluate_province(province)
        roi = calculate_roi(province, capacity_mw=100)
        
        print(f"\n{'='*60}")
        print(f"📍 {result['province']}")
        print(f"{'='*60}")
        print(f"  资源条件：{result['scores']['resource']:5.1f} 分  (年利用{province.get('annual_hours', 'N/A')}h)")
        print(f"  电价水平：{result['scores']['price']:5.1f} 分  (基准{province.get('benchmark_price', 'N/A')}元)")
        print(f"  政策支持：{result['scores']['policy']:5.1f} 分")
        print(f"  消纳条件：{result['scores']['grid']:5.1f} 分  (弃光{province.get('curtailed_rate', 'N/A')}%)")
        print(f"  ─────────────────────────────────")
        print(f"  总分：{result['scores']['total']:5.1f} 分 → 投资等级：{result['grade']}级 - {result['suggestion']}")
        print(f"\n  💰 ROI 估算 (100MW 项目):")
        print(f"     总投资：{roi['total_investment']} 万元")
        print(f"     年收入：{roi['annual_revenue']} 万元")
        print(f"     年净收益：{roi['annual_net']} 万元")
        print(f"     投资回收期：{roi['payback_years']} 年")
        print(f"     估算 IRR: {roi['irr_approx']}%")
