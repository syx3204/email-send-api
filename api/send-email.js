const querystring = require('querystring');

module.exports = async (req, res) => {
  // 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 解析参数
    const params = req.method === 'POST' 
      ? querystring.parse(req.body)
      : req.query;

    // 参数验证
    const required = ['email', 'title', 'content'];
    const missing = required.filter(field => !params[field]);
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: `缺少参数: ${missing.join(', ')}` 
      });
    }

    // 构建 API 请求
    const apiPayload = {
      email_fa: process.env.EMAIL_FA,
      email_mm: process.env.EMAIL_MM,
      email_shou: params.email,
      email_bt: params.title,
      email_nr: encodeURIComponent(params.content),
      email_file_url: params.email_file_url || '',
      email_file_name: params.email_file_name || ''
    };

    // 处理附件文件名
    if (params.email_file_name && params.email_file_url) {
      apiPayload.email_file_url = 
        `${params.email_file_url}$$${params.email_file_name}`;
    }

    // 调用邮件 API
    const apiResponse = await fetch('https://api.dragonlongzhu.cn/api/email.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(apiPayload)
    });

    // 转发响应
    const result = await apiResponse.text();
    res.status(apiResponse.status).send(result);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: '服务器内部错误',
      details: error.message 
    });
  }
};
