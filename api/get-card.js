// Vercel Serverless Function - 获取贺卡数据

// 注意：由于 Vercel Serverless Functions 是无状态的，
// 每个请求可能运行在不同的实例上，内存存储不可靠
// 这里提供一个基础实现，实际使用建议配置 Firebase

module.exports = async (req, res) => {
    // 设置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ success: false, error: '缺少贺卡 ID' });
        }

        // 尝试从内存获取（简化版，实际可能获取不到）
        // 生产环境应该从 Firebase Firestore 获取
        // const card = await getFromFirestore(id);

        // 由于 Serverless 函数的无状态特性，这里的内存存储可能不可靠
        // 前端会回退到 localStorage
        return res.status(404).json({
            success: false,
            error: '贺卡不存在'
        });

    } catch (error) {
        console.error('Get card error:', error);
        return res.status(500).json({
            success: false,
            error: '获取失败: ' + (error.message || '未知错误')
        });
    }
};
