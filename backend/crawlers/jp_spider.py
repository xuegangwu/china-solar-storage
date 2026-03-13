#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日本政策信息采集爬虫
采集来源：经产省、环境省
"""

import json
from datetime import datetime

class JapanPolicySpider:
    """日本政策爬虫"""
    
    def __init__(self):
        self.base_url = "https://www.meti.go.jp"
    
    def fetch_policies(self):
        """获取政策列表（示例数据）"""
        policies = [
            {
                'title': '日本经产省：2030 年可再生能源目标提升至 36-38%',
                'title_en': 'Japan METI: 2030 Renewable Target Raised to 36-38%',
                'title_jp': '経産省：2030 年再生可能エネルギー目標を 36-38% に引き上げ',
                'link': 'https://www.meti.go.jp/2026-03-renewable-target',
                'date': '2026-03-07',
                'agency': '日本经济产业省',
                'agency_en': 'Ministry of Economy, Trade and Industry',
                'category': 'development_plan'
            },
            {
                'title': '日本：FIT 制度向 FIP 制度过渡细则发布',
                'title_en': 'Japan: FIT to FIP Transition Rules Released',
                'title_jp': '日本：FIT 制度から FIP 制度への移行细则发布',
                'link': 'https://www.meti.go.jp/2026-03-fit-fip',
                'date': '2026-03-04',
                'agency': '日本经济产业省',
                'agency_en': 'METI',
                'category': 'feed_in_tariff'
            },
            {
                'title': '日本：海上风电促进法实施细则',
                'title_en': 'Japan: Offshore Wind Promotion Act Implementation Rules',
                'title_jp': '日本：洋上風力発電促進法実施細則',
                'link': 'https://www.meti.go.jp/2026-03-offshore-wind',
                'date': '2026-03-01',
                'agency': '日本经济产业省',
                'agency_en': 'METI',
                'category': 'wind_policy'
            },
            {
                'title': '日本：储能系统补贴计划 2026 年度预算',
                'title_en': 'Japan: Energy Storage Subsidy Program FY2026 Budget',
                'title_jp': '日本：蓄電システム補助金 2026 年度予算',
                'link': 'https://www.meti.go.jp/2026-02-storage-subsidy',
                'date': '2026-02-28',
                'agency': '日本经济产业省',
                'agency_en': 'METI',
                'category': 'storage_policy'
            },
            {
                'title': '日本：绿色转型投资促进税收优惠',
                'title_en': 'Japan: GX Investment Promotion Tax Incentives',
                'title_jp': '日本：グリーントランスフォーメーション投資促進税制',
                'link': 'https://www.meti.go.jp/2026-02-gx-tax',
                'date': '2026-02-25',
                'agency': '日本经济产业省',
                'agency_en': 'METI',
                'category': 'tax_credit'
            },
            {
                'title': '日本：氢能基本战略更新',
                'title_en': 'Japan: Basic Hydrogen Strategy Updated',
                'title_jp': '日本：水素基本戦略更新',
                'link': 'https://www.meti.go.jp/2026-02-hydrogen',
                'date': '2026-02-20',
                'agency': '日本经济产业省',
                'agency_en': 'METI',
                'category': 'hydrogen_policy'
            },
            {
                'title': '日本：环境省发布 2050 碳中和路线图',
                'title_en': 'Japan: MOE Releases 2050 Carbon Neutral Roadmap',
                'title_jp': '日本：環境省 2050 年カーボンニュートラルロードマップ发布',
                'link': 'https://www.env.go.jp/2026-02-carbon-neutral',
                'date': '2026-02-18',
                'agency': '日本环境省',
                'agency_en': 'Ministry of the Environment',
                'category': 'carbon_policy'
            },
            {
                'title': '日本：太阳能板回收制度 2026 年实施',
                'title_en': 'Japan: Solar Panel Recycling System Implemented 2026',
                'title_jp': '日本：太陽光パネルリサイクル制度 2026 年実施',
                'link': 'https://www.env.go.jp/2026-02-solar-recycling',
                'date': '2026-02-15',
                'agency': '日本环境省',
                'agency_en': 'Ministry of the Environment',
                'category': 'solar_policy'
            }
        ]
        return policies
    
    def categorize_policy(self, title):
        """政策分类"""
        keywords = {
            '目标': 'development_plan',
            'target': 'development_plan',
            '规划': 'development_plan',
            'plan': 'development_plan',
            'FIT': 'feed_in_tariff',
            'FIP': 'feed_in_tariff',
            '电价': 'feed_in_tariff',
            'tariff': 'feed_in_tariff',
            '风电': 'wind_policy',
            'wind': 'wind_policy',
            '储能': 'storage_policy',
            'storage': 'storage_policy',
            '补贴': 'subsidy',
            'subsidy': 'subsidy',
            '税收': 'tax_credit',
            'tax': 'tax_credit',
            '氢能': 'hydrogen_policy',
            'hydrogen': 'hydrogen_policy',
            '碳': 'carbon_policy',
            'carbon': 'carbon_policy',
            '太阳能': 'solar_policy',
            'solar': 'solar_policy'
        }
        
        for kw, cat in keywords.items():
            if kw.lower() in title.lower():
                return cat
        return 'other'
    
    def detect_impact(self, title):
        """检测政策影响级别"""
        high_keywords = ['战略', 'strategy', '目标', 'target', '法案', 'act', '路线图', 'roadmap']
        
        for kw in high_keywords:
            if kw.lower() in title.lower():
                return 'high'
        return 'medium'
    
    def run(self):
        """运行爬虫"""
        print("🕷️ 开始采集日本政策...")
        print(f"⏰ 采集时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)
        
        policies = self.fetch_policies()
        
        processed = []
        for policy in policies:
            processed_policy = {
                'policy_id': f"POL_JP_{policy['date'].replace('-', '')}_{len(processed)+1:03d}",
                'title': policy['title'],
                'title_en': policy['title_en'],
                'title_jp': policy['title_jp'],
                'link': policy['link'],
                'publish_date': policy['date'],
                'agency': policy['agency'],
                'agency_en': policy['agency_en'],
                'category': self.categorize_policy(policy['title']),
                'impact_level': self.detect_impact(policy['title']),
                'country': 'JP',
                'language': 'en',
                'summary': f"[Summary of {policy['title']}]",
                'summary_en': f"[Summary of {policy['title']}]",
                'collected_at': datetime.utcnow().isoformat() + 'Z'
            }
            processed.append(processed_policy)
            print(f"✅ 🇯🇵 {policy['date']} {policy['title'][:40]}...")
        
        print("-" * 60)
        print(f"📊 采集完成：共 {len(processed)} 条政策")
        
        self.save_to_json(processed)
        
        return processed
    
    def save_to_json(self, policies, filename='jp_policies.json'):
        """保存到 JSON 文件"""
        data = {
            'source': 'Japan Policy Collection',
            'source_url': self.base_url,
            'collected_at': datetime.utcnow().isoformat() + 'Z',
            'total': len(policies),
            'policies': policies
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 已保存到 {filename}")
        return filename


if __name__ == '__main__':
    spider = JapanPolicySpider()
    spider.run()
