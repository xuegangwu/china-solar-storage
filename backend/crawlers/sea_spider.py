#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
东南亚政策信息采集爬虫
采集来源：越南、泰国、印尼、马来西亚
"""

import json
from datetime import datetime

class SEAPolicySpider:
    """东南亚政策爬虫"""
    
    def __init__(self):
        self.countries = {
            'VN': '越南',
            'TH': '泰国',
            'ID': '印尼',
            'MY': '马来西亚',
            'PH': '菲律宾'
        }
    
    def fetch_policies(self):
        """获取政策列表（示例数据）"""
        policies = [
            # 越南
            {
                'country': 'VN',
                'title': '越南工贸部：FIT 电价政策延期至 2027 年底',
                'title_en': 'Vietnam MOIT: FIT Policy Extended to End of 2027',
                'title_local': 'Bộ Công Thương: Chính sách FIT gia hạn đến cuối năm 2027',
                'link': 'https://www.moit.gov.vn/2026-03-fit-extension',
                'date': '2026-03-06',
                'agency': '越南工贸部',
                'agency_en': 'Ministry of Industry and Trade',
                'category': 'feed_in_tariff'
            },
            {
                'country': 'VN',
                'title': '越南第八版电力规划：2030 年太阳能目标 18GW',
                'title_en': 'Vietnam PDP8: 2030 Solar Target 18GW',
                'title_local': 'Quy hoạch điện VIII: Mục tiêu năng lượng mặt trời 18GW vào năm 2030',
                'link': 'https://www.moit.gov.vn/2026-03-pdp8-solar',
                'date': '2026-03-02',
                'agency': '越南工贸部',
                'agency_en': 'Ministry of Industry and Trade',
                'category': 'development_plan'
            },
            {
                'country': 'VN',
                'title': '越南：屋顶太阳能净计量政策实施细则',
                'title_en': 'Vietnam: Net Metering Rules for Rooftop Solar',
                'title_local': 'Việt Nam: Quy định chi tiết về đo đếm điện mặt trời mái nhà',
                'link': 'https://www.moit.gov.vn/2026-02-net-metering',
                'date': '2026-02-28',
                'agency': '越南工贸部',
                'agency_en': 'Ministry of Industry and Trade',
                'category': 'solar_policy'
            },
            # 泰国
            {
                'country': 'TH',
                'title': '泰国：2026-2037 新能源发展计划发布',
                'title_en': 'Thailand: AEDP 2026-2037 Released',
                'title_local': 'ประเทศไทย: แผน AEDP 2026-2037',
                'link': 'https://www.eppo.go.th/2026-03-aedp',
                'date': '2026-03-05',
                'agency': '泰国能源政策办公室',
                'agency_en': 'EPPO Thailand',
                'category': 'development_plan'
            },
            {
                'country': 'TH',
                'title': '泰国：太阳能上网电价补贴 0.08 美元/kWh',
                'title_en': 'Thailand: Solar FIT at $0.08/kWh',
                'title_local': 'ประเทศไทย: อัตรา Feed-in Tariff โซลาร์ 0.08 ดอลลาร์/กWh',
                'link': 'https://www.eppo.go.th/2026-03-solar-fit',
                'date': '2026-03-01',
                'agency': '泰国能源政策办公室',
                'agency_en': 'EPPO Thailand',
                'category': 'feed_in_tariff'
            },
            {
                'country': 'TH',
                'title': '泰国投资促进委员会：太阳能项目税收优惠',
                'title_en': 'Thailand BOI: Tax Incentives for Solar Projects',
                'title_local': 'ประเทศไทย: สิทธิประโยชน์ทางภาษีสำหรับโครงการโซลาร์',
                'link': 'https://www.boi.go.th/2026-02-solar-tax',
                'date': '2026-02-25',
                'agency': '泰国投资促进委员会',
                'agency_en': 'BOI Thailand',
                'category': 'tax_credit'
            },
            # 印尼
            {
                'country': 'ID',
                'title': '印尼：2026 年可再生能源装机目标 20GW',
                'title_en': 'Indonesia: 2026 Renewable Target 20GW',
                'title_local': 'Indonesia: Target Energi Terbarukan 20GW 2026',
                'link': 'https://www.esdm.go.id/2026-03-renewable-target',
                'date': '2026-03-04',
                'agency': '印尼能源与矿产资源部',
                'agency_en': 'Ministry of ESDM',
                'category': 'development_plan'
            },
            {
                'country': 'ID',
                'title': '印尼：屋顶太阳能出口电价新规',
                'title_en': 'Indonesia: New Rules for Rooftop Solar Export',
                'title_local': 'Indonesia: Aturan Baru Ekspor Surya Atap',
                'link': 'https://www.esdm.go.id/2026-02-rooftop-solar',
                'date': '2026-02-28',
                'agency': '印尼能源与矿产资源部',
                'agency_en': 'Ministry of ESDM',
                'category': 'solar_policy'
            },
            {
                'country': 'ID',
                'title': '印尼：PLN 购电协议标准化模板发布',
                'title_en': 'Indonesia: PLN PPA Standard Template Released',
                'title_local': 'Indonesia: Template Standar PPA PLN',
                'link': 'https://www.pln.co.id/2026-02-ppa-template',
                'date': '2026-02-20',
                'agency': '印尼国家电力公司',
                'agency_en': 'PLN',
                'category': 'grid_policy'
            },
            # 马来西亚
            {
                'country': 'MY',
                'title': '马来西亚：2026 年大型太阳能招标启动',
                'title_en': 'Malaysia: LSS 2026 Bidding Launched',
                'title_local': 'Malaysia: Bidaan LSS 2026 Dilancarkan',
                'link': 'https://www.st.gov.my/2026-03-lss-2026',
                'date': '2026-03-03',
                'agency': '马来西亚能源委员会',
                'agency_en': 'Suruhanjaya Tenaga',
                'category': 'solar_policy'
            },
            {
                'country': 'MY',
                'title': '马来西亚：净能源计量 3.0 延期申请',
                'title_en': 'Malaysia: NEM 3.0 Extension Applications',
                'title_local': 'Malaysia: Permohonan Lanjutan NEM 3.0',
                'link': 'https://www.st.gov.my/2026-02-nem-extension',
                'date': '2026-02-26',
                'agency': '马来西亚能源委员会',
                'agency_en': 'Suruhanjaya Tenaga',
                'category': 'solar_policy'
            },
            # 菲律宾
            {
                'country': 'PH',
                'title': '菲律宾：可再生能源法实施细则更新',
                'title_en': 'Philippines: IRR of Renewable Energy Act Updated',
                'title_local': 'Pilipinas: Na-update na IRR ng Renewable Energy Act',
                'link': 'https://www.doe.gov.ph/2026-03-re-irr',
                'date': '2026-03-01',
                'agency': '菲律宾能源部',
                'agency_en': 'DOE Philippines',
                'category': 'renewable_policy'
            },
            {
                'country': 'PH',
                'title': '菲律宾：绿色能源选项计划启动',
                'title_en': 'Philippines: Green Energy Option Program Launched',
                'title_local': 'Pilipinas: Green Energy Option Program Nagsimula',
                'link': 'https://www.doe.gov.ph/2026-02-geop',
                'date': '2026-02-22',
                'agency': '菲律宾能源部',
                'agency_en': 'DOE Philippines',
                'category': 'renewable_policy'
            }
        ]
        return policies
    
    def categorize_policy(self, title):
        """政策分类"""
        keywords = {
            'FIT': 'feed_in_tariff',
            '电价': 'feed_in_tariff',
            'tariff': 'feed_in_tariff',
            '规划': 'development_plan',
            'plan': 'development_plan',
            '目标': 'development_plan',
            'target': 'development_plan',
            '太阳能': 'solar_policy',
            'solar': 'solar_policy',
            '税收': 'tax_credit',
            'tax': 'tax_credit',
            '电网': 'grid_policy',
            'grid': 'grid_policy',
            '可再生': 'renewable_policy',
            'renewable': 'renewable_policy'
        }
        
        for kw, cat in keywords.items():
            if kw.lower() in title.lower():
                return cat
        return 'other'
    
    def detect_impact(self, title, country):
        """检测政策影响级别"""
        high_keywords = ['规划', 'plan', '目标', 'target', '法案', 'act']
        
        for kw in high_keywords:
            if kw.lower() in title.lower():
                return 'high'
        return 'medium'
    
    def run(self):
        """运行爬虫"""
        print("🕷️ 开始采集东南亚政策...")
        print(f"⏰ 采集时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)
        
        policies = self.fetch_policies()
        
        processed = []
        for policy in policies:
            processed_policy = {
                'policy_id': f"POL_{policy['country']}_{policy['date'].replace('-', '')}_{len(processed)+1:03d}",
                'title': policy['title'],
                'title_en': policy['title_en'],
                'title_local': policy['title_local'],
                'link': policy['link'],
                'publish_date': policy['date'],
                'agency': policy['agency'],
                'agency_en': policy['agency_en'],
                'category': self.categorize_policy(policy['title']),
                'impact_level': self.detect_impact(policy['title'], policy['country']),
                'country': policy['country'],
                'language': 'en',
                'summary': f"[Summary of {policy['title']}]",
                'summary_en': f"[Summary of {policy['title']}]",
                'collected_at': datetime.utcnow().isoformat() + 'Z'
            }
            processed.append(processed_policy)
            flag = self.get_country_flag(policy['country'])
            print(f"✅ {flag} {policy['date']} {policy['title'][:40]}...")
        
        print("-" * 60)
        print(f"📊 采集完成：共 {len(processed)} 条政策")
        
        self.save_to_json(processed)
        
        return processed
    
    def get_country_flag(self, country_code):
        """获取国家旗帜"""
        flags = {
            'VN': '🇻🇳',
            'TH': '🇹🇭',
            'ID': '🇮🇩',
            'MY': '🇲🇾',
            'PH': '🇵🇭'
        }
        return flags.get(country_code, '🌏')
    
    def save_to_json(self, policies, filename='sea_policies.json'):
        """保存到 JSON 文件"""
        data = {
            'source': 'Southeast Asia Policy Collection',
            'source_url': 'Multiple',
            'collected_at': datetime.utcnow().isoformat() + 'Z',
            'total': len(policies),
            'countries': list(set(p['country'] for p in policies)),
            'policies': policies
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 已保存到 {filename}")
        return filename


if __name__ == '__main__':
    spider = SEAPolicySpider()
    spider.run()
