// Service Worker登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/everyday10questions-frontend/sw.js')
            .catch(err => console.error('Service Worker登録失敗:', err));
    });
}

const BASE_URL = "https://hidehikokondo.github.io/everyday10questions-frontend/questions/";
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// DOM要素
const questionNumberEl = document.getElementById('question-number');
const questionScopeEl = document.getElementById('question-scope');
const currentScoreEl = document.getElementById('current-score');
const progressBar = document.getElementById('progress-bar');
const questionTextEl = document.getElementById('question-text');
const textContentEl = document.getElementById('text-content');
const hintBox = document.getElementById('hint-box');
const hintTextEl = document.getElementById('hint-text');
const choicesContainer = document.getElementById('choices-container');
const feedbackSection = document.getElementById('feedback-section');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackExplanation = document.getElementById('feedback-explanation');
const feedbackIcon = document.getElementById('feedback-icon');

// --- 画面管理 ---

// 全画面のIDリスト
const ALL_SCREEN_IDS = [
    'category-screen', 'itpassport-screen', 'sg-screen',
    'fe-screen', 'sc-screen', 'quiz-screen', 'result-screen'
];

// 指定した画面のみを表示し、それ以外を非表示にする
function showScreen(screenId) {
    ALL_SCREEN_IDS.forEach(id => document.getElementById(id).classList.add('d-none'));
    const screen = document.getElementById(screenId);
    screen.classList.remove('d-none');
    screen.classList.add('fade-in');
}

function showCategoryScreen() {
    showScreen('category-screen');
}

function showSubScreen(category) {
    showScreen(category + '-screen');
}

// --- クイズ ---

async function startQuiz(filename) {
    showScreen('quiz-screen');

    // ローディング状態を表示
    questionTextEl.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div> Loading questions...';
    choicesContainer.innerHTML = '';

    try {
        const response = await fetch(BASE_URL + filename);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        questions = data.questions;
        currentQuestionIndex = 0;
        score = 0;
        updateScore();
        showQuestion();
    } catch (error) {
        console.error('Error fetching quiz data:', error);
        questionTextEl.innerHTML = `<div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Failed to load questions. Please check your connection and try again.
            <br>
            <button class="btn btn-outline-danger btn-sm mt-3" onclick="location.reload()">Reload Page</button>
        </div>`;
    }
}

function showQuestion() {
    const question = questions[currentQuestionIndex];

    // UIリセット
    feedbackSection.style.display = 'none';
    hintBox.style.display = 'none';
    choicesContainer.innerHTML = '';

    // 情報更新
    questionNumberEl.textContent = currentQuestionIndex + 1;
    questionScopeEl.textContent = question.scope;
    questionTextEl.textContent = question.question;

    // テキストフィールドがあればバッジに表示
    if (question.text) {
        textContentEl.textContent = question.text;
        textContentEl.style.display = '';
    } else {
        textContentEl.style.display = 'none';
    }

    hintTextEl.textContent = question.hint;

    // プログレスバー更新
    const progress = (currentQuestionIndex / questions.length) * 100;
    progressBar.style.width = `${progress}%`;

    // 選択肢ボタン生成
    ['choice1', 'choice2', 'choice3', 'choice4'].forEach((choiceKey, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span class="badge bg-light text-dark border me-2">${index + 1}</span> ${question[choiceKey]}`;
        btn.onclick = () => checkAnswer(choiceKey, btn);
        choicesContainer.appendChild(btn);
    });
}

function toggleHint() {
    const isHidden = hintBox.style.display === 'none' || hintBox.style.display === '';
    hintBox.style.display = isHidden ? 'block' : 'none';
}

function checkAnswer(selectedChoice, btnElement) {
    // 全ボタンを無効化
    const buttons = choicesContainer.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true);

    const question = questions[currentQuestionIndex];
    const isCorrect = selectedChoice === question.answer;

    // フィードバック表示
    feedbackSection.style.display = 'block';
    feedbackExplanation.textContent = question.explanation;

    // スマホで次へボタンが見えるようにフィードバック欄までスクロール
    setTimeout(() => {
        feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    if (isCorrect) {
        score++;
        updateScore();
        btnElement.classList.add('correct');
        feedbackSection.classList.remove('incorrect');
        feedbackSection.classList.add('correct');
        feedbackTitle.textContent = "正解！ Excellent!";
        feedbackTitle.style.color = "#2f855a";
        feedbackIcon.className = "bi bi-check-circle-fill fs-3 text-success";
    } else {
        btnElement.classList.add('incorrect');
        // 正解のボタンをハイライト
        const correctBtnIndex = parseInt(question.answer.replace('choice', '')) - 1;
        buttons[correctBtnIndex].classList.add('correct');
        feedbackSection.classList.remove('correct');
        feedbackSection.classList.add('incorrect');
        feedbackTitle.textContent = "残念... Incorrect";
        feedbackTitle.style.color = "#c53030";
        feedbackIcon.className = "bi bi-x-circle-fill fs-3 text-danger";
    }
}

function updateScore() {
    currentScoreEl.textContent = score;
}

function nextQuestion() {
    currentQuestionIndex++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    showScreen('result-screen');

    document.getElementById('final-score').textContent = score;

    const percentage = (score / questions.length) * 100;
    document.getElementById('final-score-circle').style.setProperty('--score-percent', `${percentage}%`);

    const messageEl = document.getElementById('result-message');
    if (score === 10) {
        messageEl.textContent = "Perfect!! 素晴らしい！";
        if (!isMissionCleared()) clearMission();
    } else if (score >= 8) {
        messageEl.textContent = "Excellent! とても良い成績です！";
    } else if (score >= 6) {
        messageEl.textContent = "Good Job! あと少しで満点です！";
    } else {
        messageEl.textContent = "Keep Trying! 復習してまた挑戦しましょう！";
    }
}

// --- デイリーミッション ---

const MISSION_KEY = 'dailyMissionCleared';

// 今日の日付文字列を返す（YYYY-MM-DD）
function getTodayStr() {
    return new Date().toLocaleDateString('sv-SE');
}

// ミッションクリア済みかどうかを判定
function isMissionCleared() {
    return localStorage.getItem(MISSION_KEY) === getTodayStr();
}

// 広告を非表示にする
function hideAds() {
    document.querySelectorAll('.ad').forEach(el => el.style.display = 'none');
}

// 広告を表示する
function showAds() {
    document.querySelectorAll('.ad').forEach(el => el.style.display = '');
}

// ナビゲーションのミッション状態を更新
function updateMissionBadge() {
    const icon = document.getElementById('mission-icon');
    const label = document.getElementById('mission-label');
    if (isMissionCleared()) {
        icon.classList.remove('mission-icon-inactive');
        icon.style.color = '#48bb78';
        label.textContent = 'ミッションクリア';
        label.classList.remove('text-muted');
        label.style.color = '#48bb78';
    } else {
        icon.classList.add('mission-icon-inactive');
        icon.style.color = '';
        label.textContent = 'デイリーミッション';
        label.classList.add('text-muted');
        label.style.color = '';
    }
}

// ミッションをクリアして保存
function clearMission() {
    localStorage.setItem(MISSION_KEY, getTodayStr());
    hideAds();
    updateMissionBadge();
    showModal('missionClearModal');
}

// 起動時の初期化
(function initDailyMission() {
    if (isMissionCleared()) hideAds();
    updateMissionBadge();
})();

// --- モーダル ---

// モーダルを取得または生成して表示するヘルパー
function showModal(id) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show();
}

function showMissionInfo() {
    showModal('missionInfoModal');
}

function showTerms(event) {
    event.preventDefault();
    showModal('termsModal');
}

function showPrivacyPolicy(event) {
    event.preventDefault();
    showModal('privacyPolicyModal');
}

function showDailyMission(event) {
    event.preventDefault();
    showModal('dailyMissionModal');
}

function showAbout(event) {
    event.preventDefault();
    showModal('aboutModal');
}

function showComingSoon(event) {
    event.preventDefault();
    showModal('comingSoonModal');
}

// --- フッターナビゲーション ---

function footerNav(event, category) {
    event.preventDefault();
    showCategoryScreen();
    showSubScreen(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 設定・PWAインストール ---

let deferredInstallPrompt = null;

// Android Chrome: インストールプロンプトを事前に保持
window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
});

// Android Chromeかどうかを判定
function isAndroidChrome() {
    const ua = navigator.userAgent;
    return /Android/.test(ua) && /Chrome/.test(ua) && !/EdgA|OPR|SamsungBrowser/.test(ua);
}

// iOSのSafariかどうかを判定（将来のiOS対応用に残存）
function isIosSafari() {
    const ua = navigator.userAgent;
    return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS|OPiOS/.test(ua);
}

// インストール済みかどうかを判定
function isPwaInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

// 設定モーダルを開くときにPWAインストールボタンの状態を更新
function showSettings() {
    const installSection = document.getElementById('pwa-install-section');
    const installBtn = document.getElementById('pwa-install-btn');
    const installedLabel = document.getElementById('pwa-installed-label');
    const unavailableLabel = document.getElementById('pwa-unavailable-label');

    // Android Chromeのみインストールセクションを表示
    if (isAndroidChrome()) {
        installSection.classList.remove('d-none');
        installBtn.classList.add('d-none');
        installedLabel.classList.add('d-none');
        unavailableLabel.classList.add('d-none');

        if (isPwaInstalled()) {
            installedLabel.classList.remove('d-none');
        } else if (deferredInstallPrompt) {
            installBtn.classList.remove('d-none');
        } else {
            unavailableLabel.classList.remove('d-none');
        }
    } else {
        installSection.classList.add('d-none');
    }

    // 効果音設定のラジオボタンを復元
    const soundValue = getSoundSetting();
    document.querySelector(`input[name="sound"][value="${soundValue}"]`).checked = true;

    // おじさん設定のラジオボタンを復元
    const ojisanValue = getOjisanSetting();
    document.querySelector(`input[name="ojisan"][value="${ojisanValue}"]`).checked = true;

    showModal('settingsModal');
}

// Android: インストールダイアログを表示
function triggerPwaInstall() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(() => {
        deferredInstallPrompt = null;
        document.getElementById('pwa-install-btn').classList.add('d-none');
        document.getElementById('pwa-unavailable-label').classList.add('d-none');
        document.getElementById('pwa-installed-label').classList.remove('d-none');
    });
}

// iOS: 手順モーダルを表示（将来のiOS対応用に残存）
function showIosInstallGuide() {
    bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
    showModal('iosInstallModal');
}

// --- 効果音設定 ---

const SOUND_KEY = 'soundEnabled';

function saveSoundSetting(value) {
    localStorage.setItem(SOUND_KEY, value);
}

function getSoundSetting() {
    return localStorage.getItem(SOUND_KEY) || 'on';
}

// --- おじさん表示設定 ---

const OJISAN_KEY = 'ojisanVisible';

// 設定を保存
function saveOjisanSetting(value) {
    localStorage.setItem(OJISAN_KEY, value);
}

// 設定値を取得（デフォルト: on）
function getOjisanSetting() {
    return localStorage.getItem(OJISAN_KEY) || 'on';
}

// カットイン演出
const cutinContainer = document.getElementById('cutin-container');
const cutinInner = document.getElementById('cutin-inner');
const cutin1 = document.getElementById('cutin1');
const cutin2 = document.getElementById('cutin2');

// 1フレーム待ってからスライドイン開始（CSSトランジションを確実に発火させる）
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        cutinInner.classList.add('centered');
    });
});

// cutin1.gif再生後にcutin2.pngへ切り替え、タップを有効化
setTimeout(() => {
    cutin1.style.display = 'none';
    cutin2.style.visibility = 'visible';
    cutinContainer.style.pointerEvents = 'auto';
    cutinContainer.style.cursor = 'pointer';
}, 1200);

// クリックでカットインを非表示
cutinContainer.addEventListener('click', () => {
    cutinContainer.style.display = 'none';
});
