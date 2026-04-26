# OGP画像生成スキル

`questions/itpassport/strategy_questions.json` の第1問を取得して `ogp.html` を更新し、Playwright でスクリーンショットを撮影して `images/ogp.png`（1200×630px）を生成する。

## 手順

### 1. strategy_questions.json の第1問を取得

`/workspaces/everyday10questions-frontend/questions/itpassport/strategy_questions.json` を読み込み、`questions[0]` の以下フィールドを取得する：

- `question`：問題文
- `text`：カテゴリ名（例：「企業活動」）

### 2. ogp.html を更新

`/workspaces/everyday10questions-frontend/ogp.html` 内の以下2箇所を取得した内容で上書きする：

- 問題文が書かれている `<div class="question-text">` の中身 → `question` の値に置き換え
- カテゴリタグの `<span class="category-tag">` の中身 → `text` の値に置き換え

問題文が長い場合は読みやすい位置で `<br>` を挿入して2行に折り返すこと。

### 3. Noto Sans CJKフォントの確認・インストール

```bash
fc-list | grep -i "Noto Sans CJK"
```

出力がなければインストールする：

```bash
sudo apt-get install -y fonts-noto-cjk
```

### 4. 一時ディレクトリにPlaywrightをセットアップ

```bash
mkdir -p /tmp/ogp-gen
cd /tmp/ogp-gen
npm init -y
npm install playwright
```

Playwrightのブラウザ（Chromium）が未インストールの場合はダウンロードする：

```bash
npx playwright install chromium
```

### 5. スクリーンショットスクリプトを作成・実行

`/tmp/ogp-gen/screenshot.js` を以下の内容で作成する：

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(
    'file:///workspaces/everyday10questions-frontend/ogp.html',
    { waitUntil: 'networkidle' }
  );
  await page.screenshot({
    path: '/workspaces/everyday10questions-frontend/images/ogp.png',
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });
  await browser.close();
  console.log('Done: images/ogp.png');
})();
```

実行：

```bash
cd /tmp/ogp-gen && node screenshot.js
```

### 6. 生成確認

```bash
ls -lh /workspaces/everyday10questions-frontend/images/ogp.png
```

1200×630px のPNGファイルが生成されていれば成功。

### 7. 後片付け

```bash
rm -rf /tmp/ogp-gen
```

## 注意事項

- `ogp.html` のデザインや問題文を変更した場合は、このスキルを再実行して `ogp.png` を更新すること
- フォントは `Noto Sans CJK JP` をシステムフォントとして使用する（Google Fontsへの外部アクセス不要）
- `ogp.html` のフォント指定は `'Noto Sans CJK JP', 'Noto Sans JP', ...` の順にすること
