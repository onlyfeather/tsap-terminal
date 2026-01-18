// src/utils/aiService.js

const API_URL = "/api/chat"; 

export async function fetchAIReport(reportData, onStream, onComplete, onError) {
  try {
    const prompt = buildSystemPrompt(reportData);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { 
            role: "system", 
            // 🌟 核心修改：文风约束 -> 极致的研究所/临床报告风格
            content: `身份：TSAP实验室自动病理分析终端。
任务：基于生物数据生成一份【临床神经病理报告】。
风格要求：
1. 极度冷静、客观、学术化。禁止使用任何文学修辞、比喻、感叹号或煽情描写。
2. 使用“受试者”指代目标。
3. 将交互属性解构为生理指标（如：将“敏感”描述为“末梢神经阈值过低”，将“S倾向”描述为“控制型人格障碍”或“多巴胺回路异常”）。
4. 格式参考：SCP基金会档案、神经内科诊断书。
5. 字数限制：150字以内。
6. 直接输出分析正文，不要任何开场白。`
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) throw new Error(`Server Error: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(line => line.trim() !== "");
      for (const line of lines) {
        if (line.includes("[DONE]")) break;
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.substring(6));
            const content = json.choices[0].delta.content || "";
            if (content) {
              fullText += content;
              onStream(fullText);
            }
          } catch (e) { console.warn(e); }
        }
      }
    }
    if (onComplete) onComplete();

  } catch (error) {
    console.error("AI Error:", error);
    if (onError) onError(error);
  }
}

// 🌟 辅助：构建更学术的数据输入
function buildSystemPrompt(data) {
  const statsStr = JSON.stringify(data.stats);
  
  // 将模式翻译为更像“实验项目”的代号
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

请基于上述数据，分析该对象的神经系统特征及心理防御机制。
`;
}