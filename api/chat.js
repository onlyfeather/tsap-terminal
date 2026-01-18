// api/chat.js

// 1. 配置 Edge Runtime (这一行必须在最外面)
export const config = {
  runtime: 'edge',
};

// 2. 核心处理函数 (所有的逻辑、判断、return 都必须写在这个 function 的大括号里面！)
export default async function handler(req) {
  
  // === 安全检查区 ===
  
  // 检查请求方法
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // (可选) 检查 Referer 防盗用
  // 如果你之前把这段贴到了函数外面，就会报错。现在它在函数里面，是安全的。
  const referer = req.headers.get('referer');
  // 允许 localhost (本地调试) 和 tsap-lab.asia (你的域名，如果有的话)
  // 如果你还没有域名，可以暂时注释掉下面这三行
  // if (referer && !referer.includes('localhost') && !referer.includes('tsap-lab')) {
  //   return new Response('Forbidden', { status: 403 });
  // }

  // === 核心逻辑区 ===

  // 读取环境变量 (在 Vercel 后台配置的 DEEPSEEK_API_KEY)
  const API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server Config Error: Missing API Key' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 解析前端发来的数据
    const { messages } = await req.json();

    // 向 DeepSeek 发起请求
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: true, // 开启流式传输
        temperature: 1.3
      })
    });

    // 转发流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}