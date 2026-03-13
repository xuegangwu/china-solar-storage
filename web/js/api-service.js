/**
 * API 服务客户端
 * 连接后端 API 服务
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }
  
  // 设置 Token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }
  
  // 清除 Token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }
  
  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // 添加认证头
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '请求失败');
      }
      
      return data;
    } catch (error) {
      console.error('API 请求错误:', error);
      throw error;
    }
  }
  
  // ==================== 省份相关 API ====================
  
  // 获取所有省份
  async getProvinces() {
    return this.request('/provinces');
  }
  
  // 获取省份详情
  async getProvince(id) {
    return this.request(`/provinces/${id}`);
  }
  
  // 搜索省份
  async searchProvinces(query, grade, minScore) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (grade) params.append('grade', grade);
    if (minScore) params.append('minScore', minScore);
    return this.request(`/provinces/search?${params}`);
  }
  
  // 获取省份历史
  async getProvinceHistory(id) {
    return this.request(`/provinces/${id}/history`);
  }
  
  // 获取排名
  async getRankings(year) {
    return this.request(`/provinces/rankings${year ? `?year=${year}` : ''}`);
  }
  
  // ==================== 用户相关 API ====================
  
  // 注册
  async register(name, email, password) {
    const response = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    
    if (response.success) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }
  
  // 登录
  async login(email, password) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }
  
  // 登出
  logout() {
    this.clearToken();
  }
  
  // 获取用户信息
  async getProfile() {
    return this.request('/users/profile');
  }
  
  // 更新用户信息
  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  // ==================== AI 分析相关 API ====================
  
  // 获取智能推荐
  async getRecommendation(budget, riskTolerance, preference) {
    return this.request('/analysis/recommend', {
      method: 'POST',
      body: JSON.stringify({ budget, riskTolerance, preference })
    });
  }
  
  // 收益预测
  async predict(provinceId, investment, capacity) {
    return this.request('/analysis/predict', {
      method: 'POST',
      body: JSON.stringify({ provinceId, investment, capacity })
    });
  }
  
  // 风险评估
  async getRiskAssessment(provinceId) {
    return this.request(`/analysis/risk-assessment?provinceId=${provinceId}`);
  }
  
  // ==================== 报告相关 API ====================
  
  // 生成报告
  async generateReport(provinceIds, format = 'pdf') {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ provinceIds, format })
    });
  }
  
  // 下载报告
  async downloadReport(reportId) {
    return this.request(`/reports/${reportId}/download`);
  }
}

// 导出单例
const apiService = new ApiService();
export default apiService;
