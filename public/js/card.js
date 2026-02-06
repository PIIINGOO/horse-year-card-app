// ===== 收卡页面脚本 =====

// DOM 元素
const elements = {
    envelopeSection: document.getElementById('envelopeSection'),
    cardContent: document.getElementById('cardContent'),
    errorSection: document.getElementById('errorSection'),
    senderDisplay: document.getElementById('senderDisplay'),
    recipientDisplay: document.getElementById('recipientDisplay'),
    openCardBtn: document.getElementById('openCardBtn'),
    cardImage: document.getElementById('cardImage'),
    recipientName: document.getElementById('recipientName'),
    senderName: document.getElementById('senderName'),
    greetingText: document.getElementById('greetingText'),
    saveCardBtn: document.getElementById('saveCardBtn'),
    makeOwnBtn: document.getElementById('makeOwnBtn'),
    goMakeBtn: document.getElementById('goMakeBtn'),
    envelope: document.querySelector('.envelope'),
    ogTitle: document.getElementById('ogTitle'),
    ogDescription: document.getElementById('ogDescription')
};

// 贺卡数据
let cardData = null;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    loadCard();
    initActions();
});

// ===== 加载贺卡 =====
async function loadCard() {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');

    if (!cardId) {
        showError();
        return;
    }

    try {
        // 尝试从服务器获取
        const response = await fetch(`/api/get-card?id=${cardId}`);
        const data = await response.json();

        if (data.success && data.card) {
            cardData = data.card;
            displayCardInfo();
        } else {
            throw new Error('Card not found on server');
        }
    } catch (error) {
        console.log('尝试从本地存储获取...');
        // 尝试从本地存储获取
        const localData = localStorage.getItem(cardId);
        if (localData) {
            try {
                cardData = JSON.parse(localData);
                displayCardInfo();
            } catch (e) {
                showError();
            }
        } else {
            showError();
        }
    }
}

function displayCardInfo() {
    // 更新页面标题
    const title = cardData.showSender
        ? `有一张来自 ${cardData.sender} 的贺卡待签收`
        : '有一张神秘贺卡待签收';

    document.title = title;

    // 更新 Open Graph 标签
    if (elements.ogTitle) {
        elements.ogTitle.content = title + ' 🐴';
    }

    // 显示发件人和收件人
    elements.senderDisplay.textContent = cardData.showSender ? cardData.sender : '神秘好友';
    elements.recipientDisplay.textContent = cardData.recipient || '你';
}

function showError() {
    elements.envelopeSection.classList.add('hidden');
    elements.cardContent.classList.add('hidden');
    elements.errorSection.classList.remove('hidden');
}

// ===== 拆卡动画 =====
function initActions() {
    elements.openCardBtn.addEventListener('click', openCard);
    elements.saveCardBtn.addEventListener('click', saveCard);
    elements.makeOwnBtn.addEventListener('click', goMakeOwn);
    elements.goMakeBtn.addEventListener('click', goMakeOwn);
}

function openCard() {
    if (!cardData) return;

    // 播放信封打开动画
    elements.envelope.classList.add('opening');

    // 延迟显示贺卡内容
    setTimeout(() => {
        elements.envelopeSection.classList.add('hidden');
        showCardContent();
    }, 800);
}

function showCardContent() {
    // 设置贺卡内容
    elements.cardImage.src = cardData.image;
    elements.recipientName.textContent = cardData.recipient || '你';
    elements.senderName.textContent = cardData.sender || '好友';
    elements.greetingText.textContent = `「${cardData.greeting || '马到成功，新春大吉！'}」`;

    // 显示贺卡
    elements.cardContent.classList.remove('hidden');
}

// ===== 保存贺卡 =====
function saveCard() {
    if (!cardData || !cardData.image) return;

    const link = document.createElement('a');
    link.download = '马年贺卡_' + Date.now() + '.png';
    link.href = cardData.image;
    link.click();
}

// ===== 跳转制作 =====
function goMakeOwn() {
    window.location.href = '/';
}
