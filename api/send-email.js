const querystring = require('querystring');

module.exports = async (req, res) => {
  // CORS配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 参数解析
    const params = req.method === 'POST' 
      ? querystring.parse(req.body)
      : req.query;

    // 参数验证
    const required = ['email', 'title', 'content'];
    const missing = required.filter(field => !params[field]);
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: `缺少必要参数: ${missing.join(', ')}` 
      });
    }

    // 构建新API参数
    const apiPayload = {
      email: process.env.EMAIL_FA,  // 保持与新API参数名一致
      key: process.env.EMAIL_MM,
      mail: params.email,
      title: params.title,
      name: process.env.EMAIL_NAME || '默认昵称',
      text: params.content
    };

    // 调用新邮件API
    const apiUrl = 'http://api.mmp.cc/api/mail?' + new URLSearchParams(apiPayload);
    const apiResponse = await fetch(apiUrl);

    // 处理响应
    const result = await apiResponse.json();
    res.status(apiResponse.ok ? 200 : 500).json(result);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      status: "error",
      message: `服务器内部错误: ${error.message}`
    });
  }
};
