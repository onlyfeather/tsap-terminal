// src/utils/aiService.js

const API_URL = "/api/chat"; 

/**
 * 调用 AI 生成深度分析报告 (非流式 - 一次性返回)
 */
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
            // 🌟 核心修改 1：确立"Tickle/挠痒"为核心研究课题
            content: `身份：TSAP实验室-痒觉耐受与神经反射研究终端。
任务：基于监测数据，生成一份【Tickle实验评估日志】。

风格要求：
1. **核心主题：挠痒 (Tickle)**。必须聚焦于"痒觉过载"、"笑肌痉挛"、"敏感带测试"。
2. **文风**：保持"冷酷科学家观察实验品"的口吻。
3. **术语替换**：
   - 不要说"疼痛"，要说"无法处理的痒觉信号"。
   - 不要说"尖叫"，要说"无法抑制的生理性大笑"或"缺氧性喘息"。
   - 不要说"折磨"，要说"高强度感官刺激"。
4. **双人模式要求**：
   - **禁止**分别描述两人（如"A是...B是..."）。
   - **必须**描述两者的**互动反应**（如"A的笑声导致B产生镜像神经反射"或"A的指尖技巧精准击穿了B的足底防线"）。
5. 字数限制：180字以内。
6. 禁止开场白，直接输出正文。`
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

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

// 🌟 核心修改 2：构建强互动性的 Prompt
function buildSystemPrompt(data) {
  const statsStr = JSON.stringify(data.stats);
  const name = data.name;

  // === 单人模式 (Single / Attack) ===
  if (data.mode === 'SINGLE') {
    return `
【TK耐受测试 - 样本 M】
代号：${name}
评级：${data.rank}
六维数据：${statsStr}

请分析该样本在被束缚状态下的"痒觉耐受力"。
重点指出其最致命的"痒点"（数值最高的敏感部位），并描述当羽毛或手指持续刺激该部位时，样本会出现何种生理崩溃反应（如：脚趾蜷缩、剧烈挣扎、大笑至缺氧）。
`;
  }

  if (data.mode === 'ATTACK') {
    return `
【TK执行官资质 - 样本 S】
代号：${name}
评级：${data.rank}
六维数据：${statsStr}

请分析该执行官的"挠痒处刑风格"。
基于其最高的数据（如技巧、支配或施虐），描述他如何从受刑者的笑声中获得愉悦，以及他最擅长使用何种手段（如：指尖微操、工具辅助、无情钻击）来瓦解受刑者的理智。
`;
  }

  // === 双人模式 (Resonance / Versus) - 强制互动 ===
  // 这里我们需要解析一下 stats，因为双人模式下 stats 是个数组
  // 我们在前端传参时已经做了简化，但为了保险，这里假设 data.stats 包含了两个人的数据
  // 注意：你在前端调用时需要确保传了两个人的数据。
  // 如果前端只传了一个，AI 可能会困惑。建议检查一下前端调用逻辑。
  // 这里假设 prompt 里我们手动拼接一下描述会更好。
  
  if (data.mode === 'RESONANCE') {
    return `
【双体神经共鸣实验】
实验体 A & B：${name}
同步率：${data.rank}
数据参考：${statsStr}

请**不要**分别描述两人。请重点分析他们被同时挠痒时的**交互反应**：
1. 当一方因为剧痒而狂笑时，另一方是否会受到感染？
2. 他们是否有共同的致命弱点（如都怕脚心）？如果是，描述双倍刺激下的连锁崩溃。
3. 描述这种"笑声回荡"的场景带来的感官冲击。
`;
  }

  if (data.mode === 'VERSUS') {
    // 攻防模式：S vs M
    // 我们需要告诉 AI 谁是 S (第一个)，谁是 M (第二个)
    // 这里的 data.stats 可能是个混合体，为了效果最好，
    // 我建议让 AI 自己从名字字符串里去理解（因为我们在前端拼接了名字 A & B）
    return `
【非对称攻防测试 (Tickle Torture)】
场景：执行官(S) 对受刑者(M) 进行挠痒审讯。
参与者：${name} (格式为 S & M)
攻防数据：${statsStr}

请以此生成一段**动态的处刑推演**：
1. 分析 S 最擅长的手段（如：精密指法或器械）。
2. 分析 M 最薄弱的痒点（如：腋下或足底）。
3. **描写互动**：描述 S 如何利用其优势，精准攻击 M 的弱点。
4. 描述 M 在防御被击穿后的惨状（如：从咬牙忍耐到彻底崩溃大笑）。
`;
  }

  return `分析数据：${statsStr}`;
}