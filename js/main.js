// ===== 全局状态 =====
const state = {
    uploadedFile: null,
    uploadedImageBase64: null,
    generatedImageBase64: null,
    selectedStyle: 'elegant',
    selectedTemplate: '1',
    isGenerating: false
};

// ===== DOM 元素 =====
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    uploadPlaceholder: document.getElementById('uploadPlaceholder'),
    fileInput: document.getElementById('fileInput'),
    previewImage: document.getElementById('previewImage'),
    generatedImage: document.getElementById('generatedImage'),
    reuploadBtn: document.getElementById('reuploadBtn'),
    generateBtn: document.getElementById('generateBtn'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    recipientName: document.getElementById('recipientName'),
    senderName: document.getElementById('senderName'),
    greetingSelect: document.getElementById('greetingSelect'),
    greetingText: document.getElementById('greetingText'),
    showSenderName: document.getElementById('showSenderName'),
    generateLinkBtn: document.getElementById('generateLinkBtn'),
    saveImageBtn: document.getElementById('saveImageBtn'),
    shareModal: document.getElementById('shareModal'),
    shareLink: document.getElementById('shareLink'),
    copyLinkBtn: document.getElementById('copyLinkBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    styleBtns: document.querySelectorAll('.style-btn'),
    templateItems: document.querySelectorAll('.template-item')
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initUpload();
    initStyleSelection();
    initTemplateSelection();
    initGreetingSelection();
    initActions();
});

// ===== 上传功能 =====
function initUpload() {
    // 点击上传
    elements.uploadArea.addEventListener('click', () => {
        if (!state.uploadedFile) {
            elements.fileInput.click();
        }
    });

    // 文件选择
    elements.fileInput.addEventListener('change', handleFileSelect);

    // 拖拽上传
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('drag-over');
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('drag-over');
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 重新上传
    elements.reuploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
        elements.fileInput.click();
    });

    // 生成按钮
    elements.generateBtn.addEventListener('click', generateImage);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // 检查文件类型
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('请上传 JPG 或 PNG 格式的图片');
        return;
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('图片过大，请上传 5MB 以内的图片');
        return;
    }

    state.uploadedFile = file;

    // 读取并预览
    const reader = new FileReader();
    reader.onload = (e) => {
        state.uploadedImageBase64 = e.target.result;
        showPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

function showPreview(dataUrl) {
    elements.uploadPlaceholder.classList.add('hidden');
    elements.previewImage.src = dataUrl;
    elements.previewImage.classList.remove('hidden');
    elements.generatedImage.classList.add('hidden');
    elements.reuploadBtn.disabled = false;
    elements.generateBtn.disabled = false;

    // 重置生成状态
    state.generatedImageBase64 = null;
    updateActionButtons();
}

function resetUpload() {
    state.uploadedFile = null;
    state.uploadedImageBase64 = null;
    state.generatedImageBase64 = null;
    elements.uploadPlaceholder.classList.remove('hidden');
    elements.previewImage.classList.add('hidden');
    elements.previewImage.src = '';
    elements.generatedImage.classList.add('hidden');
    elements.generatedImage.src = '';
    elements.fileInput.value = '';
    elements.reuploadBtn.disabled = true;
    elements.generateBtn.disabled = true;
    updateActionButtons();
}

// ===== 生成图片 =====
async function generateImage() {
    if (!state.uploadedImageBase64 || state.isGenerating) return;

    state.isGenerating = true;
    elements.loadingOverlay.classList.remove('hidden');
    elements.generateBtn.disabled = true;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: state.uploadedImageBase64,
                style: state.selectedStyle
            })
        });

        const data = await response.json();

        if (data.success && data.image) {
            state.generatedImageBase64 = data.image;
            showGeneratedImage(data.image);
        } else {
            throw new Error(data.error || '生成失败');
        }
    } catch (error) {
        console.error('生成失败:', error);
        alert('生成失败，请重试');
    } finally {
        state.isGenerating = false;
        elements.loadingOverlay.classList.add('hidden');
        elements.generateBtn.disabled = false;
    }
}

function showGeneratedImage(dataUrl) {
    elements.previewImage.classList.add('hidden');
    elements.generatedImage.src = dataUrl;
    elements.generatedImage.classList.remove('hidden');
    updateActionButtons();
}

// ===== 风格选择 =====
function initStyleSelection() {
    elements.styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.styleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedStyle = btn.dataset.style;
        });
    });
}

// ===== 模板选择 =====
function initTemplateSelection() {
    elements.templateItems.forEach(item => {
        item.addEventListener('click', () => {
            elements.templateItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            state.selectedTemplate = item.dataset.template;
        });
    });
}

// ===== 祝福语选择 =====
function initGreetingSelection() {
    elements.greetingSelect.addEventListener('change', () => {
        const value = elements.greetingSelect.value;
        if (value === 'custom') {
            elements.greetingText.focus();
        } else if (value) {
            elements.greetingText.value = value;
        }
    });
}

// ===== 操作按钮 =====
function initActions() {
    elements.generateLinkBtn.addEventListener('click', generateShareLink);
    elements.saveImageBtn.addEventListener('click', saveImage);
    elements.copyLinkBtn.addEventListener('click', copyShareLink);
    elements.closeModalBtn.addEventListener('click', closeShareModal);
}

function updateActionButtons() {
    const hasGenerated = !!state.generatedImageBase64;
    elements.generateLinkBtn.disabled = !hasGenerated;
    elements.saveImageBtn.disabled = !hasGenerated;
}

async function generateShareLink() {
    if (!state.generatedImageBase64) return;

    const recipient = elements.recipientName.value.trim() || '你';
    const sender = elements.senderName.value.trim() || '好友';
    const greeting = elements.greetingText.value.trim() || '马到成功，新春大吉！';
    const showSender = elements.showSenderName.checked;

    try {
        // 保存贺卡数据到服务器
        const response = await fetch('/api/save-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: state.generatedImageBase64,
                recipient,
                sender,
                greeting,
                showSender,
                template: state.selectedTemplate
            })
        });

        const data = await response.json();

        if (data.success && data.cardId) {
            const shareUrl = `${window.location.origin}/card.html?id=${data.cardId}`;
            elements.shareLink.value = shareUrl;
            elements.shareModal.classList.remove('hidden');
        } else {
            throw new Error(data.error || '生成链接失败');
        }
    } catch (error) {
        console.error('生成链接失败:', error);
        // 如果后端未配置，使用本地存储方案
        const cardData = {
            image: state.generatedImageBase64,
            recipient,
            sender,
            greeting,
            showSender,
            template: state.selectedTemplate,
            createdAt: Date.now()
        };

        const cardId = 'card_' + Date.now();
        localStorage.setItem(cardId, JSON.stringify(cardData));

        const shareUrl = `${window.location.origin}/card.html?id=${cardId}`;
        elements.shareLink.value = shareUrl;
        elements.shareModal.classList.remove('hidden');
    }
}

function copyShareLink() {
    elements.shareLink.select();
    document.execCommand('copy');

    const originalText = elements.copyLinkBtn.textContent;
    elements.copyLinkBtn.textContent = '已复制!';
    setTimeout(() => {
        elements.copyLinkBtn.textContent = originalText;
    }, 2000);
}

function closeShareModal() {
    elements.shareModal.classList.add('hidden');
}

async function saveImage() {
    if (!state.generatedImageBase64) return;

    try {
        // 创建合成的贺卡图片
        const canvas = await createCardCanvas();

        // 下载图片
        const link = document.createElement('a');
        link.download = '马年贺卡_' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('保存失败:', error);
        // 直接下载生成的图片
        const link = document.createElement('a');
        link.download = '马年贺卡_' + Date.now() + '.png';
        link.href = state.generatedImageBase64;
        link.click();
    }
}

async function createCardCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布大小
    canvas.width = 800;
    canvas.height = 1000;

    // 背景色
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 加载并绘制生成的图片
    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
        img.onload = () => {
            // 绘制图片（居中）
            const imgWidth = 600;
            const imgHeight = (img.height / img.width) * imgWidth;
            const x = (canvas.width - imgWidth) / 2;
            const y = 80;

            ctx.drawImage(img, x, y, imgWidth, imgHeight);

            // 绘制文字
            const recipient = elements.recipientName.value.trim() || '你';
            const sender = elements.senderName.value.trim() || '好友';
            const greeting = elements.greetingText.value.trim() || '马到成功，新春大吉！';

            ctx.fillStyle = '#2C2C2C';
            ctx.font = '24px "Noto Serif SC"';
            ctx.textAlign = 'center';

            const textY = y + imgHeight + 60;
            ctx.fillText(`送给：${recipient}`, canvas.width / 2, textY);
            ctx.fillText(`来自：${sender}`, canvas.width / 2, textY + 40);

            ctx.fillStyle = '#C41E3A';
            ctx.font = '32px "Ma Shan Zheng"';
            ctx.fillText(`「${greeting}」`, canvas.width / 2, textY + 100);

            resolve(canvas);
        };
        img.onerror = reject;
        img.src = state.generatedImageBase64;
    });
}
