// api/chat.js

// 使用 Edge Runtime 以获得最快响应速度
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 1. 安全检查
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. 获取环境变量中的 Key
  const API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'Server Config Error: Missing API Key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { messages } = await req.json();

    // 3. 请求 DeepSeek API (非流式模式)
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: false,    // 🌟 关键修改：关闭流式，防止乱码
        temperature: 0.7, // 🌟 关键修改：降低随机性，保证逻辑严密
        max_tokens: 300   // 限制长度
      })
    });

    // 4. 获取完整 JSON 数据
    const data = await response.json();

    // 5. 返回给前端
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}