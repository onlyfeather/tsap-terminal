// src/utils/aiService.js

const API_URL = "/api/chat"; 

/**
 * 调用 AI 生成深度分析报告 (非流式 - 一次性返回)
 */
export async function fetchAIReport(reportData, onStream, onComplete, onError) {
  try {
    // 1. 构建更加学术、冷淡的提示词
    const prompt = buildSystemPrompt(reportData);

    // 2. 请求后端
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            // 🌟 核心修改：极致的研究所/临床报告风格约束
            content: `身份：TSAP实验室自动病理分析终端。
任务：基于生物数据生成一份【临床神经病理报告】。
风格要求：
1. 极度冷静、客观、学术化。禁止使用任何文学修辞、比喻或煽情描写。
2. 使用“受试者”指代目标。
3. 将交互属性解构为生理指标（如：将“敏感”描述为“末梢神经阈值过低”，将“S倾向”描述为“控制型人格障碍”）。
4. 格式参考：神经内科诊断书。
5. 字数限制：150字以内。
6. 直接输出分析正文，不要任何开场白或结束语。`
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    // 3. 🌟 核心修改：等待完整 JSON，而不是读取流
    const data = await response.json();
    
    // 提取 DeepSeek 的回复内容
    const fullText = data.choices?.[0]?.message?.content || "【系统错误】分析生成失败：无有效内容返回。";

    // 4. 一次性更新 UI
    onStream(fullText);
    
    if (onComplete) onComplete();

  } catch (error) {
    console.error("AI Request Failed:", error);
    if (onError) onError(error);
    else onStream("⚠️ 连接至神经云端失败。\n请检查后端日志。\nERR: " + error.message);
  }
}

// 辅助：构建数据提示词
function buildSystemPrompt(data) {
  const statsStr = JSON.stringify(data.stats);
  
  let modeTerm = "未知项目";
  if (data.mode === 'SINGLE') modeTerm = "单体神经耐受度测试 (Project-M)";
  else if (data.mode === 'ATTACK') modeTerm = "执行官心理评估 (Project-S)";
  else if (data.mode === 'RESONANCE') modeTerm = "双体神经同步实验";
  else if (data.mode === 'VERSUS') modeTerm = "对抗性压力测试";

  return `
【实验记录单】
实验对象代号：${data.name}
实验项目：${modeTerm}
综合评级：${data.rank || 'N/A'}
生物监测数据(六维)：${statsStr}

请基于上述数据，从病理学角度分析该对象的神经系统特征及心理防御机制。
`;
}