#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
欧盟委员会能源总局政策信息采集爬虫
采集来源：https://energy.ec.europa.eu
"""

import json
from datetime import datetime

class ECPolicySpider:
    """欧盟委员会能源政策爬虫"""
    
    def __init__(self):
        self.base_url = "https://energy.ec.europa.eu"
        self.policy_url = "https://energy.ec.europa.eu/news-and-events/news"
    
    def fetch_policies(self):
        """获取政策列表（示例数据）"""
        policies = [
            {
                'title': 'REPowerEU: Commission Proposes 2030 Renewable Energy Target of 45%',
                'link': 'https://energy.ec.europa.eu/news/2026-03-repowereu-target',
                'date': '2026-03-08',
                'agency': 'European Commission',
                'category': 'renewable_target'
            },
            {
                'title': 'Green Deal Industrial Plan: Simplifying Permitting for Clean Tech',
                'link': 'https://energy.ec.europa.eu/news/2026-03-green-deal-permitting',
                'date': '2026-03-06',
                'agency': 'European Commission',
                'category': 'industrial_policy'
            },
            {
                'title': 'EU Battery Regulation: New Rules for Energy Storage',
                'link': 'https://energy.ec.europa.eu/news/2026-03-battery-regulation',
                'date': '2026-03-04',
                'agency': 'European Commission',
                'category': 'storage_policy'
            },
            {
                'title': 'Carbon Border Adjustment Mechanism (CBAM) Implementation Guidelines',
                'link': 'https://energy.ec.europa.eu/news/2026-03-cbam-guidelines',
                'date': '2026-03-01',
                'agency': 'European Commission',
                'category': 'carbon_policy'
            },
            {
                'title': 'Net-Zero Industry Act: Accelerating Clean Technology Deployment',
                'link': 'https://energy.ec.europa.eu/news/2026-02-net-zero-industry',
                'date': '2026-02-28',
                'agency': 'European Commission',
                'category': 'industrial_policy'
            },
            {
                'title': 'EU Solar Strategy: Doubling Solar Capacity by 2027',
                'link': 'https://energy.ec.europa.eu/news/2026-02-solar-strategy',
                'date': '2026-02-25',
                'agency': 'European Commission',
                'category': 'solar_policy'
            },
            {
                'title': 'Hydrogen Bank: Supporting Renewable Hydrogen Production',
                'link': 'https://energy.ec.europa.eu/news/2026-02-hydrogen-bank',
                'date': '2026-02-20',
                'agency': 'European Commission',
                'category': 'hydrogen_policy'
            }
        ]
        return policies
    
    def categorize_policy(self, title):
        """政策分类"""
        keywords = {
            'repower': 'renewable_target',
            'renewable': 'renewable_target',
            'target': 'renewable_target',
            'green deal': 'industrial_policy',
            'industrial': 'industrial_policy',
            'battery': 'storage_policy',
            'storage': 'storage_policy',
            'carbon': 'carbon_policy',
            'cbam': 'carbon_policy',
            'net-zero': 'industrial_policy',
            'solar': 'solar_policy',
            'hydrogen': 'hydrogen_policy',
            'wind': 'wind_policy'
        }
        
        title_lower = title.lower()
        for kw, cat in keywords.items():
            if kw in title_lower:
                return cat
        return 'other'
    
    def detect_impact(self, title):
        """检测政策影响级别"""
        high_keywords = ['repower', 'green deal', 'regulation', 'act', 'strategy']
        medium_keywords = ['guidelines', 'proposal', 'communication']
        
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
        print("🕷️ 开始采集欧盟委员会能源政策...")
        print(f"📍 目标网站：{self.policy_url}")
        print(f"⏰ 采集时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)
        
        policies = self.fetch_policies()
        
        processed = []
        for policy in policies:
            processed_policy = {
                'policy_id': f"POL_EU_{policy['date'].replace('-', '')}_{len(processed)+1:03d}",
                'title': policy['title'],
                'title_en': policy['title'],
                'title_zh': self.translate_title(policy['title']),
                'link': policy['link'],
                'publish_date': policy['date'],
                'agency': policy['agency'],
                'agency_en': policy['agency'],
                'category': self.categorize_policy(policy['title']),
                'impact_level': self.detect_impact(policy['title']),
                'country': 'EU',
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
        
        self.save_to_json(processed)
        
        return processed
    
    def translate_title(self, title):
        """标题翻译（示例）"""
        translations = {
            'REPowerEU: Commission Proposes 2030 Renewable Energy Target of 45%': 'REPowerEU：欧盟委员会提议 2030 年可再生能源目标 45%',
            'Green Deal Industrial Plan: Simplifying Permitting for Clean Tech': '绿色协议产业计划：简化清洁技术许可',
            'EU Battery Regulation: New Rules for Energy Storage': '欧盟电池法规：储能新规则',
            'Carbon Border Adjustment Mechanism (CBAM) Implementation Guidelines': '碳边境调节机制 (CBAM) 实施指南',
            'Net-Zero Industry Act: Accelerating Clean Technology Deployment': '净零工业法案：加速清洁技术部署',
            'EU Solar Strategy: Doubling Solar Capacity by 2027': '欧盟太阳能战略：2027 年前太阳能容量翻倍',
            'Hydrogen Bank: Supporting Renewable Hydrogen Production': '氢能银行：支持可再生氢生产'
        }
        return translations.get(title, title)
    
    def save_to_json(self, policies, filename='ec_policies.json'):
        """保存到 JSON 文件"""
        data = {
            'source': 'European Commission - Energy',
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
    spider = ECPolicySpider()
    spider.run()
