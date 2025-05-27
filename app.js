// app.js
class VisualizationApp {
  constructor() {
    this.visualizer = null; // 先不创建，等DOM加载完成后再创建
    this.isGenerating = false;
    this.initializeUI();
  }

  initializeUI() {
    const html = `
      <div class="app-container">
        <div class="input-section">
          <h2>🎨 智能可视化生成器</h2>
          <div class="input-group">
            <label for="text-input">输入文本或主题：</label>
            <textarea 
              id="text-input" 
              placeholder="请输入要可视化的文本内容，例如：&#10;• 人工智能的发展历程&#10;• 项目管理流程&#10;• 公司组织架构&#10;• 产品对比分析" 
              rows="8"
            ></textarea>
          </div>
          
          <div class="template-selector">
            <label>可视化类型（可选）：</label>
            <select id="template-select">
              <option value="auto">智能选择</option>
              <option value="mindmap">思维导图</option>
              <option value="flowchart">流程图</option>
              <option value="timeline">时间线</option>
              <option value="comparison">对比图</option>
              <option value="hierarchy">层级图</option>
              <option value="infographic">信息图表</option>
            </select>
          </div>

          <div class="api-key-section">
            <div class="api-key-header">
              <label for="api-key-input">🔑 API Key（可选）：</label>
              <button id="api-key-toggle" class="api-key-toggle" type="button">
                <span class="toggle-text">显示</span>
                <span class="toggle-icon">👁️</span>
              </button>
            </div>
            <div class="api-key-input-container">
              <input 
                type="password" 
                id="api-key-input" 
                placeholder="输入您的 DeepSeek API Key（留空使用演示模式）"
                autocomplete="off"
              />
              <div class="api-key-status">
                <span id="api-key-status-text">当前：演示模式</span>
              </div>
            </div>
            <div class="api-key-help">
              <details>
                <summary>如何获取 API Key？</summary>
                <div class="help-content">
                  <p>1. 访问 <a href="https://platform.deepseek.com" target="_blank">DeepSeek 开放平台</a></p>
                  <p>2. 注册账号并登录</p>
                  <p>3. 在控制台中创建 API Key</p>
                  <p>4. 将 API Key 粘贴到上方输入框</p>
                  <p><small>💡 使用自己的 API Key 可获得更好的生成效果</small></p>
                </div>
              </details>
            </div>
          </div>

          <div class="controls">
            <button id="generate-btn" class="primary-btn">
              <span class="btn-text">生成可视化</span>
              <span class="btn-loading" style="display: none;">
                <span class="spinner"></span>
                生成中...
              </span>
            </button>
            <button id="export-btn" class="secondary-btn" disabled>导出图片</button>
            <button id="clear-btn" class="tertiary-btn">清空内容</button>
          </div>

          <div class="status-info">
            <div id="status-message"></div>
          </div>
        </div>

        <div class="output-section">
          <div class="output-header">
            <h3>可视化结果</h3>
            <div class="output-info">
              <span id="template-type-display"></span>
              <span id="api-mode-display" class="api-mode-indicator">演示模式</span>
            </div>
          </div>
          <div id="output-container" class="output-canvas">
            <div class="placeholder">
              <div class="placeholder-icon">📊</div>
              <div class="placeholder-text">在左侧输入内容，点击"生成可视化"开始创建</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.innerHTML = html;
    
    // DOM 创建完成后，再初始化 Visualizer
    this.initializeVisualizer();
    this.attachEventListeners();
    this.loadSampleTexts();
  }

  initializeVisualizer() {
    // 确保 DOM 元素存在后再创建 Visualizer
    const container = document.getElementById('output-container');
    if (container) {
      this.visualizer = new Visualizer('output-container');
    } else {
      console.error('output-container 元素不存在');
    }
  }

  attachEventListeners() {
    // 生成按钮
    document.getElementById('generate-btn').addEventListener('click', () => {
      this.generateVisualization();
    });

    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportImage();
    });

    // 清空按钮
    document.getElementById('clear-btn').addEventListener('click', () => {
      this.clearContent();
    });

    // 回车键快捷生成（Ctrl+Enter）
    document.getElementById('text-input').addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.generateVisualization();
      }
    });

    // 实时字数统计
    document.getElementById('text-input').addEventListener('input', (e) => {
      this.updateCharCount(e.target.value.length);
    });

    // API Key 相关事件
    this.attachApiKeyListeners();
  }

  attachApiKeyListeners() {
    // API Key 显示/隐藏切换
    const toggleBtn = document.getElementById('api-key-toggle');
    const apiKeyInput = document.getElementById('api-key-input');
    const toggleText = toggleBtn.querySelector('.toggle-text');
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');

    toggleBtn.addEventListener('click', () => {
      if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleText.textContent = '隐藏';
        toggleIcon.textContent = '🙈';
      } else {
        apiKeyInput.type = 'password';
        toggleText.textContent = '显示';
        toggleIcon.textContent = '👁️';
      }
    });

    // API Key 输入监听
    apiKeyInput.addEventListener('input', (e) => {
      this.updateApiKeyStatus(e.target.value.trim());
    });

    // 从本地存储加载 API Key
    this.loadApiKeyFromStorage();
  }

  updateApiKeyStatus(apiKey) {
    const statusText = document.getElementById('api-key-status-text');
    const modeDisplay = document.getElementById('api-mode-display');
    
    if (apiKey) {
      statusText.textContent = '当前：自定义 API Key';
      statusText.style.color = '#28a745';
      if (modeDisplay) {
        modeDisplay.textContent = '自定义API';
        modeDisplay.className = 'api-mode-indicator custom';
      }
      // 保存到本地存储
      localStorage.setItem('deepseek_api_key', apiKey);
    } else {
      statusText.textContent = '当前：演示模式';
      statusText.style.color = '#6c757d';
      if (modeDisplay) {
        modeDisplay.textContent = '演示模式';
        modeDisplay.className = 'api-mode-indicator demo';
      }
      // 清除本地存储
      localStorage.removeItem('deepseek_api_key');
    }
  }

  loadApiKeyFromStorage() {
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey) {
      const apiKeyInput = document.getElementById('api-key-input');
      apiKeyInput.value = savedApiKey;
      this.updateApiKeyStatus(savedApiKey);
    }
  }

  getApiKey() {
    const apiKeyInput = document.getElementById('api-key-input');
    return apiKeyInput ? apiKeyInput.value.trim() : '';
  }

  loadSampleTexts() {
    // 添加示例文本按钮
    const sampleTexts = [
      {
        title: "AI发展历程",
        content: "人工智能的发展可以分为几个重要阶段：1950年代图灵测试提出，标志着AI概念诞生；1960年代专家系统兴起；1980年代机器学习算法发展；2000年代深度学习突破；2010年代大数据与算力提升推动AI应用爆发；2020年代大语言模型和生成式AI成为主流。"
      },
      {
        title: "项目管理流程",
        content: "项目管理包含五个核心阶段：项目启动阶段需要确定项目目标和可行性；规划阶段制定详细计划和资源分配；执行阶段按计划实施各项任务；监控阶段持续跟踪进度和质量；收尾阶段完成交付和总结经验。每个阶段都有明确的输入输出和关键节点。"
      },
      {
        title: "产品对比分析",
        content: "iPhone vs Android手机对比：iPhone优势在于系统流畅性高、生态系统完善、隐私保护好、品牌价值高，但价格昂贵、定制性差；Android优势在于价格选择多样、开放性强、定制化程度高、硬件配置丰富，但系统碎片化严重、安全性相对较低。"
      }
    ];

    const sampleContainer = document.createElement('div');
    sampleContainer.className = 'sample-texts';
    sampleContainer.innerHTML = `
      <label>快速开始：</label>
      <div class="sample-buttons">
        ${sampleTexts.map((sample, index) => 
          `<button class="sample-btn" data-index="${index}">${sample.title}</button>`
        ).join('')}
      </div>
    `;

    // 插入到输入框后面
    const inputGroup = document.querySelector('.input-group');
    if (inputGroup) {
      inputGroup.appendChild(sampleContainer);

      // 添加示例按钮事件
      sampleContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('sample-btn')) {
          const index = parseInt(e.target.dataset.index);
          document.getElementById('text-input').value = sampleTexts[index].content;
          this.updateCharCount(sampleTexts[index].content.length);
        }
      });
    }
  }

  updateCharCount(count) {
    let statusMessage = `字符数：${count}`;
    if (count > 1000) {
      statusMessage += ' ⚠️ 文本较长，可能影响生成速度';
    }
    const statusEl = document.getElementById('status-message');
    if (statusEl) {
      statusEl.textContent = statusMessage;
    }
  }

  async generateVisualization() {
    if (this.isGenerating) return;

    // 确保 visualizer 已初始化
    if (!this.visualizer) {
      this.initializeVisualizer();
      if (!this.visualizer) {
        this.showMessage('初始化失败，请刷新页面重试', 'error');
        return;
      }
    }

    const text = document.getElementById('text-input').value.trim();
    const selectedTemplate = document.getElementById('template-select').value;

    if (!text) {
      this.showMessage('请输入文本内容', 'error');
      return;
    }

    if (text.length < 10) {
      this.showMessage('文本内容太短，请输入更详细的内容', 'warning');
      return;
    }

    try {
      this.setGeneratingState(true);
      this.showMessage('正在分析文本内容...', 'info');

      // 1. 分析文本选择模板
      let templateType;
      if (selectedTemplate === 'auto') {
        templateType = TemplateSelector.analyzeContent(text);
        this.showMessage(`智能选择模板类型：${this.getTemplateDisplayName(templateType)}`, 'info');
      } else {
        templateType = selectedTemplate;
        this.showMessage(`使用指定模板：${this.getTemplateDisplayName(templateType)}`, 'info');
      }

      // 2. 调用AI生成结构化数据
      const apiKey = this.getApiKey();
      const mode = apiKey ? '使用自定义API Key' : '使用演示模式';
      this.showMessage(`正在生成可视化数据...（${mode}）`, 'info');
      const structuredData = await TemplateSelector.extractStructuredData(text, templateType, apiKey);
      
      console.log('生成的数据:', structuredData);

      // 3. 渲染可视化
      this.showMessage('正在渲染可视化图形...', 'info');
      await this.visualizer.render(structuredData);

      // 4. 更新UI状态
      const displayEl = document.getElementById('template-type-display');
      if (displayEl) {
        displayEl.textContent = `类型：${this.getTemplateDisplayName(templateType)}`;
      }
      
      const exportBtn = document.getElementById('export-btn');
      if (exportBtn) {
        exportBtn.disabled = false;
      }
      
      this.showMessage('✅ 可视化生成完成！', 'success');

    } catch (error) {
      console.error('生成可视化时出错:', error);
      this.showMessage(`❌ 生成失败：${error.message}`, 'error');
    } finally {
      this.setGeneratingState(false);
    }
  }

  async exportImage() {
    if (!this.visualizer) {
      this.showMessage('可视化器未初始化', 'error');
      return;
    }

    try {
      this.showMessage('正在生成图片...', 'info');
      
      // 使用智能导出方法
      const dataUrl = await this.visualizer.smartExport();
      
      // 创建下载链接
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `visualization-${timestamp}.png`;
      link.href = dataUrl;
      link.click();
      
      this.showMessage('✅ 图片导出成功！', 'success');
    } catch (error) {
      console.error('导出图片时出错:', error);
      this.showMessage(`❌ 导出失败：${error.message}`, 'error');
      
      // 如果智能导出失败，提供手动选择导出方式的选项
      this.showExportOptions();
    }
  }

  showExportOptions() {
    const existingModal = document.querySelector('.export-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 400px;
      text-align: center;
    `;

    content.innerHTML = `
      <h3 style="margin-bottom: 20px; color: #2c3e50;">选择导出方式</h3>
      <p style="margin-bottom: 20px; color: #666;">自动导出失败，请选择导出方式：</p>
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
        <button id="export-complex" style="padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 6px; cursor: pointer; width: 200px;">
          优化导出（推荐）
        </button>
        <button id="export-html2canvas" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; width: 200px;">
          标准HTML导出
        </button>
        <button id="export-svg" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; width: 200px;">
          SVG导出
        </button>
        <button id="export-cancel" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; width: 200px;">
          取消
        </button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // 添加事件监听
    document.getElementById('export-complex').addEventListener('click', async () => {
      modal.remove();
      try {
        this.showMessage('正在使用优化方式导出...', 'info');
        const dataUrl = await this.visualizer.exportComplexContent();
        this.downloadImage(dataUrl);
        this.showMessage('✅ 图片导出成功！', 'success');
      } catch (error) {
        this.showMessage(`❌ 优化导出失败：${error.message}`, 'error');
      }
    });

    document.getElementById('export-html2canvas').addEventListener('click', async () => {
      modal.remove();
      try {
        this.showMessage('正在使用HTML方式导出...', 'info');
        const dataUrl = await this.visualizer.exportImage();
        this.downloadImage(dataUrl);
        this.showMessage('✅ 图片导出成功！', 'success');
      } catch (error) {
        this.showMessage(`❌ HTML导出失败：${error.message}`, 'error');
      }
    });

    document.getElementById('export-svg').addEventListener('click', async () => {
      modal.remove();
      try {
        this.showMessage('正在使用SVG方式导出...', 'info');
        const dataUrl = await this.visualizer.exportSVGImage();
        this.downloadImage(dataUrl);
        this.showMessage('✅ 图片导出成功！', 'success');
      } catch (error) {
        this.showMessage(`❌ SVG导出失败：${error.message}`, 'error');
      }
    });

    document.getElementById('export-cancel').addEventListener('click', () => {
      modal.remove();
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  downloadImage(dataUrl) {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `visualization-${timestamp}.png`;
    link.href = dataUrl;
    link.click();
  }

  clearContent() {
    const textInput = document.getElementById('text-input');
    const templateSelect = document.getElementById('template-select');
    const outputContainer = document.getElementById('output-container');
    const exportBtn = document.getElementById('export-btn');
    const templateDisplay = document.getElementById('template-type-display');

    if (textInput) textInput.value = '';
    if (templateSelect) templateSelect.value = 'auto';
    if (outputContainer) {
      outputContainer.innerHTML = `
        <div class="placeholder">
          <div class="placeholder-icon">📊</div>
          <div class="placeholder-text">在左侧输入内容，点击"生成可视化"开始创建</div>
        </div>
      `;
    }
    if (exportBtn) exportBtn.disabled = true;
    if (templateDisplay) templateDisplay.textContent = '';
    
    this.showMessage('内容已清空', 'info');
    this.updateCharCount(0);
  }

  clearApiKey() {
    const apiKeyInput = document.getElementById('api-key-input');
    if (apiKeyInput) {
      apiKeyInput.value = '';
      this.updateApiKeyStatus('');
    }
  }

  setGeneratingState(isGenerating) {
    this.isGenerating = isGenerating;
    const btn = document.getElementById('generate-btn');
    if (!btn) return;

    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    
    if (isGenerating) {
      btn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = 'inline-flex';
    } else {
      btn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
    }
  }

  showMessage(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `status-${type}`;
    
    // 自动清除成功和错误消息
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        if (statusEl.textContent === message) {
          statusEl.textContent = '';
          statusEl.className = '';
        }
      }, 5000);
    }
  }

  getTemplateDisplayName(templateType) {
    const names = {
      'mindmap': '思维导图',
      'flowchart': '流程图',
      'timeline': '时间线',
      'comparison': '对比图',
      'hierarchy': '层级图',
      'infographic': '信息图表'
    };
    return names[templateType] || templateType;
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new VisualizationApp();
});
