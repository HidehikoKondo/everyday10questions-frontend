// Service Worker登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/everyday10questions-frontend/sw.js')
            .catch(err => console.error('Service Worker登録失敗:', err));
    });
}

const BASE_URL = "https://mainichi10.page/questions/";
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let incorrectGenres = [];

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
        incorrectGenres = [];
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
        // 間違えたジャンルを記録
        if (question.text) incorrectGenres.push(question.text);
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

    // 苦手ジャンルの表示
    const weakGenresEl = document.getElementById('weak-genres');
    const uniqueGenres = [...new Set(incorrectGenres)];
    if (uniqueGenres.length > 0) {
        const badgeHtml = uniqueGenres.map(g => `<span class="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle me-1 mb-1">${g}</span>`).join('');
        weakGenresEl.innerHTML = `
            <div class="alert alert-warning text-start mt-4 mb-0">
                <p class="fw-bold mb-2"><i class="bi bi-exclamation-triangle-fill me-1"></i>ここを克服しよう！</p>
                <div class="mb-2">${badgeHtml}</div>
                <p class="small mb-0 text-muted">これらのジャンルを中心に復習して、次回はパーフェクトを目指しましょう！</p>
            </div>
            <div class="mt-3">
                <p class="fw-bold mb-2"><i class="bi bi-book-fill me-1"></i>学習サービスや参考書で確実に合格を目指そう</p>

<center>
<!-- A8 -->
<table cellpadding="0" cellspacing="0" border="0" style=" border:1px solid #ccc; width:300px;"><tbody><tr style="border-style:none;"><td style="vertical-align:top; border-style:none; padding:10px; width:44px;"><a href="https://rpx.a8.net/svt/ejp?a8mat=4B1RXO+6D7XGA+2HOM+BWGDT&rakuten=y&a8ejpredirect=https%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2Fg00q0724.2bo11c45.g00q0724.2bo12179%2Fa26042305131_4B1RXO_6D7XGA_2HOM_BWGDT%3Fpc%3Dhttps%253A%252F%252Fitem.rakuten.co.jp%252Fbook%252F18471651%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252Fbook%252Fi%252F21820227%252F%26rafcid%3Dwsc_i_is_33f72da33714639c415e592c9633ecd7" rel="nofollow"><img style="max-width: initial;" border="0" alt="" src="https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/2235/2100014752235.jpg?_ex=64x64"></a></td><td style="font-size:12px; vertical-align:middle; border-style:none; padding:10px;"><p style="padding:0; margin:0;"><a href="https://rpx.a8.net/svt/ejp?a8mat=4B1RXO+6D7XGA+2HOM+BWGDT&rakuten=y&a8ejpredirect=https%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2Fg00q0724.2bo11c45.g00q0724.2bo12179%2Fa26042305131_4B1RXO_6D7XGA_2HOM_BWGDT%3Fpc%3Dhttps%253A%252F%252Fitem.rakuten.co.jp%252Fbook%252F18471651%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252Fbook%252Fi%252F21820227%252F%26rafcid%3Dwsc_i_is_33f72da33714639c415e592c9633ecd7" rel="nofollow">【令和8年度】 いちばんやさしい「ITパスポート」「基本情報技術者」 絶対合格の教科書＋出る順問題集 全2冊 セット [ 高橋 京介 ]</a></p><p style="color:#666; margin-top:5px; line-height:1.5;">価格:<span style="font-size:14px; color:#C00; font-weight:bold;">3811円</span><br><span style="font-size:10px; font-weight:normal;">(2026/4/26 15:13時点)</span><br><span style="font-weight:bold;">感想(0件)</span></p></td></tr></tbody></table>
<img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=4B1RXO+6D7XGA+2HOM+BWGDT" alt="">
</center>

            </div>`;
        weakGenresEl.classList.remove('d-none');
    } else {
        weakGenresEl.classList.add('d-none');
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
    showCutin();
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

// --- 設定 ---

// 設定モーダルを開く
function showSettings() {
    // 効果音設定のラジオボタンを復元
    const soundValue = getSoundSetting();
    document.querySelector(`input[name="sound"][value="${soundValue}"]`).checked = true;

    // おじさん設定のラジオボタンを復元
    const ojisanValue = getOjisanSetting();
    document.querySelector(`input[name="ojisan"][value="${ojisanValue}"]`).checked = true;

    showModal('settingsModal');
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

function showCutin() {
    if (getOjisanSetting() !== 'on') return;

    // 状態をリセット
    cutinInner.classList.remove('centered');
    cutin1.style.display = '';
    cutin2.style.visibility = 'hidden';
    cutinContainer.style.pointerEvents = 'none';
    cutinContainer.style.cursor = 'default';
    cutinContainer.style.display = 'flex';

    // 1フレーム待ってからスライドイン開始
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
}

// クリックでカットインを非表示
cutinContainer.addEventListener('click', () => {
    cutinContainer.style.display = 'none';
});
