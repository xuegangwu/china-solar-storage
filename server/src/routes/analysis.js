/**
 * AI 智能分析 API 路由
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');

const provinces = require('../../data/provinces-2026.json');

/**
 * @swagger
 * /api/analysis/recommend:
 *   post:
 *     summary: 获取智能投资建议
 *     tags: [AI 分析]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               budget:
 *                 type: number
 *               riskTolerance:
 *                 type: string
 *                 enum: [low, medium, high]
 *               preference:
 *                 type: string
 *                 enum: [short-term, long-term]
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/recommend', authenticateToken, async (req, res) => {
  try {
    const { budget, riskTolerance = 'medium', preference = 'long-term' } = req.body;
    
    // 智能推荐算法
    const recommendations = provinces.provinces.map(province => {
      let score = province.scores.total;
      
      // 根据风险偏好调整
      if (riskTolerance === 'low') {
        score = score * 0.3 + province.scores.policy * 0.4 + province.scores.risk * 0.3;
      } else if (riskTolerance === 'high') {
        score = score * 0.5 + province.scores.price * 0.5;
      }
      
      // 根据投资期限调整
      if (preference === 'short-term') {
        score += province.data.peakValley * 0.1;
      } else {
        score += province.data.policyStability * 0.1;
      }
      
      return {
        ...province,
        recommendationScore: score.toFixed(1),
        recommendationLevel: score >= 85 ? '强烈推荐' : score >= 75 ? '推荐' : '谨慎'
      };
    });
    
    // 排序并取前 5 名
    const top5 = recommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        recommendations: top5,
        criteria: {
          budget,
          riskTolerance,
          preference
        },
        generatedAt: new Date().toISOString()
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
 * /api/analysis/predict:
 *   post:
 *     summary: 收益预测
 *     tags: [AI 分析]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provinceId:
 *                 type: integer
 *               investment:
 *                 type: number
 *               capacity:
 *                 type: number
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/predict', authenticateToken, async (req, res) => {
  try {
    const { provinceId, investment, capacity } = req.body;
    
    const province = provinces.provinces.find(p => p.id === provinceId);
    
    if (!province) {
      return res.status(404).json({
        success: false,
        message: '省份不存在'
      });
    }
    
    // 预测算法（简化版）
    const annualGeneration = capacity * province.data.utilizationHours;
    const annualRevenue = annualGeneration * province.data.coalPrice;
    const annualCost = annualRevenue * 0.15; // 运营成本 15%
    const annualProfit = annualRevenue - annualCost;
    
    // 考虑补贴
    const subsidy = annualGeneration * province.data.subsidy;
    const totalAnnualProfit = annualProfit + subsidy;
    
    // 20 年预测
    const predictions = [];
    let cumulativeCashFlow = -investment;
    
    for (let year = 1; year <= 20; year++) {
      // 考虑衰减和通胀
      const degradationFactor = Math.pow(0.995, year); // 每年衰减 0.5%
      const inflationFactor = Math.pow(1.02, year); // 通胀 2%
      
      const yearlyProfit = totalAnnualProfit * degradationFactor * inflationFactor;
      cumulativeCashFlow += yearlyProfit;
      
      predictions.push({
        year,
        revenue: (annualRevenue * degradationFactor * inflationFactor).toFixed(0),
        cost: (annualCost * degradationFactor * inflationFactor).toFixed(0),
        profit: yearlyProfit.toFixed(0),
        cumulativeCashFlow: cumulativeCashFlow.toFixed(0),
        roi: ((cumulativeCashFlow / investment) * 100).toFixed(1)
      });
    }
    
    // 计算关键指标
    const paybackYear = predictions.findIndex(p => parseFloat(p.cumulativeCashFlow) > 0) + 1;
    const totalRoi = ((parseFloat(predictions[19].cumulativeCashFlow) / investment) * 100).toFixed(1);
    
    res.json({
      success: true,
      data: {
        province: province.name,
        predictions,
        metrics: {
          paybackPeriod: `${paybackYear}年`,
          totalRoi: `${totalRoi}%`,
          totalProfit: predictions[19].cumulativeCashFlow
        }
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
 * /api/analysis/risk-assessment:
 *   get:
 *     summary: 风险评估
 *     tags: [AI 分析]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provinceId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/risk-assessment', authenticateToken, async (req, res) => {
  try {
    const { provinceId } = req.query;
    
    const province = provinces.provinces.find(p => p.id === parseInt(provinceId));
    
    if (!province) {
      return res.status(404).json({
        success: false,
        message: '省份不存在'
      });
    }
    
    // 风险评估模型
    const risks = [
      {
        category: '政策风险',
        score: 100 - province.scores.policy,
        level: province.scores.policy >= 85 ? '低' : province.scores.policy >= 70 ? '中' : '高',
        description: '政策连续性和政府支持度评估'
      },
      {
        category: '市场风险',
        score: 100 - province.scores.market,
        level: province.scores.market >= 85 ? '低' : province.scores.market >= 70 ? '中' : '高',
        description: '市场化程度和用电需求评估'
      },
      {
        category: '电网风险',
        score: 100 - province.scores.grid,
        level: province.scores.grid >= 85 ? '低' : province.scores.grid >= 70 ? '中' : '高',
        description: '电网消纳能力和接入便利性评估'
      },
      {
        category: '汇率风险',
        score: province.data.exchangeRisk || 0,
        level: province.data.exchangeRisk === 0 ? '低' : '中',
        description: '汇率波动对收益的影响'
      }
    ];
    
    const overallRiskScore = risks.reduce((sum, r) => sum + r.score, 0) / risks.length;
    const overallRiskLevel = overallRiskScore <= 15 ? '低风险' : overallRiskScore <= 30 ? '中风险' : '高风险';
    
    res.json({
      success: true,
      data: {
        province: province.name,
        risks,
        overall: {
          score: overallRiskScore.toFixed(1),
          level: overallRiskLevel
        },
        recommendations: generateRiskRecommendations(risks)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 生成风险建议
function generateRiskRecommendations(risks) {
  const recommendations = [];
  
  risks.forEach(risk => {
    if (risk.level === '高') {
      recommendations.push(`⚠️ 关注${risk.category}：${risk.description}，建议采取对冲策略`);
    } else if (risk.level === '中') {
      recommendations.push(`⚡ 注意${risk.category}：${risk.description}，建议定期监控`);
    }
  });
  
  return recommendations;
}

module.exports = router;
