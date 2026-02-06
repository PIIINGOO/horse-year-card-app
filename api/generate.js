// Vercel Serverless Function - 调用 Gemini 生成水墨画
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Prompt 模板
const PROMPTS = {
    elegant: `Transform this photo into a traditional Chinese ink wash painting style portrait.

Style requirements:
- Traditional Chinese ink painting (水墨画) aesthetic with delicate watercolor washes
- Elegant flowing lines with visible brush stroke texture
- Color palette: soft pinks, vermillion red, ink black, rice paper white, subtle jade green
- Character wearing traditional Chinese Hanfu clothing with flowing sleeves and elegant draping
- Background: minimalist with scattered plum blossoms or cherry blossoms petals falling
- Add subtle ink wash mountains or mist in the far background
- Include a small red seal stamp (印章) in the corner
- Maintain the person's facial features and likeness while stylizing them
- Year of the Horse elements: subtle horse motifs in clothing patterns or a small decorative horse accessory
- Overall mood: serene, poetic, traditional Chinese painting elegance
- Aspect ratio: portrait orientation`,

    cute: `Transform this photo into a cute Chinese New Year illustration style.

Style requirements:
- Adorable chibi/Q-version character design with big expressive eyes
- Traditional Chinese ink wash painting texture as base
- Color palette: warm vermillion red, soft pink, pine green, cream yellow, gentle orange
- Character wearing cute traditional Chinese festive clothing (Tang suit or Hanfu)
- Background: festive Chinese New Year scene with traditional architecture, snow, or blooming trees
- Decorative elements: red lanterns, lucky clouds, auspicious patterns, falling petals or snow
- Include cute Year of the Horse elements: small horse companions, horse-themed accessories, or horse zodiac symbols
- Add a red seal stamp (印章) in the corner
- Maintain the person's recognizable features while making them cute and stylized
- Overall mood: warm, festive, joyful celebration atmosphere
- Aspect ratio: portrait orientation`
};

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
        const { image, style } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, error: '请提供图片' });
        }

        // 检查 API Key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'API Key 未配置' });
        }

        // 初始化 Gemini
        const genAI = new GoogleGenerativeAI(apiKey);

        // 使用支持图像生成的模型配置
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseModalities: ['Text', 'Image']
            }
        });

        // 解析 base64 图片
        const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        // 获取对应的 prompt
        const prompt = PROMPTS[style] || PROMPTS.elegant;

        // 调用 Gemini 生成图片
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                }
            },
            { text: prompt }
        ]);

        const response = await result.response;

        // 检查是否有生成的图片
        if (response.candidates && response.candidates[0]) {
            const candidate = response.candidates[0];

            // 尝试获取生成的图片
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        const generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        return res.status(200).json({
                            success: true,
                            image: generatedImage
                        });
                    }
                }
            }

            // 如果没有图片，返回文本响应
            const text = response.text();
            return res.status(200).json({
                success: false,
                error: '未能生成图片，模型返回了文本描述',
                message: text
            });
        }

        return res.status(500).json({
            success: false,
            error: '生成失败，请重试'
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({
            success: false,
            error: '生成失败: ' + (error.message || '未知错误')
        });
    }
};
