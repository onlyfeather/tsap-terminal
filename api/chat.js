// api/chat.js

const referer = req.headers.get('referer');
// 只允许你自己的域名访问 (比如 tsap-lab.asia)
// 本地开发时 referer 可能是 localhost，也要允许
if (referer && !referer.includes('tsap-lab.asia') && !referer.includes('localhost')) {
  return new Response('Forbidden: Access Denied', { status: 403 });
}

export const config = {
  runtime: 'edge', // 使用 Edge 模式，支持流式传输
};

export default async function handler(req) {
  // 1. 安全检查：只允许 POST 请求
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. 这里的 Key 是从服务器环境变量读取的，用户绝对看不见
  const API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!API_KEY) {
    return new Response('Server Configuration Error: Missing API Key', { status: 500 });
  }

  try {
    // 解析前端发来的数据
    const { messages } = await req.json();

    // 3. 向 DeepSeek 发起请求
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: true, // 开启流
        temperature: 1.3
      })
    });

    // 4. 直接把 DeepSeek 的流式响应“转发”回前端
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}