// visualizer.js
class Visualizer {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`容器元素暂时不存在: ${containerId}，将在后续重试`);
    }
  }

  async render(data) {
    // 如果容器不存在，尝试重新获取
    if (!this.container) {
      this.container = document.getElementById(this.containerId);
      if (!this.container) {
        throw new Error(`容器元素不存在: ${this.containerId}`);
      }
    }

    // 显示加载状态
    this.container.innerHTML = '<div class="loading-visualization">🎨 正在绘制可视化...</div>';
    
    // 添加短暂延迟以显示加载状态
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.container.innerHTML = '';
    
    try {
      switch (data.type) {
        case 'mindmap':
          this.renderMindmap(data);
          break;
        case 'flowchart':
          this.renderFlowchart(data);
          break;
        case 'timeline':
          this.renderTimeline(data);
          break;
        case 'comparison':
          this.renderComparison(data);
          break;
        case 'hierarchy':
          this.renderHierarchy(data);
          break;
        case 'infographic':
          this.renderInfographic(data);
          break;
        default:
          this.renderDefault(data);
      }
    } catch (error) {
      console.error('渲染错误:', error);
      this.container.innerHTML = `<div class="error-message">渲染失败: ${error.message}</div>`;
    }
  }

  renderMindmap(data) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '600');
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.style.backgroundColor = data.style.backgroundColor;
    svg.style.minWidth = '800px'; // 确保最小宽度

    // 渲染连接线
    if (data.connections) {
      data.connections.forEach(conn => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const fromNode = data.nodes.find(n => n.id === conn.from) || data.centerNode;
        const toNode = data.nodes.find(n => n.id === conn.to);
        
        if (fromNode && toNode) {
          line.setAttribute('x1', fromNode.x);
          line.setAttribute('y1', fromNode.y);
          line.setAttribute('x2', toNode.x);
          line.setAttribute('y2', toNode.y);
          line.setAttribute('stroke', data.style.lineColor);
          line.setAttribute('stroke-width', '2');
          svg.appendChild(line);
        }
      });
    }

    // 渲染中心节点
    if (data.centerNode) {
      this.createNode(svg, data.centerNode, data.style, true);
    }

    // 渲染其他节点
    if (data.nodes) {
      data.nodes.forEach(node => {
        this.createNode(svg, node, data.style, false);
      });
    }

    this.container.appendChild(svg);
  }

  renderTimeline(data) {
    const container = document.createElement('div');
    container.className = 'timeline-container';
    container.style.cssText = `
      width: 100%;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    // 添加标题
    const title = document.createElement('h2');
    title.textContent = data.title;
    title.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      color: #2c3e50;
      font-size: 24px;
    `;
    container.appendChild(title);

    // 创建时间线容器
    const timelineWrapper = document.createElement('div');
    timelineWrapper.style.cssText = `
      position: relative;
      padding: 40px 0;
      min-height: 400px;
    `;

    // 创建中央时间线
    const centerLine = document.createElement('div');
    centerLine.style.cssText = `
      position: absolute;
      left: 50%;
      top: 20px;
      bottom: 20px;
      width: 4px;
      background: linear-gradient(to bottom, ${data.style.lineColor}, ${data.style.eventColor || data.style.lineColor});
      transform: translateX(-50%);
      border-radius: 2px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    timelineWrapper.appendChild(centerLine);

    // 添加时间线起始和结束装饰
    const startCap = document.createElement('div');
    startCap.style.cssText = `
      position: absolute;
      left: 50%;
      top: 10px;
      transform: translateX(-50%);
      width: 12px;
      height: 12px;
      background: ${data.style.lineColor};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      z-index: 5;
    `;
    timelineWrapper.appendChild(startCap);

    const endCap = document.createElement('div');
    endCap.style.cssText = `
      position: absolute;
      left: 50%;
      bottom: 10px;
      transform: translateX(-50%);
      width: 12px;
      height: 12px;
      background: ${data.style.eventColor || data.style.lineColor};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      z-index: 5;
    `;
    timelineWrapper.appendChild(endCap);

    // 渲染事件
    data.events.forEach((event, index) => {
      const eventElement = this.createTimelineEvent(event, index, data.style);
      timelineWrapper.appendChild(eventElement);
    });

    container.appendChild(timelineWrapper);
    this.container.appendChild(container);
  }

  createTimelineEvent(event, index, style) {
    const eventDiv = document.createElement('div');
    // 自动交替摆放：偶数索引在右侧，奇数索引在左侧
    const isLeft = index % 2 === 1;
    
    eventDiv.style.cssText = `
      position: relative;
      margin-bottom: 60px;
      display: flex;
      align-items: center;
      min-height: 120px;
      width: 100%;
    `;

    // 创建事件卡片容器
    const cardContainer = document.createElement('div');
    cardContainer.style.cssText = `
      position: relative;
      width: 45%;
      ${isLeft ? 'margin-right: auto; padding-right: 40px;' : 'margin-left: auto; padding-left: 40px;'}
      display: flex;
      ${isLeft ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
    `;

    // 创建事件卡片
    const card = document.createElement('div');
    card.style.cssText = `
      background: white;
      border: 2px solid ${style.eventColor};
      border-radius: 12px;
      padding: 20px;
      max-width: 320px;
      width: 100%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      position: relative;
      animation: slideInUp 0.6s ease ${index * 0.2}s both;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    // 添加悬停效果
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    });

    // 添加箭头指向时间线
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      position: absolute;
      top: 50%;
      ${isLeft ? 'right: -12px;' : 'left: -12px;'}
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border: 12px solid transparent;
      ${isLeft ? `border-left-color: ${style.eventColor};` : `border-right-color: ${style.eventColor};`}
    `;
    card.appendChild(arrow);

    // 添加日期标签
    const date = document.createElement('div');
    date.textContent = event.date;
    date.style.cssText = `
      background: ${style.eventColor};
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 12px;
      display: inline-block;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    card.appendChild(date);

    // 添加事件标题
    const title = document.createElement('h3');
    title.textContent = event.title;
    title.style.cssText = `
      color: ${style.textColor || '#2c3e50'};
      margin-bottom: 10px;
      font-size: 18px;
      font-weight: bold;
      line-height: 1.3;
    `;
    card.appendChild(title);

    // 添加事件描述
    const description = document.createElement('p');
    description.textContent = event.description;
    description.style.cssText = `
      color: #666;
      line-height: 1.6;
      margin: 0;
      font-size: 14px;
    `;
    card.appendChild(description);

    // 创建连接线（从卡片到时间线）
    const connector = document.createElement('div');
    connector.style.cssText = `
      position: absolute;
      top: 50%;
      ${isLeft ? 'right: -40px;' : 'left: -40px;'}
      width: 40px;
      height: 2px;
      background: ${style.eventColor};
      transform: translateY(-50%);
      z-index: 5;
      border-radius: 1px;
    `;

    // 创建时间线上的圆点
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      background: ${style.eventColor};
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
      z-index: 10;
      transition: transform 0.3s ease;
    `;

    // 圆点悬停效果
    dot.addEventListener('mouseenter', () => {
      dot.style.transform = 'translate(-50%, -50%) scale(1.2)';
    });

    dot.addEventListener('mouseleave', () => {
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // 添加序号到圆点内
    const dotNumber = document.createElement('div');
    dotNumber.textContent = index + 1;
    dotNumber.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 10px;
      font-weight: bold;
    `;
    dot.appendChild(dotNumber);

    // 组装元素
    cardContainer.appendChild(card);
    cardContainer.appendChild(connector); // 连接线应该相对于cardContainer定位
    eventDiv.appendChild(cardContainer);
    eventDiv.appendChild(dot);

    return eventDiv;
  }

  renderFlowchart(data) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '700');
    svg.setAttribute('viewBox', '0 0 800 700');
    svg.style.backgroundColor = data.style.backgroundColor || '#ffffff';
    svg.style.minWidth = '800px'; // 确保最小宽度

    // 渲染连接线
    if (data.connections) {
      data.connections.forEach(conn => {
        const fromNode = data.nodes.find(n => n.id === conn.from);
        const toNode = data.nodes.find(n => n.id === conn.to);
        
        if (fromNode && toNode) {
          this.createFlowchartConnection(svg, fromNode, toNode, conn.label || '');
        }
      });
    }

    // 渲染节点
    if (data.nodes) {
      data.nodes.forEach(node => {
        this.createFlowchartNode(svg, node, data.style);
      });
    }

    this.container.appendChild(svg);
  }

  createFlowchartNode(svg, node, style) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    let shape;
    const colors = style.nodeColors || {};
    const color = colors[node.type] || '#007bff';

    switch (node.type) {
      case 'start':
      case 'end':
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        shape.setAttribute('cx', node.x);
        shape.setAttribute('cy', node.y);
        shape.setAttribute('rx', 60);
        shape.setAttribute('ry', 30);
        break;
      case 'decision':
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = `${node.x-50},${node.y} ${node.x},${node.y-25} ${node.x+50},${node.y} ${node.x},${node.y+25}`;
        shape.setAttribute('points', points);
        break;
      default: // process
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', node.x - 60);
        shape.setAttribute('y', node.y - 25);
        shape.setAttribute('width', 120);
        shape.setAttribute('height', 50);
        shape.setAttribute('rx', 8);
    }

    shape.setAttribute('fill', color);
    shape.setAttribute('stroke', '#fff');
    shape.setAttribute('stroke-width', '2');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    text.textContent = node.text;
    
    g.appendChild(shape);
    g.appendChild(text);
    svg.appendChild(g);
  }

  createFlowchartConnection(svg, fromNode, toNode, label) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromNode.x);
    line.setAttribute('y1', fromNode.y + 25);
    line.setAttribute('x2', toNode.x);
    line.setAttribute('y2', toNode.y - 25);
    line.setAttribute('stroke', '#666');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrowhead)');
    
    // 添加箭头标记
    if (!svg.querySelector('#arrowhead')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrowhead');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('refX', '9');
      marker.setAttribute('refY', '3.5');
      marker.setAttribute('orient', 'auto');
      
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
      polygon.setAttribute('fill', '#666');
      
      marker.appendChild(polygon);
      defs.appendChild(marker);
      svg.appendChild(defs);
    }
    
    svg.appendChild(line);

    // 添加标签
    if (label) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (fromNode.x + toNode.x) / 2);
      text.setAttribute('y', (fromNode.y + toNode.y) / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#333');
      text.setAttribute('font-size', '12');
      text.textContent = label;
      svg.appendChild(text);
    }
  }

  renderComparison(data) {
    const container = document.createElement('div');
    container.className = 'comparison-container';
    container.style.cssText = `
      width: 100%;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      font-family: Arial, sans-serif;
    `;

    // 添加标题
    const title = document.createElement('h2');
    title.textContent = data.title;
    title.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      color: #2c3e50;
      font-size: 24px;
    `;
    container.appendChild(title);

    // 创建对比容器
    const comparisonWrapper = document.createElement('div');
    comparisonWrapper.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    `;

    // 渲染对比项目
    data.items.forEach((item, index) => {
      const itemElement = this.createComparisonItem(item, index, data.style);
      comparisonWrapper.appendChild(itemElement);
    });

    container.appendChild(comparisonWrapper);

    // 添加总结对比图表
    if (data.items.length === 2) {
      const chartContainer = this.createComparisonChart(data.items, data.style);
      container.appendChild(chartContainer);
    }

    this.container.appendChild(container);
  }

  createComparisonItem(item, index, style) {
    const colors = [style.primaryColor || '#007bff', style.secondaryColor || '#28a745'];
    const color = colors[index % colors.length];

    const itemDiv = document.createElement('div');
    itemDiv.style.cssText = `
      background: white;
      border: 3px solid ${color};
      border-radius: 12px;
      padding: 25px;
      position: relative;
      animation: slideInUp 0.6s ease ${index * 0.3}s both;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    // 添加悬停效果
    itemDiv.addEventListener('mouseenter', () => {
      itemDiv.style.transform = 'translateY(-5px)';
      itemDiv.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    });

    itemDiv.addEventListener('mouseleave', () => {
      itemDiv.style.transform = 'translateY(0)';
      itemDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    });

    // 添加标题
    const title = document.createElement('h3');
    title.textContent = item.title;
    title.style.cssText = `
      background: ${color};
      color: white;
      margin: -25px -25px 20px -25px;
      padding: 15px 25px;
      border-radius: 9px 9px 0 0;
      font-size: 20px;
      text-align: center;
    `;
    itemDiv.appendChild(title);

    // 添加特征列表
    const featuresList = document.createElement('div');
    featuresList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 15px;
    `;

    item.features.forEach(feature => {
      const featureDiv = document.createElement('div');
      featureDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid ${color};
      `;

      const nameSpan = document.createElement('span');
      nameSpan.textContent = feature.name;
      nameSpan.style.cssText = `
        font-weight: bold;
        color: #333;
        flex: 1;
      `;

      const valueSpan = document.createElement('span');
      valueSpan.textContent = feature.value;
      valueSpan.style.cssText = `
        color: #666;
        margin: 0 15px;
        flex: 2;
      `;

      const scoreDiv = document.createElement('div');
      scoreDiv.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      // 创建评分条
      const scoreBar = document.createElement('div');
      scoreBar.style.cssText = `
        width: 60px;
        height: 8px;
        background: #e9ecef;
        border-radius: 4px;
        overflow: hidden;
      `;

      const scoreFill = document.createElement('div');
      scoreFill.style.cssText = `
        height: 100%;
        background: ${color};
        width: ${(feature.score || 0) * 10}%;
        transition: width 0.8s ease;
        border-radius: 4px;
      `;
      scoreBar.appendChild(scoreFill);

      const scoreText = document.createElement('span');
      scoreText.textContent = `${feature.score || 0}/10`;
      scoreText.style.cssText = `
        font-size: 12px;
        color: ${color};
        font-weight: bold;
        min-width: 35px;
      `;

      scoreDiv.appendChild(scoreBar);
      scoreDiv.appendChild(scoreText);

      featureDiv.appendChild(nameSpan);
      featureDiv.appendChild(valueSpan);
      featureDiv.appendChild(scoreDiv);

      featuresList.appendChild(featureDiv);
    });

    itemDiv.appendChild(featuresList);

    // 添加总体评分
    const overallScore = item.features.reduce((sum, f) => sum + (f.score || 0), 0) / item.features.length;
    const overallDiv = document.createElement('div');
    overallDiv.style.cssText = `
      margin-top: 20px;
      padding: 15px;
      background: ${color};
      color: white;
      border-radius: 8px;
      text-align: center;
      font-weight: bold;
    `;
    overallDiv.innerHTML = `
      <div style="font-size: 14px; margin-bottom: 5px;">综合评分</div>
      <div style="font-size: 24px;">${overallScore.toFixed(1)}/10</div>
    `;
    itemDiv.appendChild(overallDiv);

    return itemDiv;
  }

  createComparisonChart(items, style) {
    const chartContainer = document.createElement('div');
    chartContainer.style.cssText = `
      background: #f8f9fa;
      padding: 25px;
      border-radius: 12px;
      margin-top: 20px;
    `;

    const chartTitle = document.createElement('h3');
    chartTitle.textContent = '特征对比雷达图';
    chartTitle.style.cssText = `
      text-align: center;
      margin-bottom: 20px;
      color: #2c3e50;
    `;
    chartContainer.appendChild(chartTitle);

    // 创建简化的雷达图
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '400');
    svg.setAttribute('viewBox', '0 0 500 400');

    const centerX = 250;
    const centerY = 200;
    const radius = 120;

    // 获取所有特征名称
    const allFeatures = items[0].features.map(f => f.name);
    const angleStep = (2 * Math.PI) / allFeatures.length;

    // 绘制网格
    for (let i = 1; i <= 5; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', centerX);
      circle.setAttribute('cy', centerY);
      circle.setAttribute('r', (radius * i) / 5);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#ddd');
      circle.setAttribute('stroke-width', '1');
      svg.appendChild(circle);
    }

    // 绘制轴线和标签
    allFeatures.forEach((feature, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // 轴线
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#ddd');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      // 标签
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const labelX = centerX + Math.cos(angle) * (radius + 20);
      const labelY = centerY + Math.sin(angle) * (radius + 20);
      text.setAttribute('x', labelX);
      text.setAttribute('y', labelY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', '#333');
      text.textContent = feature;
      svg.appendChild(text);
    });

    // 绘制数据多边形
    const colors = [style.primaryColor || '#007bff', style.secondaryColor || '#28a745'];
    items.forEach((item, itemIndex) => {
      const points = item.features.map((feature, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const distance = (feature.score / 10) * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        return `${x},${y}`;
      }).join(' ');

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', points);
      polygon.setAttribute('fill', colors[itemIndex]);
      polygon.setAttribute('fill-opacity', '0.3');
      polygon.setAttribute('stroke', colors[itemIndex]);
      polygon.setAttribute('stroke-width', '2');
      svg.appendChild(polygon);

      // 添加数据点
      item.features.forEach((feature, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const distance = (feature.score / 10) * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', colors[itemIndex]);
        svg.appendChild(circle);
      });
    });

    chartContainer.appendChild(svg);

    // 添加图例
    const legend = document.createElement('div');
    legend.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 15px;
    `;

    items.forEach((item, index) => {
      const legendItem = document.createElement('div');
      legendItem.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      const colorBox = document.createElement('div');
      colorBox.style.cssText = `
        width: 20px;
        height: 20px;
        background: ${colors[index]};
        border-radius: 3px;
      `;

      const label = document.createElement('span');
      label.textContent = item.title;
      label.style.cssText = `
        font-weight: bold;
        color: #333;
      `;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      legend.appendChild(legendItem);
    });

    chartContainer.appendChild(legend);
    return chartContainer;
  }

  renderHierarchy(data) {
    const container = document.createElement('div');
    container.className = 'hierarchy-container';
    container.style.cssText = `
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    // 添加标题
    const title = document.createElement('h2');
    title.textContent = data.title;
    title.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      color: #2c3e50;
      font-size: 24px;
    `;
    container.appendChild(title);

    // 计算层级布局
    const layoutData = this.calculateHierarchyLayout(data);
    
    // 创建SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', `${layoutData.height + 40}`);
    svg.setAttribute('viewBox', `0 0 ${layoutData.width} ${layoutData.height + 40}`);

    // 渲染连接线
    if (data.connections) {
      data.connections.forEach(conn => {
        const fromNode = layoutData.nodes.find(n => n.id === conn.from);
        const toNode = layoutData.nodes.find(n => n.id === conn.to);
        
        if (fromNode && toNode) {
          this.createHierarchyConnection(svg, fromNode, toNode, data.style);
        }
      });
    }

    // 渲染节点
    layoutData.nodes.forEach(node => {
      this.createHierarchyNode(svg, node, data.style);
    });

    container.appendChild(svg);
    this.container.appendChild(container);
  }

  calculateHierarchyLayout(data) {
    // 按层级分组节点
    const levels = {};
    const nodeMap = {};
    
    data.nodes.forEach(node => {
      const level = node.level || 0;
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
      nodeMap[node.id] = { ...node };
    });

    const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
    const maxLevel = Math.max(...levelKeys);
    
    // 计算布局
    const nodeWidth = 160;
    const nodeHeight = 80;
    const levelHeight = 120;
    const nodeSpacing = 40;
    
    let maxWidth = 0;
    
    levelKeys.forEach(level => {
      const nodesInLevel = levels[level];
      const levelWidth = nodesInLevel.length * (nodeWidth + nodeSpacing) - nodeSpacing;
      maxWidth = Math.max(maxWidth, levelWidth);
      
      const startX = (maxWidth - levelWidth) / 2 + nodeWidth / 2;
      
      nodesInLevel.forEach((node, index) => {
        nodeMap[node.id].x = startX + index * (nodeWidth + nodeSpacing);
        nodeMap[node.id].y = level * levelHeight + 60;
        nodeMap[node.id].width = nodeWidth;
        nodeMap[node.id].height = nodeHeight;
      });
    });

    return {
      nodes: Object.values(nodeMap),
      width: maxWidth + 40,
      height: maxLevel * levelHeight + nodeHeight + 40
    };
  }

  createHierarchyNode(svg, node, style) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'hierarchy-node');
    
    // 节点背景
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', node.x - node.width / 2);
    rect.setAttribute('y', node.y - node.height / 2);
    rect.setAttribute('width', node.width);
    rect.setAttribute('height', node.height);
    rect.setAttribute('rx', '12');
    rect.setAttribute('fill', this.getHierarchyNodeColor(node.level, style));
    rect.setAttribute('stroke', '#fff');
    rect.setAttribute('stroke-width', '3');
    rect.setAttribute('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))');
    
    // 节点文本
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    
    // 处理长文本换行
    const words = node.text.split('');
    if (words.length > 8) {
      const line1 = words.slice(0, 8).join('');
      const line2 = words.slice(8).join('');
      
      const tspan1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan1.setAttribute('x', node.x);
      tspan1.setAttribute('dy', '-0.3em');
      tspan1.textContent = line1;
      
      const tspan2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan2.setAttribute('x', node.x);
      tspan2.setAttribute('dy', '1.2em');
      tspan2.textContent = line2;
      
      text.appendChild(tspan1);
      text.appendChild(tspan2);
    } else {
      text.textContent = node.text;
    }
    
    // 添加层级标识
    const levelBadge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    levelBadge.setAttribute('cx', node.x + node.width / 2 - 15);
    levelBadge.setAttribute('cy', node.y - node.height / 2 + 15);
    levelBadge.setAttribute('r', '12');
    levelBadge.setAttribute('fill', '#fff');
    levelBadge.setAttribute('stroke', this.getHierarchyNodeColor(node.level, style));
    levelBadge.setAttribute('stroke-width', '2');
    
    const levelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    levelText.setAttribute('x', node.x + node.width / 2 - 15);
    levelText.setAttribute('y', node.y - node.height / 2 + 15);
    levelText.setAttribute('text-anchor', 'middle');
    levelText.setAttribute('dominant-baseline', 'middle');
    levelText.setAttribute('fill', this.getHierarchyNodeColor(node.level, style));
    levelText.setAttribute('font-size', '10');
    levelText.setAttribute('font-weight', 'bold');
    levelText.textContent = `L${node.level}`;
    
    g.appendChild(rect);
    g.appendChild(text);
    g.appendChild(levelBadge);
    g.appendChild(levelText);
    
    // 添加动画
    g.style.opacity = '0';
    g.style.transform = 'translateY(20px)';
    g.style.animation = `hierarchyFadeIn 0.6s ease ${node.level * 0.2}s forwards`;
    
    svg.appendChild(g);
  }

  createHierarchyConnection(svg, fromNode, toNode, style) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // 计算连接路径（贝塞尔曲线）
    const startX = fromNode.x;
    const startY = fromNode.y + fromNode.height / 2;
    const endX = toNode.x;
    const endY = toNode.y - toNode.height / 2;
    
    const midY = (startY + endY) / 2;
    
    const pathData = `M ${startX} ${startY} C ${startX} ${midY} ${endX} ${midY} ${endX} ${endY}`;
    
    line.setAttribute('d', pathData);
    line.setAttribute('stroke', style.lineColor || '#666');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('fill', 'none');
    line.setAttribute('marker-end', 'url(#hierarchy-arrow)');
    
    // 添加箭头标记
    if (!svg.querySelector('#hierarchy-arrow')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'hierarchy-arrow');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('refX', '9');
      marker.setAttribute('refY', '3.5');
      marker.setAttribute('orient', 'auto');
      
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
      polygon.setAttribute('fill', style.lineColor || '#666');
      
      marker.appendChild(polygon);
      defs.appendChild(marker);
      svg.appendChild(defs);
    }
    
    svg.appendChild(line);
  }

  getHierarchyNodeColor(level, style) {
    const colors = [
      style.nodeColor || '#2c3e50',
      '#3498db',
      '#e74c3c',
      '#f39c12',
      '#9b59b6',
      '#1abc9c'
    ];
    return colors[level % colors.length];
  }

  renderInfographic(data) {
    const container = document.createElement('div');
    container.className = 'infographic-container';
    container.style.cssText = `
      width: 100%;
      margin: 0 auto;
      background: ${data.style.secondaryColor};
      font-family: Arial, sans-serif;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    `;

    if (data.sections) {
      data.sections.forEach(section => {
        const sectionEl = this.createSection(section, data.style);
        container.appendChild(sectionEl);
      });
    }

    this.container.appendChild(container);
  }

  createNode(svg, node, style, isCenter = false) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', isCenter ? 50 : 30);
    circle.setAttribute('fill', style.nodeColor);
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', isCenter ? '14' : '12');
    text.setAttribute('font-weight', 'bold');
    text.textContent = node.text;
    
    g.appendChild(circle);
    g.appendChild(text);
    svg.appendChild(g);
  }

  createSection(section, globalStyle) {
    const div = document.createElement('div');
    div.style.marginBottom = '0';

    switch (section.type) {
      case 'header':
        div.style.cssText = `
          background: ${section.style.backgroundColor};
          color: ${section.style.color};
          padding: 20px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
        `;
        div.textContent = section.content;
        break;

      case 'stats':
        div.style.cssText = `
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 20px;
        `;
        section.items.forEach(item => {
          const statDiv = document.createElement('div');
          statDiv.style.cssText = `
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          `;
          statDiv.innerHTML = `
            <div style="font-size: 32px; font-weight: bold; color: ${globalStyle.primaryColor}; margin-bottom: 8px;">
              ${item.value} ${item.unit || ''}
            </div>
            <div style="color: #666; font-size: 14px;">${item.label}</div>
          `;
          div.appendChild(statDiv);
        });
        break;

      case 'chart':
        div.style.padding = '20px';
        if (section.chartType === 'progress' || section.chartType === 'bar') {
          section.data.forEach(item => {
            const progressDiv = document.createElement('div');
            progressDiv.style.marginBottom = '15px';
            progressDiv.innerHTML = `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-weight: bold;">${item.label}</span>
                <span>${item.value}%</span>
              </div>
              <div style="background: #e9ecef; height: 24px; border-radius: 12px; overflow: hidden;">
                <div style="background: ${globalStyle.primaryColor}; height: 100%; width: ${item.value}%; transition: width 0.8s ease; border-radius: 12px;"></div>
              </div>
            `;
            div.appendChild(progressDiv);
          });
        }
        break;

      case 'text':
        div.style.cssText = `
          padding: 20px;
          background: white;
          margin: 20px;
          border-radius: 8px;
          line-height: 1.6;
          color: #333;
        `;
        div.textContent = section.content;
        break;

      default:
        div.innerHTML = `<div style="padding: 20px;">未知section类型: ${section.type}</div>`;
    }

    return div;
  }

  renderDefault(data) {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="default-render">
        <h3>数据预览</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
    this.container.appendChild(container);
  }

  async exportImage() {
    if (!this.container) {
      throw new Error('容器不存在，无法导出图片');
    }

    try {
      // 动态加载 html2canvas
      const html2canvas = await this.loadHtml2Canvas();
      
      // 保存原始状态
      const outputCanvas = this.container.closest('.output-canvas');
      const originalScrollTop = outputCanvas ? outputCanvas.scrollTop : 0;
      const originalOverflow = outputCanvas ? outputCanvas.style.overflow : '';
      const originalHeight = outputCanvas ? outputCanvas.style.height : '';
      const originalMaxHeight = outputCanvas ? outputCanvas.style.maxHeight : '';
      
      // 临时修改容器样式，确保所有内容可见
      if (outputCanvas) {
        outputCanvas.style.overflow = 'visible';
        outputCanvas.style.height = 'auto';
        outputCanvas.style.maxHeight = 'none';
        outputCanvas.scrollTop = 0;
      }
      
      // 等待样式应用和重新渲染
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 获取实际内容尺寸
      const rect = this.container.getBoundingClientRect();
      const actualHeight = Math.max(this.container.scrollHeight, this.container.offsetHeight, rect.height);
      const actualWidth = Math.max(this.container.scrollWidth, this.container.offsetWidth, rect.width);
      
      console.log('导出尺寸:', { actualWidth, actualHeight, rect });
      
      const canvas = await html2canvas(this.container, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高图片质量
        useCORS: true,
        allowTaint: true,
        logging: false, // 关闭日志
        height: actualHeight,
        width: actualWidth,
        scrollX: 0,
        scrollY: 0,
        windowWidth: actualWidth,
        windowHeight: actualHeight,
        // 强制渲染所有内容
        ignoreElements: function(element) {
          // 忽略滚动条等不需要的元素
          return element.classList && element.classList.contains('scrollbar');
        }
      });
      
      // 恢复原始样式
      if (outputCanvas) {
        outputCanvas.style.overflow = originalOverflow;
        outputCanvas.style.height = originalHeight;
        outputCanvas.style.maxHeight = originalMaxHeight;
        outputCanvas.scrollTop = originalScrollTop;
      }
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('导出图片失败:', error);
      throw new Error('图片导出失败，请重试');
    }
  }

  async loadHtml2Canvas() {
    if (window.html2canvas) {
      return window.html2canvas;
    }

    // 动态加载 html2canvas
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      script.onload = () => resolve(window.html2canvas);
      script.onerror = () => reject(new Error('html2canvas 加载失败'));
      document.head.appendChild(script);
    });
  }

  // 备用导出方法：直接导出SVG内容
  async exportSVGImage() {
    const svgElement = this.container.querySelector('svg');
    if (!svgElement) {
      throw new Error('未找到SVG元素，无法使用SVG导出');
    }

    try {
      // 克隆SVG元素
      const clonedSvg = svgElement.cloneNode(true);
      
      // 设置SVG的尺寸和样式
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('width', svgElement.getAttribute('width') || '800');
      clonedSvg.setAttribute('height', svgElement.getAttribute('height') || '600');
      
      // 添加白色背景
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', 'white');
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);
      
      // 将SVG转换为字符串
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      
      // 创建临时图片元素
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      return new Promise((resolve, reject) => {
        img.onload = function() {
          canvas.width = img.width * 2; // 高分辨率
          canvas.height = img.height * 2;
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(svgBlob);
      });
    } catch (error) {
      console.error('SVG导出失败:', error);
      throw error;
    }
  }

  // 智能导出：根据内容类型选择最佳导出方式
  async smartExport() {
    // 检查内容类型
    const hasSVG = this.container.querySelector('svg');
    const hasComplexHTML = this.container.querySelector('.comparison-container, .timeline-container, .infographic-container');
    
    if (hasSVG && !hasComplexHTML) {
      // 纯SVG内容，优先使用SVG导出
      try {
        console.log('检测到SVG内容，使用SVG导出');
        return await this.exportSVGImage();
      } catch (svgError) {
        console.log('SVG导出失败，尝试html2canvas导出:', svgError.message);
        return await this.exportImage();
      }
    } else {
      // 复杂HTML内容，使用html2canvas
      console.log('检测到复杂HTML内容，使用html2canvas导出');
      return await this.exportImage();
    }
  }

  // 专门为对比图等复杂内容优化的导出方法
  async exportComplexContent() {
    if (!this.container) {
      throw new Error('容器不存在，无法导出图片');
    }

    try {
      // 动态加载 html2canvas
      const html2canvas = await this.loadHtml2Canvas();
      
      // 创建一个临时的导出容器
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: none;
        width: auto;
        height: auto;
        overflow: visible;
      `;
      
      // 克隆内容到导出容器
      const clonedContent = this.container.cloneNode(true);
      
      // 移除可能影响导出的样式
      const elementsToFix = clonedContent.querySelectorAll('*');
      elementsToFix.forEach(el => {
        if (el.style) {
          el.style.transform = '';
          el.style.animation = '';
          el.style.transition = '';
        }
      });
      
      exportContainer.appendChild(clonedContent);
      document.body.appendChild(exportContainer);
      
      // 等待内容渲染
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: exportContainer.scrollWidth + 40,
        windowHeight: exportContainer.scrollHeight + 40
      });
      
      // 清理临时容器
      document.body.removeChild(exportContainer);
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('复杂内容导出失败:', error);
      throw new Error('复杂内容导出失败，请重试');
    }
  }
}
