// Vercel Serverless Function - 调用 Gemini 生成水墨画

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

        // 解析 base64 图片
        const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        // 获取对应的 prompt
        const prompt = PROMPTS[style] || PROMPTS.elegant;

        // 使用 REST API 直接调用 Gemini
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: base64Data
                            }
                        },
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                responseModalities: ['TEXT', 'IMAGE']
            }
        };

        console.log('Calling Gemini API...');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        console.log('Gemini API response status:', response.status);
        console.log('Gemini API response:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('Gemini API error:', data);
            return res.status(500).json({
                success: false,
                error: data.error?.message || '生成失败',
                details: data
            });
        }

        // 检查是否有生成的图片
        if (data.candidates && data.candidates[0]?.content?.parts) {
            const parts = data.candidates[0].content.parts;

            for (const part of parts) {
                if (part.inlineData || part.inline_data) {
                    const inlineData = part.inlineData || part.inline_data;
                    const generatedImage = `data:${inlineData.mimeType || inlineData.mime_type};base64,${inlineData.data}`;
                    return res.status(200).json({
                        success: true,
                        image: generatedImage
                    });
                }
            }

            // 如果没有图片，返回文本
            for (const part of parts) {
                if (part.text) {
                    return res.status(200).json({
                        success: false,
                        error: '模型未生成图片，返回了文本描述',
                        message: part.text
                    });
                }
            }
        }

        return res.status(500).json({
            success: false,
            error: '生成失败，未收到有效响应',
            details: data
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({
            success: false,
            error: '生成失败: ' + (error.message || '未知错误')
        });
    }
};
