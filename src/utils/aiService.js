// src/utils/aiService.js

// 🌟 修改点 1: 地址改为指向你自己的后端 Vercel 函数
// 这样前端就不会暴露任何 Key，也不会直接连接 DeepSeek
const API_URL = "/api/chat"; 

/**
 * 调用 AI 生成深度分析报告 (流式输出)
 * @param {Object} reportData - 包含 name, stats, mode, rank
 * @param {Function} onStream - 回调函数，每收到一个字调用一次
 * @param {Function} onComplete - 完成时调用
 * @param {Function} onError - 出错时调用
 */
export async function fetchAIReport(reportData, onStream, onComplete, onError) {
  try {
    // 1. 构建提示词 (Prompt Engineering)
    const prompt = buildSystemPrompt(reportData);

    // 2. 向你的后端 (/api/chat) 发起请求
    // 🌟 修改点 2: 不再在前端发送 Authorization 头，Key 由后端处理
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        // 我们只发送消息列表，模型配置(model, temperature)和 Key 都放在后端控制
        messages: [
          { 
            role: "system", 
            content: "你是一个赛博朋克风格的生物神经分析终端系统(TSAP)。请根据提供的六维数据，生成一份冷酷、专业、带有隐喻色彩的临床诊断报告。涉及BDSM属性分析时，请使用'神经回路'、'多巴胺阈值'、'心理防御机制'等医学或心理学隐喻，避免过于直白的色情描述。风格参考：攻壳机动队、SCP基金会。字数控制在150字以内。不要使用Markdown标题，直接分段输出。" 
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    // 3. 处理流式数据 (逻辑保持不变，因为后端是透传流的)
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      
      // 解析 DeepSeek/OpenAI 格式的数据流
      const lines = chunk.split("\n").filter(line => line.trim() !== "");
      
      for (const line of lines) {
        if (line.includes("[DONE]")) break;
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.substring(6));
            const content = json.choices[0].delta.content || "";
            if (content) {
              fullText += content;
              onStream(fullText); // 实时更新 UI
            }
          } catch (e) {
            console.warn("Stream parse error", e);
          }
        }
      }
    }
    
    if (onComplete) onComplete();

  } catch (error) {
    console.error("AI Request Failed:", error);
    if (onError) onError(error);
    else onStream("⚠️ 连接至神经云端失败。\n请检查后端服务配置。\nERR: " + error.message);
  }
}

// 辅助：构建 Prompt (保持不变)
function buildSystemPrompt(data) {
  const statsStr = JSON.stringify(data.stats);
  
  let modeContext = "";
  if (data.mode === 'SINGLE') modeContext = "模式：[受体分析]。分析其敏感弱点和心理防线脆弱度。";
  else if (data.mode === 'ATTACK') modeContext = "模式：[执行官分析]。分析其支配风格、施虐倾向及手段特征。";
  else if (data.mode === 'RESONANCE') modeContext = "模式：[神经共鸣]。分析两个个体之间的感官同步率和化学反应。";
  else if (data.mode === 'VERSUS') modeContext = "模式：[攻防博弈]。分析两者的强弱对抗关系，预测谁会先崩溃。";

  return `
    [[ 接入请求 ]]
    目标代号：${data.name}
    测定评级：${data.rank || '未知'}
    ${modeContext}
    六维神经读数：${statsStr}
    
    [[ 指令 ]]
    请输出一段简短而深刻的诊断结论。
  `;
}