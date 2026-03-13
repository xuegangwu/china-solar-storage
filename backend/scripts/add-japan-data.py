#!/usr/bin/env python3
"""
添加日本都道府县数据到数据库
"""

import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / 'data/solar-storage.db'

# 日本 47 个都道府县数据
# 格式：[名称，纬度，经度，资源得分，电价得分，市场得分，电网得分]
JAPAN_PREFECTURES = [
    # 北海道·东北
    ["北海道", 43.0642, 141.3469, 65, 60, 55, 50],
    ["青森县", 40.8244, 140.7400, 63, 58, 52, 48],
    ["岩手县", 39.7036, 141.1527, 62, 57, 51, 47],
    ["宫城县", 38.2688, 140.8719, 60, 62, 58, 55],
    ["秋田县", 39.7186, 140.1024, 61, 56, 50, 46],
    ["山形县", 38.2404, 140.3633, 59, 55, 49, 45],
    ["福岛县", 37.7503, 140.4676, 64, 59, 54, 52],
    
    # 关东
    ["茨城县", 36.3418, 140.4468, 62, 63, 60, 58],
    ["栃木县", 36.5658, 139.8836, 60, 61, 58, 56],
    ["群马县", 36.3911, 139.0608, 61, 60, 57, 55],
    ["埼玉县", 35.8569, 139.6489, 58, 62, 60, 58],
    ["千叶县", 35.6074, 140.1065, 59, 63, 61, 59],
    ["东京都", 35.6895, 139.6917, 55, 70, 75, 72],
    ["神奈川县", 35.4478, 139.6425, 56, 68, 72, 70],
    
    # 中部
    ["新潟县", 37.9026, 139.0232, 60, 58, 54, 52],
    ["富山县", 36.6959, 137.2137, 62, 59, 55, 53],
    ["石川县", 36.5946, 136.6256, 61, 58, 54, 52],
    ["福井县", 36.0652, 136.2216, 60, 59, 55, 53],
    ["山梨县", 35.6638, 138.5684, 63, 60, 56, 54],
    ["长野县", 36.6513, 138.1811, 64, 59, 55, 53],
    ["岐阜县", 35.3912, 136.7223, 61, 60, 56, 54],
    ["静冈县", 34.9769, 138.3831, 62, 63, 60, 58],
    ["爱知县", 35.1802, 136.9066, 59, 65, 68, 66],
    
    # 近畿
    ["三重县", 34.7303, 136.5086, 60, 61, 58, 56],
    ["滋贺县", 35.0045, 135.8686, 59, 62, 59, 57],
    ["京都府", 35.0211, 135.7556, 58, 64, 62, 60],
    ["大阪府", 34.6937, 135.5023, 56, 66, 70, 68],
    ["兵库县", 34.6913, 135.1830, 58, 64, 62, 60],
    ["奈良县", 34.6851, 135.8048, 57, 62, 59, 57],
    ["和歌山县", 34.2261, 135.1675, 59, 60, 56, 54],
    
    # 中国
    ["鸟取县", 35.5038, 134.2384, 61, 57, 52, 50],
    ["岛根县", 35.4723, 133.0506, 60, 56, 51, 49],
    ["冈山县", 34.6618, 133.9350, 61, 59, 55, 53],
    ["广岛县", 34.3963, 132.4596, 60, 61, 58, 56],
    ["山口县", 34.1859, 131.4706, 59, 58, 54, 52],
    
    # 四国
    ["德岛县", 34.0658, 134.5594, 60, 58, 54, 52],
    ["香川县", 34.3401, 134.0434, 59, 59, 55, 53],
    ["爱媛县", 33.8416, 132.7657, 60, 58, 54, 52],
    ["高知县", 33.5597, 133.5311, 61, 57, 52, 50],
    
    # 九州·冲绳
    ["福冈县", 33.6064, 130.4181, 59, 62, 60, 58],
    ["佐贺县", 33.2494, 130.2989, 58, 59, 55, 53],
    ["长崎县", 32.7503, 129.8779, 59, 58, 54, 52],
    ["熊本县", 32.7898, 130.7417, 60, 59, 55, 53],
    ["大分县", 33.2382, 131.6126, 61, 58, 54, 52],
    ["宫崎县", 31.9077, 131.4202, 62, 57, 52, 50],
    ["鹿儿岛县", 31.5602, 130.5581, 63, 58, 53, 51],
    ["冲绳县", 26.2124, 127.6792, 68, 60, 55, 50],
]

def calculate_grade(total):
    """根据总分计算等级"""
    if total >= 80:
        return "A"
    elif total >= 70:
        return "B"
    elif total >= 60:
        return "C"
    else:
        return "D"

def add_japan_data():
    """添加日本数据到数据库"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 检查是否已存在日本数据
    cursor.execute("SELECT COUNT(*) FROM provinces WHERE country = 'JP'")
    existing = cursor.fetchone()[0]
    
    if existing > 0:
        print(f"⚠️  数据库中已有 {existing} 条日本数据")
        response = input("是否删除并重新添加？(y/n): ")
        if response.lower() == 'y':
            cursor.execute("DELETE FROM provinces WHERE country = 'JP'")
            conn.commit()
            print("✅ 已删除现有日本数据")
        else:
            print("❌ 操作取消")
            conn.close()
            return
    
    # 插入日本数据
    base_id = 1000  # 从 1000 开始 ID
    for i, (name, lat, lng, resource, price, market, grid) in enumerate(JAPAN_PREFECTURES):
        # 计算总分和等级
        total = round((resource + price + market + grid) / 4, 1)
        grade = calculate_grade(total)
        
        # 插入数据
        cursor.execute("""
            INSERT INTO provinces (
                id, name, country, lat, lng, 
                grade, resource_score, price_score, 
                market_score, grid_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            base_id + i,
            name,
            'JP',
            lat,
            lng,
            grade,
            resource,
            price,
            market,
            grid
        ))
        
        # 同时插入 scores JSON（如果表结构支持）
        try:
            scores_json = json.dumps({
                "total": total,
                "resource": resource,
                "price": price,
                "market": market,
                "grid": grid
            })
            cursor.execute("""
                UPDATE provinces SET scores = ? WHERE id = ?
            """, (scores_json, base_id + i))
        except:
            pass  # 如果 scores 字段不存在，跳过
    
    conn.commit()
    
    # 验证插入
    cursor.execute("SELECT COUNT(*) FROM provinces WHERE country = 'JP'")
    count = cursor.fetchone()[0]
    
    cursor.execute("SELECT grade, COUNT(*) FROM provinces WHERE country = 'JP' GROUP BY grade ORDER BY grade")
    grades = cursor.fetchall()
    
    conn.close()
    
    print("=" * 60)
    print("✅ 日本数据添加完成！")
    print("=" * 60)
    print(f"📊 添加都道府县：{count} 个")
    print("\n📈 等级分布:")
    for grade, cnt in grades:
        print(f"   {grade}级：{cnt} 个")
    print("=" * 60)

if __name__ == "__main__":
    add_japan_data()
