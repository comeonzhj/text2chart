// templateSelector.js
class TemplateSelector {
  static analyzeContent(text) {
    // 使用配置文件中的关键词
    const keywords = CONFIG.AI_KEYWORDS;

    let scores = {};
    for (let [type, words] of Object.entries(keywords)) {
      scores[type] = words.reduce((score, word) => 
        score + (text.includes(word) ? 1 : 0), 0);
    }

    return Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b);
  }

  static extractStructuredData(text, templateType, apiKey = null) {
    const mockAI = new MockAIProcessor();
    return mockAI.process(text, templateType, apiKey);
  }
}
