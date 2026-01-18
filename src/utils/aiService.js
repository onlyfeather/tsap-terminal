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
            content: `身份：TSAP实验室-痒觉耐受与神经反射研究终端。
任务：基于监测数据和基础推演，生成一份【Tickle实验评估日志】。

风格要求：
1. **核心主题：挠痒 (Tickle)**。聚焦"痒觉过载"、"笑肌痉挛"、"神经反射"。
2. **文风**：冷酷、客观、实验记录风格。
3. **关键指令**：
   - 必须使用【具体名字】称呼对象（如"${reportData.rawNames[0]}"），**严禁**使用"A"、"B"、"受试者1"这种代号。
   - 术语替换：痛觉->剧痒；尖叫->缺氧大笑；折磨->高强度刺激。
4. **双人互动要求**：
   - 必须描写两人之间的【具体互动】（如"S的手指如何动作" -> "M的身体如何反应"）。
   - 结合【基础演算结论】进行扩展，不要与其矛盾。
5. 字数限制：180字以内。
6. 禁止开场白。`
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) throw new Error(`Server Error: ${response.status}`);

    const data = await response.json();
    const fullText = data.choices?.[0]?.message?.content || "【系统错误】样本数据解析中断。";

    onStream(fullText);
    if (onComplete) onComplete();

  } catch (error) {
    console.error("AI Request Failed:", error);
    if (onError) onError(error);
    else onStream("⚠️ 无法连接至实验室主机。\nERR: " + error.message);
  }
}

// 🌟 核心修改：构建带有上下文和具体名字的 Prompt
function buildSystemPrompt(data) {
  const statsStr = JSON.stringify(data.stats);
  // 获取真实名字，如果没有就回退到 A/B
  const name1 = data.rawNames[0] || "样本A";
  const name2 = data.rawNames[1] || "样本B";
  
  // 基础上下文（把 analyzer.js 算出来的结果喂给 AI）
  const contextInfo = data.context ? `\n【系统基础演算结论（参考）】\n"${data.context}"\n` : "";

  // === 单人模式 ===
  if (data.mode === 'SINGLE') {
    return `
【TK耐受测试 - 样本 M】
代号：${name1}
评级：${data.rank}
六维数据：${statsStr}
${contextInfo}

请分析 [${name1}] 在被束缚状态下的"痒觉耐受力"。
描述当针对其弱点进行持续挠痒刺激时，[${name1}] 会出现何种生理崩溃反应（如：脚趾蜷缩、剧烈挣扎、大笑至缺氧）。
`;
  }

  if (data.mode === 'ATTACK') {
    return `
【TK执行官资质 - 样本 S】
代号：${name1}
评级：${data.rank}
六维数据：${statsStr}
${contextInfo}

请分析 [${name1}] 的"挠痒处刑风格"。
描述 [${name1}] 如何利用其高数值项（如技巧或支配力），精准瓦解受刑者的防线，并从对方的笑声中获得愉悦。
`;
  }

  // === 双人模式 - 强互动 ===
  
  if (data.mode === 'RESONANCE') {
    return `
【双体神经共鸣实验】
参与者：[${name1}] & [${name2}]
同步率：${data.rank}
数据参考：${statsStr}
${contextInfo}

请重点分析 [${name1}] 与 [${name2}] 在同时接受挠痒刑罚时的【互动反应】：
1. 谁的笑声先失控？是否引发了另一方的连锁反应？
2. 结合"基础演算结论"，描述这种共鸣带来的感官冲击（是互相感染导致崩溃加速，还是互相作为精神支撑）。
`;
  }

  if (data.mode === 'VERSUS') {
    return `
【非对称攻防测试 (Tickle Torture)】
执行官(S)：[${name1}]
受刑者(M)：[${name2}]
胜负预测：${data.rank > 0 ? name1 + " 优势" : name2 + " 优势"}
数据参考：${statsStr}
${contextInfo}

请生成一段动态的【处刑现场记录】：
1. 描述 [${name1}] 使用了什么具体手段（依据其最高数据，如"指尖微操"或"工具"）。
2. 描述 [${name1}] 攻击了 [${name2}] 的哪个部位（依据 M 的最低数据，如"足底"或"腋下"）。
3. 详细描写 [${name2}] 在防线崩溃瞬间的反应（从咬牙忍耐转变为崩溃狂笑的过程）。
**必须直接使用名字 [${name1}] 和 [${name2}]，禁止使用代词。**
`;
  }

  return `分析数据：${statsStr}`;
}