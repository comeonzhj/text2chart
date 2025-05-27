// mockAI.js
class MockAIProcessor {
  constructor() {
    // 请在这里设置你的 DeepSeek API Key
    this.apiKey = ''; // 请替换为你的实际API Key
    this.apiUrl = 'https://api.deepseek.com/chat/completions';
    this.fallbackMode = false; // 如果API调用失败，是否使用模拟数据
  }

  async process(text, templateType, customApiKey = null) {
    try {
      // 如果提供了自定义API Key，使用它；否则使用默认的
      const apiKeyToUse = customApiKey || this.apiKey;
      
      if (customApiKey) {
        console.log('使用自定义 API Key');
      } else if (this.apiKey) {
        console.log('使用默认 API Key');
      } else {
        console.log('未配置 API Key，直接使用模拟数据');
        return this.generateMockData(text, templateType);
      }
      
      // 尝试使用 DeepSeek API
      const result = await this.callDeepSeekAPI(text, templateType, apiKeyToUse);
      return result;
    } catch (error) {
      console.warn('DeepSeek API 调用失败，使用模拟数据:', error);
      // 如果API调用失败，使用本地模拟数据
      return this.generateMockData(text, templateType);
    }
  }

  async callDeepSeekAPI(text, templateType, apiKey) {
    const prompt = this.buildPrompt(text, templateType);
    
    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system", 
          content: "你是一个专业的数据可视化助手，能够将文本内容转换为结构化的可视化数据。请严格按照JSON格式返回数据，不要包含任何其他文字说明。不要包含代码块标识符。"
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      stream: false,
      temperature: 0.7,
      max_tokens: 2000
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // 解析返回的JSON数据
    try {
      const parsedData = JSON.parse(content);
      return this.validateAndEnhanceData(parsedData, templateType);
    } catch (parseError) {
      console.error('解析AI返回数据失败:', parseError);
      console.log('原始返回内容:', content);
      // 如果解析失败，使用模拟数据
      return this.generateMockData(text, templateType);
    }
  }

  buildPrompt(text, templateType) {
    const basePrompt = `请分析以下文本内容，并生成适合"${templateType}"类型的可视化数据结构。

文本内容：
${text}

`;

    switch (templateType) {
      case TEMPLATE_TYPES.MINDMAP:
        return basePrompt + this.getMindmapPrompt();
      
      case TEMPLATE_TYPES.FLOWCHART:
        return basePrompt + this.getFlowchartPrompt();
      
      case TEMPLATE_TYPES.TIMELINE:
        return basePrompt + this.getTimelinePrompt();
      
      case TEMPLATE_TYPES.COMPARISON:
        return basePrompt + this.getComparisonPrompt();
      
      case TEMPLATE_TYPES.HIERARCHY:
        return basePrompt + this.getHierarchyPrompt();
      
      case TEMPLATE_TYPES.INFOGRAPHIC:
        return basePrompt + this.getInfographicPrompt();
      
      default:
        return basePrompt + this.getMindmapPrompt();
    }
  }

  getMindmapPrompt() {
    return `请生成思维导图的JSON数据结构，格式如下：
{
  "type": "mindmap",
  "title": "从文本中提取的主题标题",
  "centerNode": {
    "id": "center",
    "text": "中心主题（15字以内）",
    "x": 400,
    "y": 300
  },
  "nodes": [
    {
      "id": "1",
      "text": "主要分支1（10字以内）",
      "x": 200,
      "y": 200,
      "parent": "center",
      "level": 1
    },
    {
      "id": "1-1",
      "text": "子分支（8字以内）",
      "x": 100,
      "y": 150,
      "parent": "1",
      "level": 2
    }
  ],
  "connections": [
    {"from": "center", "to": "1"},
    {"from": "1", "to": "1-1"}
  ],
  "style": {
    "backgroundColor": "#f5f5f5",
    "nodeColor": "#4a90e2",
    "textColor": "#333",
    "lineColor": "#666"
  }
}

要求：
1. 根据文本内容提取3-6个主要分支
2. 每个主要分支可以有1-3个子分支
3. 节点位置要合理分布
4. 文本要简洁明了`;
  }

  getFlowchartPrompt() {
    return `请生成流程图的JSON数据结构，格式如下：
{
  "type": "flowchart",
  "title": "流程标题",
  "nodes": [
    {
      "id": "start",
      "text": "开始",
      "type": "start",
      "x": 400,
      "y": 50
    },
    {
      "id": "step1",
      "text": "步骤1",
      "type": "process",
      "x": 400,
      "y": 150
    },
    {
      "id": "decision1",
      "text": "判断条件？",
      "type": "decision",
      "x": 400,
      "y": 250
    },
    {
      "id": "end",
      "text": "结束",
      "type": "end",
      "x": 400,
      "y": 450
    }
  ],
  "connections": [
    {"from": "start", "to": "step1", "label": ""},
    {"from": "step1", "to": "decision1", "label": ""},
    {"from": "decision1", "to": "end", "label": "是"}
  ],
  "style": {
    "backgroundColor": "#ffffff",
    "nodeColors": {
      "start": "#28a745",
      "process": "#007bff",
      "decision": "#ffc107",
      "end": "#dc3545"
    }
  }
}

要求：
1. 根据文本提取清晰的流程步骤
2. 包含开始和结束节点
3. 适当添加判断节点
4. 连接线要有合理的标签`;
  }

  getTimelinePrompt() {
    return `请生成时间线的JSON数据结构，格式如下：
{
  "type": "timeline",
  "title": "时间线标题",
  "events": [
    {
      "id": "1",
      "date": "2020年1月",
      "title": "事件标题",
      "description": "事件描述",
      "x": 100,
      "y": 200,
      "side": "left"
    },
    {
      "id": "2",
      "date": "2021年6月",
      "title": "事件标题2",
      "description": "事件描述2",
      "x": 300,
      "y": 200,
      "side": "right"
    }
  ],
  "style": {
    "lineColor": "#007bff",
    "eventColor": "#28a745",
    "textColor": "#333"
  }
}

要求：
1. 从文本中提取时间相关信息
2. 按时间顺序排列
3. 左右交替布局
4. 每个事件要有清晰的时间点`;
  }

  getComparisonPrompt() {
    return `请生成对比图的JSON数据结构，格式如下：
{
  "type": "comparison",
  "title": "对比分析",
  "items": [
    {
      "id": "item1",
      "title": "对象A",
      "features": [
        {"name": "特征1", "value": "描述1", "score": 8},
        {"name": "特征2", "value": "描述2", "score": 6}
      ],
      "x": 200,
      "y": 200
    },
    {
      "id": "item2",
      "title": "对象B",
      "features": [
        {"name": "特征1", "value": "描述1", "score": 7},
        {"name": "特征2", "value": "描述2", "score": 9}
      ],
      "x": 600,
      "y": 200
    }
  ],
  "style": {
    "primaryColor": "#007bff",
    "secondaryColor": "#28a745"
  }
}

要求：
1. 提取需要对比的对象
2. 找出关键对比维度
3. 给出客观的评分（1-10）
4. 突出差异点`;
  }

  getHierarchyPrompt() {
    return `请生成层级图的JSON数据结构，格式如下：
{
  "type": "hierarchy",
  "title": "组织结构",
  "nodes": [
    {
      "id": "root",
      "text": "顶层",
      "level": 0,
      "x": 400,
      "y": 50,
      "children": ["child1", "child2"]
    },
    {
      "id": "child1",
      "text": "子层1",
      "level": 1,
      "x": 200,
      "y": 150,
      "parent": "root",
      "children": []
    }
  ],
  "connections": [
    {"from": "root", "to": "child1"}
  ],
  "style": {
    "nodeColor": "#007bff",
    "lineColor": "#666"
  }
}

要求：
1. 识别层级关系
2. 合理分布节点位置
3. 清晰的上下级关系
4. 不超过4层深度`;
  }

  getInfographicPrompt() {
    return `请生成信息图表的JSON数据结构，格式如下：
{
  "type": "infographic",
  "title": "信息图表标题",
  "sections": [
    {
      "type": "header",
      "content": "标题内容",
      "style": {"backgroundColor": "#e74c3c", "color": "white"}
    },
    {
      "type": "stats",
      "items": [
        {"label": "统计项1", "value": "数值1", "unit": "单位"},
        {"label": "统计项2", "value": "数值2", "unit": "单位"}
      ]
    },
    {
      "type": "chart",
      "chartType": "bar",
      "data": [
        {"label": "项目A", "value": 75},
        {"label": "项目B", "value": 60}
      ]
    },
    {
      "type": "text",
      "content": "重要说明文字"
    }
  ],
  "style": {
    "primaryColor": "#e74c3c",
    "secondaryColor": "#f8f9fa",
    "accentColor": "#3498db"
  }
}

要求：
1. 提取关键数据和统计信息
2. 设计合理的信息层次
3. 包含图表数据
4. 突出重点信息`;
  }

  getComparisonPrompt() {
    return `请生成对比图的JSON数据结构，格式如下：
  {
    "type": "comparison",
    "title": "对比分析标题",
    "items": [
      {
        "id": "item1",
        "title": "对象A名称",
        "features": [
          {"name": "特征1", "value": "具体描述1", "score": 8},
          {"name": "特征2", "value": "具体描述2", "score": 6},
          {"name": "特征3", "value": "具体描述3", "score": 9}
        ]
      },
      {
        "id": "item2", 
        "title": "对象B名称",
        "features": [
          {"name": "特征1", "value": "具体描述1", "score": 7},
          {"name": "特征2", "value": "具体描述2", "score": 9},
          {"name": "特征3", "value": "具体描述3", "score": 5}
        ]
      }
    ],
    "style": {
      "primaryColor": "#007bff",
      "secondaryColor": "#28a745"
    }
  }

  要求：
  1. 提取需要对比的2个主要对象
  2. 找出3-6个关键对比维度
  3. 给出客观的评分（1-10分）
  4. 描述要简洁明了
  5. 突出两者的差异和优势`;
  }

  getHierarchyPrompt() {
    return `请生成层级图的JSON数据结构，格式如下：
  {
    "type": "hierarchy",
    "title": "层级结构标题",
    "nodes": [
      {
        "id": "root",
        "text": "顶层节点",
        "level": 0,
        "children": ["child1", "child2"]
      },
      {
        "id": "child1",
        "text": "二级节点1",
        "level": 1,
        "parent": "root",
        "children": ["grandchild1"]
      },
      {
        "id": "grandchild1",
        "text": "三级节点1",
        "level": 2,
        "parent": "child1",
        "children": []
      }
    ],
    "connections": [
      {"from": "root", "to": "child1"},
      {"from": "child1", "to": "grandchild1"}
    ],
    "style": {
      "nodeColor": "#007bff",
      "lineColor": "#666"
    }
  }

  要求：
  1. 识别清晰的层级关系（组织架构、分类体系等）
  2. 节点名称简洁（不超过8个字）
  3. 层级不超过4层
  4. 每个节点都要有明确的level属性
  5. 正确设置parent-child关系`;
  }

  validateAndEnhanceData(data, templateType) {
    // 验证和增强AI返回的数据
    if (!data || !data.type) {
      throw new Error('数据格式不正确');
    }

    // 确保数据完整性
    switch (templateType) {
      case TEMPLATE_TYPES.MINDMAP:
        return this.enhanceMindmapData(data);
      case TEMPLATE_TYPES.INFOGRAPHIC:
        return this.enhanceInfographicData(data);
      default:
        return data;
    }
  }

  enhanceMindmapData(data) {
    // 确保思维导图数据完整
    if (!data.centerNode) {
      data.centerNode = {
        id: 'center',
        text: data.title || '主题',
        x: 400,
        y: 300
      };
    }

    if (!data.nodes) {
      data.nodes = [];
    }

    if (!data.connections) {
      data.connections = [];
    }

    if (!data.style) {
      data.style = {
        backgroundColor: '#f5f5f5',
        nodeColor: '#4a90e2',
        textColor: '#333',
        lineColor: '#666'
      };
    }

    return data;
  }

  enhanceInfographicData(data) {
    // 确保信息图数据完整
    if (!data.sections) {
      data.sections = [];
    }

    if (!data.style) {
      data.style = {
        primaryColor: '#e74c3c',
        secondaryColor: '#f8f9fa',
        accentColor: '#3498db'
      };
    }

    return data;
  }

  // 模拟数据生成（当API调用失败时使用）
  generateMockData(text, templateType) {
    console.log('使用模拟数据生成器');
    
    switch (templateType) {
      case TEMPLATE_TYPES.MINDMAP:
        return this.generateMockMindmapData(text);
      case TEMPLATE_TYPES.FLOWCHART:
        return this.generateMockFlowchartData(text);
      case TEMPLATE_TYPES.INFOGRAPHIC:
        return this.generateMockInfographicData(text);
      default:
        return this.generateMockMindmapData(text);
    }
  }

  generateMockMindmapData(text) {
    const title = text.length > 20 ? text.substring(0, 20) + '...' : text;
    
    return {
      type: 'mindmap',
      title: `${title} - 知识结构图`,
      centerNode: {
        id: 'center',
        text: title,
        x: 400,
        y: 300
      },
      nodes: [
        { id: '1', text: '核心概念', x: 200, y: 200, parent: 'center', level: 1 },
        { id: '2', text: '关键要点', x: 600, y: 200, parent: 'center', level: 1 },
        { id: '3', text: '应用场景', x: 200, y: 400, parent: 'center', level: 1 },
        { id: '4', text: '发展趋势', x: 600, y: 400, parent: 'center', level: 1 },
        { id: '1-1', text: '基础理论', x: 100, y: 150, parent: '1', level: 2 },
        { id: '1-2', text: '核心原理', x: 100, y: 250, parent: '1', level: 2 }
      ],
      connections: [
        { from: 'center', to: '1' },
        { from: 'center', to: '2' },
        { from: 'center', to: '3' },
        { from: 'center', to: '4' },
        { from: '1', to: '1-1' },
        { from: '1', to: '1-2' }
      ],
      style: {
        backgroundColor: '#f5f5f5',
        nodeColor: '#4a90e2',
        textColor: '#333',
        lineColor: '#666'
      }
    };
  }

  generateMockFlowchartData(text) {
    return {
      type: 'flowchart',
      title: '流程图示例',
      nodes: [
        { id: 'start', text: '开始', type: 'start', x: 400, y: 50 },
        { id: 'step1', text: '分析需求', type: 'process', x: 400, y: 150 },
        { id: 'step2', text: '设计方案', type: 'process', x: 400, y: 250 },
        { id: 'decision1', text: '方案可行？', type: 'decision', x: 400, y: 350 },
        { id: 'step3', text: '实施方案', type: 'process', x: 400, y: 450 },
        { id: 'end', text: '完成', type: 'end', x: 400, y: 550 }
      ],
      connections: [
        { from: 'start', to: 'step1', label: '' },
        { from: 'step1', to: 'step2', label: '' },
        { from: 'step2', to: 'decision1', label: '' },
        { from: 'decision1', to: 'step3', label: '是' },
        { from: 'step3', to: 'end', label: '' },
        { from: 'decision1', to: 'step2', label: '否' }
      ],
      style: {
        backgroundColor: '#ffffff',
        nodeColors: {
          start: '#28a745',
          process: '#007bff',
          decision: '#ffc107',
          end: '#dc3545'
        }
      }
    };
  }

  generateMockInfographicData(text) {
    return {
      type: 'infographic',
      title: text.substring(0, 30),
      sections: [
        {
          type: 'header',
          content: '信息概览',
          style: { backgroundColor: '#e74c3c', color: 'white' }
        },
        {
          type: 'stats',
          items: [
            { label: '关键信息', value: '5', unit: '项' },
            { label: '重要程度', value: '92', unit: '%' },
            { label: '应用范围', value: '广泛', unit: '' }
          ]
        },
        {
          type: 'chart',
          chartType: 'progress',
          data: [
            { label: '完成度', value: 85 },
            { label: '重要性', value: 92 },
            { label: '实用性', value: 78 }
          ]
        },
        {
          type: 'text',
          content: '基于输入文本生成的可视化展示，展现了关键信息的结构化呈现。'
        }
      ],
      style: {
        primaryColor: '#e74c3c',
        secondaryColor: '#f8f9fa',
        accentColor: '#3498db'
      }
    };
  }
  generateMockComparisonData(text) {
  return {
    type: 'comparison',
    title: '产品对比分析',
    items: [
      {
        id: 'item1',
        title: '产品A',
        features: [
          { name: '性能', value: '高性能处理器', score: 9 },
          { name: '价格', value: '价格较高', score: 6 },
          { name: '易用性', value: '操作简单', score: 8 },
          { name: '功能丰富度', value: '功能全面', score: 9 },
          { name: '稳定性', value: '运行稳定', score: 9 },
          { name: '用户满意度', value: '用户评价好', score: 8 }
        ]
      },
      {
        id: 'item2',
        title: '产品B',
        features: [
          { name: '性能', value: '中等性能', score: 7 },
          { name: '价格', value: '价格实惠', score: 9 },
          { name: '易用性', value: '学习成本低', score: 9 },
          { name: '功能丰富度', value: '基础功能', score: 6 },
          { name: '稳定性', value: '偶有问题', score: 7 },
          { name: '用户满意度', value: '性价比高', score: 8 }
        ]
      }
    ],
    style: {
      primaryColor: '#007bff',
      secondaryColor: '#28a745'
    }
  };
}

  generateMockHierarchyData(text) {
    return {
      type: 'hierarchy',
      title: '组织架构图',
      nodes: [
        {
          id: 'ceo',
          text: '首席执行官',
          level: 0,
          children: ['cto', 'cfo', 'cmo']
        },
        {
          id: 'cto',
          text: '技术总监',
          level: 1,
          parent: 'ceo',
          children: ['dev1', 'dev2']
        },
        {
          id: 'cfo',
          text: '财务总监',
          level: 1,
          parent: 'ceo',
          children: ['acc1']
        },
        {
          id: 'cmo',
          text: '市场总监',
          level: 1,
          parent: 'ceo',
          children: ['mkt1', 'mkt2']
        },
        {
          id: 'dev1',
          text: '前端开发',
          level: 2,
          parent: 'cto',
          children: []
        },
        {
          id: 'dev2',
          text: '后端开发',
          level: 2,
          parent: 'cto',
          children: []
        },
        {
          id: 'acc1',
          text: '会计师',
          level: 2,
          parent: 'cfo',
          children: []
        },
        {
          id: 'mkt1',
          text: '市场专员',
          level: 2,
          parent: 'cmo',
          children: []
        },
        {
          id: 'mkt2',
          text: '品牌经理',
          level: 2,
          parent: 'cmo',
          children: []
        }
      ],
      connections: [
        { from: 'ceo', to: 'cto' },
        { from: 'ceo', to: 'cfo' },
        { from: 'ceo', to: 'cmo' },
        { from: 'cto', to: 'dev1' },
        { from: 'cto', to: 'dev2' },
        { from: 'cfo', to: 'acc1' },
        { from: 'cmo', to: 'mkt1' },
        { from: 'cmo', to: 'mkt2' }
      ],
      style: {
        nodeColor: '#007bff',
        lineColor: '#666'
      }
    };
  }

  // 更新 generateMockData 方法，添加新的 case
  generateMockData(text, templateType) {
    console.log('使用模拟数据生成器');
    
    switch (templateType) {
      case TEMPLATE_TYPES.MINDMAP:
        return this.generateMockMindmapData(text);
      case TEMPLATE_TYPES.FLOWCHART:
        return this.generateMockFlowchartData(text);
      case TEMPLATE_TYPES.TIMELINE:
        return this.generateMockTimelineData(text);
      case TEMPLATE_TYPES.COMPARISON:
        return this.generateMockComparisonData(text);
      case TEMPLATE_TYPES.HIERARCHY:
        return this.generateMockHierarchyData(text);
      case TEMPLATE_TYPES.INFOGRAPHIC:
        return this.generateMockInfographicData(text);
      default:
        return this.generateMockMindmapData(text);
    }
  }

  // 添加时间线的模拟数据生成方法
  generateMockTimelineData(text) {
    return {
      type: 'timeline',
      title: '发展时间线',
      events: [
        {
          id: '1',
          date: '2020年',
          title: '项目启动',
          description: '确定项目目标和初步规划',
          side: 'left'
        },
        {
          id: '2',
          date: '2021年',
          title: '技术研发',
          description: '核心技术突破和原型开发',
          side: 'right'
        },
        {
          id: '3',
          date: '2022年',
          title: '产品测试',
          description: '全面测试和优化改进',
          side: 'left'
        },
        {
          id: '4',
          date: '2023年',
          title: '市场推广',
          description: '产品发布和市场推广',
          side: 'right'
        },
        {
          id: '5',
          date: '2024年',
          title: '规模化发展',
          description: '业务扩展和持续优化',
          side: 'left'
        }
      ],
      style: {
        lineColor: '#007bff',
        eventColor: '#28a745',
        textColor: '#333'
      }
    };
  }
}
