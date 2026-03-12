#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
国家能源局政策信息采集爬虫
采集来源：http://www.nea.gov.cn
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
import re

class NEAPolicySpider:
    """国家能源局政策爬虫"""
    
    def __init__(self):
        self.base_url = "http://www.nea.gov.cn"
        self.policy_url = "http://www.nea.gov.cn/zwgk/zcfg/index.htm"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    
    def fetch_policy_list(self, page=1):
        """获取政策列表"""
        try:
            # 模拟访问（实际使用时需要真实请求）
            # response = requests.get(f"{self.policy_url}?page={page}", headers=self.headers)
            # response.encoding = 'utf-8'
            
            # 示例数据（演示用）
            policies = [
                {
                    'title': '国家能源局关于推进 2026 年风电光伏发电开发建设的通知',
                    'link': 'http://www.nea.gov.cn/2026-03/10/c_1310706001.htm',
                    'date': '2026-03-10',
                    'agency': '国家能源局',
                    'category': 'development_plan'
                },
                {
                    'title': '新型储能发展实施方案（2026-2030 年）',
                    'link': 'http://www.nea.gov.cn/2026-03/08/c_1310705998.htm',
                    'date': '2026-03-08',
                    'agency': '国家能源局',
                    'category': 'storage_policy'
                },
                {
                    'title': '可再生能源电力消纳保障机制考核办法',
                    'link': 'http://www.nea.gov.cn/2026-03/05/c_1310705995.htm',
                    'date': '2026-03-05',
                    'agency': '国家能源局',
                    'category': 'grid_policy'
                },
                {
                    'title': '关于完善风电上网电价政策的通知',
                    'link': 'http://www.nea.gov.cn/2026-03/01/c_1310705990.htm',
                    'date': '2026-03-01',
                    'agency': '国家发改委',
                    'category': 'feed_in_tariff'
                },
                {
                    'title': '光伏发电项目建设管理办法',
                    'link': 'http://www.nea.gov.cn/2026-02/28/c_1310705985.htm',
                    'date': '2026-02-28',
                    'agency': '国家能源局',
                    'category': 'project_management'
                },
                {
                    'title': '关于促进储能技术与产业发展的指导意见',
                    'link': 'http://www.nea.gov.cn/2026-02/25/c_1310705980.htm',
                    'date': '2026-02-25',
                    'agency': '国家能源局',
                    'category': 'storage_policy'
                },
                {
                    'title': '清洁能源消纳行动计划（2026-2030 年）',
                    'link': 'http://www.nea.gov.cn/2026-02/20/c_1310705975.htm',
                    'date': '2026-02-20',
                    'agency': '国家能源局',
                    'category': 'grid_policy'
                },
                {
                    'title': '关于完善光伏发电上网电价机制有关问题的通知',
                    'link': 'http://www.nea.gov.cn/2026-02/15/c_1310705970.htm',
                    'date': '2026-02-15',
                    'agency': '国家发改委',
                    'category': 'feed_in_tariff'
                },
                {
                    'title': '能源领域碳达峰实施方案',
                    'link': 'http://www.nea.gov.cn/2026-02/10/c_1310705965.htm',
                    'date': '2026-02-10',
                    'agency': '国家能源局',
                    'category': 'carbon_policy'
                },
                {
                    'title': '关于推进电力源网荷储一体化和多能互补发展的指导意见',
                    'link': 'http://www.nea.gov.cn/2026-02/05/c_1310705960.htm',
                    'date': '2026-02-05',
                    'agency': '国家发改委',
                    'category': 'integration_policy'
                }
            ]
            
            return policies
            
        except Exception as e:
            print(f"采集失败：{e}")
            return []
    
    def categorize_policy(self, title):
        """政策分类"""
        keywords = {
            '补贴': 'subsidy',
            '电价': 'feed_in_tariff',
            '配储': 'storage_requirement',
            '储能': 'storage_policy',
            '并网': 'grid_connection',
            '消纳': 'grid_policy',
            '规划': 'development_plan',
            '风电': 'wind_policy',
            '光伏': 'solar_policy',
            '碳': 'carbon_policy'
        }
        
        for kw, cat in keywords.items():
            if kw in title:
                return cat
        return 'other'
    
    def detect_impact(self, title):
        """检测政策影响级别"""
        high_keywords = ['目标', '规划', '方案', '指导意见', '通知']
        medium_keywords = ['办法', '规定', '细则']
        
        for kw in high_keywords:
            if kw in title:
                return 'high'
        for kw in medium_keywords:
            if kw in title:
                return 'medium'
        return 'low'
    
    def save_to_json(self, policies, filename='nea_policies.json'):
        """保存到 JSON 文件"""
        data = {
            'source': '国家能源局',
            'source_url': self.policy_url,
            'collected_at': datetime.utcnow().isoformat() + 'Z',
            'total': len(policies),
            'policies': policies
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 已保存到 {filename}")
        return filename
    
    def run(self):
        """运行爬虫"""
        print("🕷️ 开始采集国家能源局政策...")
        print(f"📍 目标网站：{self.policy_url}")
        print(f"⏰ 采集时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)
        
        # 获取政策列表
        policies = self.fetch_policy_list()
        
        # 处理每条政策
        processed = []
        for policy in policies:
            processed_policy = {
                'policy_id': f"POL_CN_{policy['date'].replace('-', '')}_{len(processed)+1:03d}",
                'title': policy['title'],
                'title_en': '',  # 待翻译
                'link': policy['link'],
                'publish_date': policy['date'],
                'agency': policy['agency'],
                'agency_en': self.translate_agency(policy['agency']),
                'category': self.categorize_policy(policy['title']),
                'impact_level': self.detect_impact(policy['title']),
                'country': 'CN',
                'language': 'zh-CN',
                'collected_at': datetime.utcnow().isoformat() + 'Z'
            }
            processed.append(processed_policy)
            print(f"✅ {policy['date']} {policy['title'][:40]}...")
        
        print("-" * 60)
        print(f"📊 采集完成：共 {len(processed)} 条政策")
        
        # 保存
        self.save_to_json(processed)
        
        # 统计
        self.print_stats(processed)
        
        return processed
    
    def translate_agency(self, agency):
        """机构名称翻译"""
        translations = {
            '国家能源局': 'National Energy Administration',
            '国家发改委': 'National Development and Reform Commission',
            '工信部': 'Ministry of Industry and Information Technology',
            '财政部': 'Ministry of Finance'
        }
        return translations.get(agency, agency)
    
    def print_stats(self, policies):
        """打印统计信息"""
        categories = {}
        impacts = {}
        
        for p in policies:
            cat = p['category']
            imp = p['impact_level']
            categories[cat] = categories.get(cat, 0) + 1
            impacts[imp] = impacts.get(imp, 0) + 1
        
        print("\n📈 政策分类统计:")
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"   {cat}: {count}条")
        
        print("\n🎯 影响级别统计:")
        for imp, count in sorted(impacts.items(), key=lambda x: x[1], reverse=True):
            print(f"   {imp}: {count}条")


if __name__ == '__main__':
    spider = NEAPolicySpider()
    spider.run()
