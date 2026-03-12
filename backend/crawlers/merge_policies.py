#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
政策数据整合脚本
整合中国、美国、欧盟政策数据
"""

import json
from datetime import datetime

def load_policies():
    """加载所有政策数据"""
    policies = []
    
    # 中国政策
    try:
        with open('crawlers/nea_policies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            policies.extend(data['policies'])
            print(f"✅ 加载中国政策：{len(data['policies'])}条")
    except Exception as e:
        print(f"❌ 加载中国政策失败：{e}")
    
    # 美国政策
    try:
        with open('crawlers/doe_policies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            policies.extend(data['policies'])
            print(f"✅ 加载美国政策：{len(data['policies'])}条")
    except Exception as e:
        print(f"❌ 加载美国政策失败：{e}")
    
    # 欧盟政策
    try:
        with open('crawlers/ec_policies.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            policies.extend(data['policies'])
            print(f"✅ 加载欧盟政策：{len(data['policies'])}条")
    except Exception as e:
        print(f"❌ 加载欧盟政策失败：{e}")
    
    return policies

def get_country_flag(country):
    """获取国家旗帜"""
    flags = {
        'CN': '🇨🇳',
        'US': '🇺🇸',
        'EU': '🇪🇺',
        'SA': '🇸🇦',
        'VN': '🇻🇳'
    }
    return flags.get(country, '🌍')

def generate_news_data(policies):
    """生成新闻轮播数据"""
    # 按日期排序，取最新 10 条
    sorted_policies = sorted(policies, key=lambda x: x['publish_date'], reverse=True)[:10]
    
    news = []
    for i, p in enumerate(sorted_policies):
        news_item = {
            'news_id': f"NEWS_{i+1:03d}",
            'policy_id': p['policy_id'],
            'country': p['country'],
            'flag': get_country_flag(p['country']),
            'title': p.get('title_zh', p['title']),
            'title_en': p['title'],
            'summary': p.get('summary_zh', p.get('summary', '...')),
            'summary_en': p.get('summary_en', p.get('summary', '...')),
            'agency': p.get('agency_en', p['agency']),
            'agency_local': p['agency'],
            'publish_date': p['publish_date'],
            'impact_level': p['impact_level'],
            'impact_text': '重大影响' if p['impact_level'] == 'high' else '中等影响' if p['impact_level'] == 'medium' else '一般影响',
            'impact_text_en': 'High Impact' if p['impact_level'] == 'high' else 'Medium Impact' if p['impact_level'] == 'medium' else 'Low Impact',
            'link': p['link']
        }
        news.append(news_item)
    
    return news

def main():
    print("🔄 开始整合政策数据...")
    print("=" * 60)
    
    # 加载所有政策
    policies = load_policies()
    
    print("-" * 60)
    print(f"📊 总计：{len(policies)}条政策")
    
    # 按国家统计
    by_country = {}
    for p in policies:
        country = p['country']
        by_country[country] = by_country.get(country, 0) + 1
    
    print("\n📈 按国家统计:")
    for country, count in sorted(by_country.items(), key=lambda x: x[1], reverse=True):
        flag = get_country_flag(country)
        print(f"   {flag} {country}: {count}条")
    
    # 生成新闻数据
    news_data = generate_news_data(policies)
    
    # 保存
    output_file = 'news_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({'news': news_data}, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 新闻数据已保存到 {output_file}")
    print(f"📰 最新政策：{len(news_data)}条")
    
    # 显示最新 5 条
    print("\n📋 最新政策 TOP5:")
    for i, news in enumerate(news_data[:5], 1):
        print(f"   {i}. [{news['flag']}] {news['publish_date']} {news['title'][:40]}...")
    
    print("\n" + "=" * 60)
    print("✅ 政策数据整合完成！")


if __name__ == '__main__':
    main()
