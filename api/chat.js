// api/chat.js

// 使用 Edge Runtime 以获得最快响应速度 (Vercel Serverless Function)
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 1. 安全检查：仅允许 POST 请求
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. 获取环境变量中的 Key (请确保在 Vercel 后台已配置 DEEPSEEK_API_KEY)
  const API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server Config Error: Missing API Key' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 3. 解析前端发来的数据
    const { messages } = await req.json();

    // 4. 请求 DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // 使用 DeepSeek V3
        messages: messages,     // 前端构建好的 Prompt
        
        // 🌟 关键配置 1: 关闭流式输出
        // 确保 AI 思考完整后再返回，避免断句和乱码，
        // 同时也为了保证"双人互动"逻辑的连贯性。
        stream: false,
        
        // 🌟 关键配置 2: 降低随机性 (0.7)
        // 0.7 是生成"学术/实验报告"的最佳平衡点。
        // 太高(1.3)会说胡话，太低(0.1)会像机器人太死板。
        temperature: 0.7,
        
        // 🌟 关键配置 3: 增加长度限制
        // 留出足够的空间给 AI 描写"互动细节"
        max_tokens: 500
      })
    });

    // 5. 获取 DeepSeek 返回的完整 JSON
    const data = await response.json();

    // 6. 检查 DeepSeek 是否返回了错误信息
    if (data.error) {
      throw new Error(`DeepSeek API Error: ${data.error.message}`);
    }

    // 7. 将结果返回给前端
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        // 允许跨域 (如果是本地开发调试)
        'Access-Control-Allow-Origin': '*' 
      }
    });

  } catch (error) {
    console.error("Backend Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}