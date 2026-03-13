/**
 * 主题切换工具
 * 支持深色/浅色模式切换
 * 自动保存用户偏好
 */

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }
  
  // 初始化
  init() {
    this.applyTheme(this.currentTheme);
    this.createToggleButton();
    this.bindEvents();
  }
  
  // 应用主题
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
  }
  
  // 切换主题
  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }
  
  // 创建切换按钮
  createToggleButton() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
    button.title = '切换主题';
    button.setAttribute('aria-label', '切换主题');
    
    document.body.appendChild(button);
    this.toggleButton = button;
  }
  
  // 绑定事件
  bindEvents() {
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.toggle();
        this.updateButtonIcon();
      });
    }
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme(e.matches ? 'dark' : 'light');
        this.updateButtonIcon();
      }
    });
  }
  
  // 更新按钮图标
  updateButtonIcon() {
    if (this.toggleButton) {
      this.toggleButton.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
    }
  }
  
  // 获取当前主题
  getTheme() {
    return this.currentTheme;
  }
  
  // 设置主题
  setTheme(theme) {
    this.applyTheme(theme);
    this.updateButtonIcon();
  }
}

/**
 * 移动端菜单管理器
 */
class MobileMenuManager {
  constructor() {
    this.isOpen = false;
    this.init();
  }
  
  // 初始化
  init() {
    this.createMenu();
    this.bindEvents();
  }
  
  // 创建菜单
  createMenu() {
    // 汉堡按钮
    this.menuButton = document.createElement('button');
    this.menuButton.className = 'mobile-menu-btn';
    this.menuButton.innerHTML = '☰';
    this.menuButton.setAttribute('aria-label', '菜单');
    
    // 侧边菜单
    this.menu = document.createElement('div');
    this.menu.className = 'mobile-menu';
    this.menu.innerHTML = `
      <div class="mobile-menu-header">
        <h3>菜单</h3>
        <button class="mobile-menu-close">×</button>
      </div>
      <nav class="mobile-menu-nav">
        <a href="map-v1.0.html">🗺️ 地图</a>
        <a href="province-detail.html">📊 省份详情</a>
        <a href="calculator.html">🧮 收益计算</a>
        <a href="comparison.html">📈 对比分析</a>
        <a href="digital-twin-simple.html">🎮 数字孪生</a>
      </nav>
    `;
    
    document.body.appendChild(this.menuButton);
    document.body.appendChild(this.menu);
  }
  
  // 绑定事件
  bindEvents() {
    this.menuButton.addEventListener('click', () => this.open());
    
    const closeBtn = this.menu.querySelector('.mobile-menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menu.contains(e.target) && !this.menuButton.contains(e.target)) {
        this.close();
      }
    });
  }
  
  // 打开菜单
  open() {
    this.menu.classList.add('open');
    this.isOpen = true;
  }
  
  // 关闭菜单
  close() {
    this.menu.classList.remove('open');
    this.isOpen = false;
  }
  
  // 切换菜单
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}

/**
 * 手势管理器
 * 支持滑动、缩放等手势
 */
class GestureManager {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.init();
  }
  
  // 初始化
  init() {
    this.bindEvents();
  }
  
  // 绑定事件
  bindEvents() {
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
  }
  
  // 触摸开始
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }
  
  // 触摸移动
  handleTouchMove(e) {
    if (!this.touchStartX || !this.touchStartY) {
      return;
    }
    
    let touchEndX = e.touches[0].clientX;
    let touchEndY = e.touches[0].clientY;
    
    let diffX = this.touchStartX - touchEndX;
    let diffY = this.touchStartY - touchEndY;
    
    // 检测水平滑动
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.onSwipeLeft();
        } else {
          this.onSwipeRight();
        }
      }
    }
  }
  
  // 触摸结束
  handleTouchEnd(e) {
    this.touchStartX = 0;
    this.touchStartY = 0;
  }
  
  // 左滑
  onSwipeLeft() {
    console.log('左滑');
  }
  
  // 右滑
  onSwipeRight() {
    console.log('右滑');
  }
  
  // 上滑
  onSwipeUp() {
    console.log('上滑');
  }
  
  // 下滑
  onSwipeDown() {
    console.log('下滑');
  }
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  
  // 仅移动端初始化菜单
  if (window.innerWidth <= 768) {
    new MobileMenuManager();
    new GestureManager();
  }
});

// 窗口大小变化时重新检查
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    if (!window.mobileMenuManager) {
      window.mobileMenuManager = new MobileMenuManager();
      window.gestureManager = new GestureManager();
    }
  }
});
