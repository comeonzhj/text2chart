// config.js - 全局配置文件
const TEMPLATE_TYPES = {
  MINDMAP: 'mindmap',           // 思维导图
  FLOWCHART: 'flowchart',       // 流程图
  TIMELINE: 'timeline',         // 时间线
  COMPARISON: 'comparison',     // 对比图
  HIERARCHY: 'hierarchy',       // 层级图
  INFOGRAPHIC: 'infographic'    // 信息图表
};

// 其他全局配置
const CONFIG = {
  DEFAULT_CANVAS_SIZE: {
    width: 800,
    height: 600
  },
  DEFAULT_COLORS: {
    primary: '#4a90e2',
    secondary: '#f8f9fa',
    accent: '#e74c3c',
    text: '#333',
    background: '#f5f5f5'
  },
  AI_KEYWORDS: {
    [TEMPLATE_TYPES.MINDMAP]: ['概念', '分类', '要点', '思维', '结构', '知识'],
    [TEMPLATE_TYPES.FLOWCHART]: ['流程', '步骤', '过程', '顺序', '操作', '工作流'],
    [TEMPLATE_TYPES.TIMELINE]: ['时间', '历史', '发展', '阶段', '年份', '时期'],
    [TEMPLATE_TYPES.COMPARISON]: ['对比', '比较', '差异', '优缺点', 'vs', '区别'],
    [TEMPLATE_TYPES.HIERARCHY]: ['层级', '组织', '结构', '等级', '分层', '架构'],
    [TEMPLATE_TYPES.INFOGRAPHIC]: ['数据', '统计', '信息', '图表', '展示', '报告']
  }
};

// 导出配置（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TEMPLATE_TYPES, CONFIG };
}
