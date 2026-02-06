// Vercel Serverless Function - 保存贺卡数据
// 注意：这是一个简化版本，使用内存存储
// 生产环境建议使用 Firebase Firestore 或其他数据库

// 简单的内存存储（Vercel 会在函数冷启动时重置）
// 实际部署时应该使用 Firebase 或其他持久化存储
const cards = new Map();

module.exports = async (req, res) => {
    // 设置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { image, recipient, sender, greeting, showSender, template } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, error: '缺少图片数据' });
        }

        // 生成唯一 ID
        const cardId = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // 保存贺卡数据
        const cardData = {
            id: cardId,
            image,
            recipient: recipient || '你',
            sender: sender || '好友',
            greeting: greeting || '马到成功，新春大吉！',
            showSender: showSender !== false,
            template: template || '1',
            createdAt: Date.now()
        };

        // 存储到内存（简化版）
        cards.set(cardId, cardData);

        // 如果配置了 Firebase，可以在这里保存到 Firestore
        // await saveToFirestore(cardData);

        return res.status(200).json({
            success: true,
            cardId: cardId
        });

    } catch (error) {
        console.error('Save card error:', error);
        return res.status(500).json({
            success: false,
            error: '保存失败: ' + (error.message || '未知错误')
        });
    }
};

// 导出 cards 以便 get-card 使用
module.exports.cards = cards;
