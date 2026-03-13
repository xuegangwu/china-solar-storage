#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全球政策数据整合脚本（包含东南亚和日本）
"""

import json
from datetime import datetime

def load_all_policies():
    """加载所有政策数据"""
    all_policies = []
    
    # 中国
    try:
        with open('crawlers/nea_policies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_policies.extend(data['policies'])
            print(f"✅ 中国政策：{len(data['policies'])}条")
    except: pass
    
    # 美国
    try:
        with open('crawlers/doe_policies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_policies.extend(data['policies'])
            print(f"✅ 美国政策：{len(data['policies'])}条")
    except: pass
    
    # 欧盟
    try:
        with open('crawlers/ec_policies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_policies.extend(data['policies'])
            print(f"✅ 欧盟政策：{len(data['policies'])}条")
    except: pass
    
    # 东南亚
    try:
        with open('crawlers/sea_policies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_policies.extend(data['policies'])
            print(f"✅ 东南亚政策：{len(data['policies'])}条")
    except: pass
    
    # 日本
    try:
        with open('crawlers/jp_policies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_policies.extend(data['policies'])
            print(f"✅ 日本政策：{len(data['policies'])}条")
    except: pass
    
    return all_policies

def get_country_flag(country):
    """获取国家旗帜"""
    flags = {
        'CN': '🇨🇳',
        'US': '🇺🇸',
        'EU': '🇪🇺',
        'VN': '🇻🇳',
        'TH': '🇹🇭',
        'ID': '🇮🇩',
        'MY': '🇲🇾',
        'PH': '🇵🇭',
        'JP': '🇯🇵',
        'SA': '🇸🇦',
        'AE': '🇦🇪'
    }
    return flags.get(country, '🌍')

def generate_news_data(policies):
    """生成新闻轮播数据"""
    sorted_policies = sorted(policies, key=lambda x: x['publish_date'], reverse=True)[:15]
    
    news = []
    for i, p in enumerate(sorted_policies):
        news_item = {
            'news_id': f"NEWS_{i+1:03d}",
            'policy_id': p['policy_id'],
            'country': p['country'],
            'flag': get_country_flag(p['country']),
            'title': p.get('title_zh', p.get('title_local', p['title'])),
            'title_en': p['title'],
            'summary': p.get('summary_zh', p.get('summary_local', p.get('summary', '...'))),
            'summary_en': p.get('summary_en', p.get('summary', '...')),
            'agency': p.get('agency_en', p['agency']),
            'publish_date': p['publish_date'],
            'impact_level': p['impact_level'],
            'link': p['link']
        }
        news.append(news_item)
    
    return news

def main():
    print("🔄 开始整合全球政策数据...")
    print("=" * 60)
    
    all_policies = load_all_policies()
    
    print("-" * 60)
    print(f"📊 总计：{len(all_policies)}条政策")
    
    # 按国家统计
    by_country = {}
    for p in all_policies:
        country = p['country']
        by_country[country] = by_country.get(country, 0) + 1
    
    print("\n🌍 按国家/地区统计:")
    for country, count in sorted(by_country.items(), key=lambda x: x[1], reverse=True):
        flag = get_country_flag(country)
        print(f"   {flag} {country}: {count}条")
    
    # 生成新闻数据
    news_data = generate_news_data(all_policies)
    
    # 保存
    with open('global_news_data.json', 'w', encoding='utf-8') as f:
        json.dump({'news': news_data, 'total': len(all_policies)}, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 新闻数据已保存：global_news_data.json")
    print(f"📰 最新政策：{len(news_data)}条")
    
    print("\n" + "=" * 60)
    print("✅ 全球政策数据整合完成！")


if __name__ == '__main__':
    main()
