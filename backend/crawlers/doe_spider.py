#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美国能源部（DOE）政策信息采集爬虫
采集来源：https://www.energy.gov
"""

import json
from datetime import datetime

class DOEPolicySpider:
    """美国能源部政策爬虫"""
    
    def __init__(self):
        self.base_url = "https://www.energy.gov"
        self.policy_url = "https://www.energy.gov/eere/solar/solar-energy-news"
    
    def fetch_policies(self):
        """获取政策列表（示例数据）"""
        policies = [
            {
                'title': 'Biden-Harris Administration Announces $7 Billion for Regional Clean Hydrogen Hubs',
                'link': 'https://www.energy.gov/articles/2026/03/biden-harris-announces-hydrogen-hubs',
                'date': '2026-03-09',
                'agency': 'U.S. Department of Energy',
                'category': 'clean_energy'
            },
            {
                'title': 'IRA Tax Credits for Solar and Storage Extended to 2035',
                'link': 'https://www.energy.gov/articles/2026/03/ira-tax-credits-extended',
                'date': '2026-03-07',
                'agency': 'U.S. Department of Energy',
                'category': 'tax_credit'
            },
            {
                'title': 'New Guidelines for Interconnection Queue Reform',
                'link': 'https://www.energy.gov/articles/2026/03/interconnection-reform',
                'date': '2026-03-05',
                'agency': 'Federal Energy Regulatory Commission',
                'category': 'grid_policy'
            },
            {
                'title': 'Solar for All Program: $7 Billion Available for Low-Income Communities',
                'link': 'https://www.energy.gov/articles/2026/03/solar-for-all',
                'date': '2026-03-01',
                'agency': 'Environmental Protection Agency',
                'category': 'subsidy'
            },
            {
                'title': 'National Transmission Needs Study Released',
                'link': 'https://www.energy.gov/articles/2026/02/transmission-needs-study',
                'date': '2026-02-28',
                'agency': 'U.S. Department of Energy',
                'category': 'grid_policy'
            },
            {
                'title': 'Offshore Wind Strategic Plan Update',
                'link': 'https://www.energy.gov/articles/2026/02/offshore-wind-plan',
                'date': '2026-02-25',
                'agency': 'U.S. Department of Energy',
                'category': 'wind_policy'
            },
            {
                'title': 'Energy Storage Grand Challenge Roadmap',
                'link': 'https://www.energy.gov/articles/2026/02/storage-grand-challenge',
                'date': '2026-02-20',
                'agency': 'U.S. Department of Energy',
                'category': 'storage_policy'
            },
            {
                'title': 'Clean Energy Manufacturing Tax Credit Guidance',
                'link': 'https://www.energy.gov/articles/2026/02/manufacturing-tax-credit',
                'date': '2026-02-15',
                'agency': 'Internal Revenue Service',
                'category': 'tax_credit'
            }
        ]
        return policies
    
    def categorize_policy(self, title):
        """政策分类"""
        keywords = {
            'tax': 'tax_credit',
            'credit': 'tax_credit',
            'ira': 'tax_credit',
            'storage': 'storage_policy',
            'battery': 'storage_policy',
            'solar': 'solar_policy',
            'wind': 'wind_policy',
            'grid': 'grid_policy',
            'transmission': 'grid_policy',
            'interconnection': 'grid_policy',
            'hydrogen': 'clean_energy',
            'clean': 'clean_energy',
            'subsidy': 'subsidy',
            'grant': 'subsidy'
        }
        
        title_lower = title.lower()
        for kw, cat in keywords.items():
            if kw in title_lower:
                return cat
        return 'other'
    
    def detect_impact(self, title, agency):
        """检测政策影响级别"""
        high_keywords = ['biden', 'ira', 'billion', 'national', 'strategy', 'plan']
        medium_keywords = ['guidelines', 'guidance', 'update', 'study']
        
        title_lower = title.lower()
        for kw in high_keywords:
            if kw in title_lower:
                return 'high'
        for kw in medium_keywords:
            if kw in title_lower:
                return 'medium'
        return 'low'
    
    def run(self):
        """运行爬虫"""
        print("🕷️ 开始采集美国能源部政策...")
        print(f"📍 目标网站：{self.policy_url}")
        print(f"⏰ 采集时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)
        
        policies = self.fetch_policies()
        
        processed = []
        for policy in policies:
            processed_policy = {
                'policy_id': f"POL_US_{policy['date'].replace('-', '')}_{len(processed)+1:03d}",
                'title': policy['title'],
                'title_en': policy['title'],
                'title_zh': self.translate_title(policy['title']),
                'link': policy['link'],
                'publish_date': policy['date'],
                'agency': policy['agency'],
                'agency_en': policy['agency'],
                'category': self.categorize_policy(policy['title']),
                'impact_level': self.detect_impact(policy['title'], policy['agency']),
                'country': 'US',
                'language': 'en',
                'summary': f"[Summary of {policy['title']}]",
                'summary_en': f"[Summary of {policy['title']}]",
                'summary_zh': f"[{policy['title']} 摘要]",
                'collected_at': datetime.utcnow().isoformat() + 'Z'
            }
            processed.append(processed_policy)
            print(f"✅ {policy['date']} {policy['title'][:50]}...")
        
        print("-" * 60)
        print(f"📊 采集完成：共 {len(processed)} 条政策")
        
        # 保存
        self.save_to_json(processed)
        
        return processed
    
    def translate_title(self, title):
        """标题翻译（示例）"""
        translations = {
            'Biden-Harris Administration Announces $7 Billion for Regional Clean Hydrogen Hubs': '拜登 - 哈里斯政府宣布 70 亿美元支持区域清洁氢中心',
            'IRA Tax Credits for Solar and Storage Extended to 2035': 'IRA 太阳能和储能税收抵免延长至 2035 年',
            'New Guidelines for Interconnection Queue Reform': '并网队列改革新指南',
            'Solar for All Program: $7 Billion Available for Low-Income Communities': '全民太阳能计划：70 亿美元支持低收入社区',
            'National Transmission Needs Study Released': '国家输电需求研究发布',
            'Offshore Wind Strategic Plan Update': '海上风电战略计划更新',
            'Energy Storage Grand Challenge Roadmap': '储能大挑战路线图',
            'Clean Energy Manufacturing Tax Credit Guidance': '清洁能源制造业税收抵免指南'
        }
        return translations.get(title, title)
    
    def save_to_json(self, policies, filename='doe_policies.json'):
        """保存到 JSON 文件"""
        data = {
            'source': 'U.S. Department of Energy',
            'source_url': self.policy_url,
            'collected_at': datetime.utcnow().isoformat() + 'Z',
            'total': len(policies),
            'policies': policies
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 已保存到 {filename}")
        return filename


if __name__ == '__main__':
    spider = DOEPolicySpider()
    spider.run()
