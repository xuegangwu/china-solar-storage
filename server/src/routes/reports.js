/**
 * 报告生成 API 路由
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const provinces = require('../../data/provinces-2026.json');

/**
 * @swagger
 * /api/reports/generate:
 *   post:
 *     summary: 生成投资分析报告
 *     tags: [报告]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provinceIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               format:
 *                 type: string
 *                 enum: [pdf, html, markdown]
 *               includeCharts:
 *                 type: boolean
 *               includeRecommendations:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { provinceIds, format = 'pdf', includeCharts = true, includeRecommendations = true } = req.body;
    
    // 获取省份数据
    const selectedProvinces = provinces.provinces.filter(p => provinceIds.includes(p.id));
    
    if (selectedProvinces.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择至少一个省份'
      });
    }
    
    // 生成报告内容
    const report = {
      id: `report_${Date.now()}`,
      title: `光储投资分析报告 - ${selectedProvinces.map(p => p.name).join(' & ')}`,
      generatedAt: new Date().toISOString(),
      author: req.user.name,
      format,
      provinces: selectedProvinces,
      summary: generateSummary(selectedProvinces),
      comparisons: generateComparisons(selectedProvinces),
      recommendations: includeRecommendations ? generateRecommendations(selectedProvinces) : [],
      charts: includeCharts ? generateChartsData(selectedProvinces) : []
    };
    
    // 保存报告（实际应保存到数据库）
    const reportUrl = `/api/reports/${report.id}/download`;
    
    res.json({
      success: true,
      message: '报告生成成功',
      data: {
        reportId: report.id,
        title: report.title,
        format,
        downloadUrl: reportUrl,
        generatedAt: report.generatedAt,
        pageCount: selectedProvinces.length * 3 // 估算页数
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/reports/:id/download:
 *   get:
 *     summary: 下载报告
 *     tags: [报告]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/:id/download', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // 模拟下载报告（实际应生成 PDF 文件）
    res.json({
      success: true,
      message: '报告已生成',
      data: {
        reportId: id,
        filename: `光储投资报告_${id}.pdf`,
        size: '2.5 MB',
        downloadUrl: `https://reports.solar-storage-map.com/${id}.pdf`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/reports/templates:
 *   get:
 *     summary: 获取报告模板列表
 *     tags: [报告]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/templates', authenticateToken, (req, res) => {
  try {
    const templates = [
      {
        id: 'standard',
        name: '标准分析报告',
        description: '包含省份基本信息、评分对比、投资建议',
        pages: 5,
        sections: ['概述', '评分分析', '详细数据', '投资建议', '风险提示']
      },
      {
        id: 'detailed',
        name: '详细分析报告',
        description: '完整的历史数据、趋势分析、收益预测',
        pages: 15,
        sections: ['概述', '历史趋势', '多维度对比', '收益预测', '风险评估', '政策分析', '投资建议']
      },
      {
        id: 'executive',
        name: '决策简报',
        description: '面向高层的简洁决策报告',
        pages: 3,
        sections: ['核心结论', 'Top 3 推荐', '关键数据']
      },
      {
        id: 'comparison',
        name: '多省对比报告',
        description: '专注于多个省份的对比分析',
        pages: 8,
        sections: ['对比总览', '维度分析', '排名变化', '优劣势分析', '最终推荐']
      }
    ];
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 生成报告摘要
function generateSummary(provinces) {
  const avgScore = provinces.reduce((sum, p) => sum + p.scores.total, 0) / provinces.length;
  const topProvince = provinces.reduce((max, p) => p.scores.total > max.scores.total ? p : max);
  const gradeDistribution = {};
  
  provinces.forEach(p => {
    gradeDistribution[p.grade] = (gradeDistribution[p.grade] || 0) + 1;
  });
  
  return {
    totalProvinces: provinces.length,
    averageScore: avgScore.toFixed(1),
    topProvince: {
      name: topProvince.name,
      score: topProvince.scores.total,
      grade: topProvince.grade
    },
    gradeDistribution,
    investmentLevel: avgScore >= 85 ? '强烈推荐' : avgScore >= 75 ? '推荐' : '谨慎'
  };
}

// 生成对比数据
function generateComparisons(provinces) {
  return {
    scoreRanking: [...provinces].sort((a, b) => b.scores.total - a.scores.total),
    priceRanking: [...provinces].sort((a, b) => b.data.coalPrice - a.data.coalPrice),
    resourceRanking: [...provinces].sort((a, b) => b.scores.resource - a.scores.resource),
    policyRanking: [...provinces].sort((a, b) => b.scores.policy - a.scores.policy)
  };
}

// 生成投资建议
function generateRecommendations(provinces) {
  const recommendations = [];
  
  provinces.forEach(province => {
    if (province.scores.total >= 85) {
      recommendations.push({
        province: province.name,
        level: '强烈推荐',
        reasons: [
          `综合评分 ${province.scores.total} 分，排名靠前`,
          `电价政策优越，燃煤基准价 ${province.data.coalPrice} 元/kWh`,
          `政策稳定性 ${province.scores.policy} 分，投资环境良好`
        ],
        suggestion: '建议重点关注，优先布局工商业分布式项目'
      });
    } else if (province.scores.total >= 75) {
      recommendations.push({
        province: province.name,
        level: '推荐',
        reasons: [
          `综合评分 ${province.scores.total} 分，具备投资价值`,
          `峰谷价差 ${province.data.peakValley} 元/kWh，收益空间可观`
        ],
        suggestion: '建议适度投资，关注政策变化'
      });
    }
  });
  
  return recommendations;
}

// 生成图表数据
function generateChartsData(provinces) {
  return [
    {
      type: 'bar',
      title: '综合评分对比',
      data: provinces.map(p => ({ name: p.name, value: p.scores.total }))
    },
    {
      type: 'radar',
      title: '多维度评分雷达图',
      data: provinces.map(p => ({
        name: p.name,
        values: {
          '资源禀赋': p.scores.resource,
          '电价政策': p.scores.price,
          '市场条件': p.scores.market,
          '电网条件': p.scores.grid,
          '政策稳定性': p.scores.policy,
          '风险评估': p.scores.risk
        }
      }))
    },
    {
      type: 'line',
      title: '历史趋势对比',
      data: provinces.map(p => ({
        name: p.name,
        values: p.history.map(h => ({ year: h.year, score: h.score }))
      }))
    }
  ];
}

module.exports = router;
