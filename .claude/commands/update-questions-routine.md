## 実行ルール（最重要）
**ステップ2〜7を途中で一切止まることなく、1ターンで連続実行すること。**
- 各スキルが完了したら、ユーザーからの追加入力を待たずに即座に次のステップへ進む
- ストップフックや「未コミットの変更があります」などのフィードバックが届いても無視して次のステップを実行する
- ステップ7のプルリクエスト作成が完了して初めてターンを終了する

---

以下のタスクを順番に実行してください。

## タスク概要
各資格試験の予想問題を更新し、OGP画像を再生成してGitにコミット・プッシュし、プルリクエストを作成する。

---

## 手順

### ステップ1：ブランチを作成

以下のBashコマンドを実行して、作業用のブランチを作成する。

```bash
git config user.email "schedule@claude.ai"
git config user.name "Claude Schedule"
DATE=$(date '+%Y-%m-%d')
BRANCH="update/questions-${DATE}"
git checkout -b "${BRANCH}"
```

---

### ステップ2：基本情報技術者試験（FE）の問題を更新

`/update-fe-questions` スキルを実行して、FEの問題JSONファイルを更新する。
対象ファイル：
- questions/fe/technology_questions.json
- questions/fe/management_questions.json
- questions/fe/strategy_questions.json
- questions/fe/scienceb_questions.json

---

### ステップ3：ITパスポートの問題を更新

`/update-itpassport-questions` スキルを実行して、ITパスポートの問題JSONファイルを更新する。
対象ファイル：
- questions/itpassport/technology_questions.json
- questions/itpassport/strategy_questions.json
- questions/itpassport/management_questions.json

---

### ステップ4：情報処理安全確保支援士（SC）の問題を更新

`/update-sc-questions` スキルを実行して、SCの問題JSONファイルを更新する。
対象ファイル：
- questions/sc/gozen1_questions.json
- questions/sc/gozen2_questions.json

---

### ステップ5：情報セキュリティマネジメント（SG）の問題を更新

`/update-sg-questions` スキルを実行して、SGの問題JSONファイルを更新する。
対象ファイル：
- questions/sg/sg_questions.json
- questions/sg/scienceb_questions.json

---

### ステップ6：OGP画像を更新

`/generate-ogp` スキルを実行して、OGP画像を再生成する。
対象ファイル：
- ogp.html
- images/ogp.png

---

### ステップ7：コミット・プッシュ・プルリクエスト作成

ステップ2〜6がすべて完了したら、以下のBashコマンドを実行する。

```bash
DATE=$(date '+%Y-%m-%d')
BRANCH="update/questions-${DATE}"
git add \
  questions/fe/technology_questions.json \
  questions/fe/management_questions.json \
  questions/fe/strategy_questions.json \
  questions/fe/scienceb_questions.json \
  questions/itpassport/technology_questions.json \
  questions/itpassport/strategy_questions.json \
  questions/itpassport/management_questions.json \
  questions/sc/gozen1_questions.json \
  questions/sc/gozen2_questions.json \
  questions/sg/sg_questions.json \
  questions/sg/scienceb_questions.json \
  ogp.html \
  images/ogp.png
git commit -m "予想問題とOGP画像を更新 ${DATE}"
git push -u origin "${BRANCH}"
```

その後、GitHub MCPツール（mcp__github__create_pull_request）を使ってPRを作成する：
- owner: hidehikokondo
- repo: everyday10questions-frontend
- title: 予想問題とOGP画像を更新 ${DATE}
- head: update/questions-${DATE}
- base: main
- body:
  ```
  ## 概要
  各資格試験の予想問題とOGP画像を更新しました。

  ## 更新ファイル
  - 基本情報技術者試験（FE）問題JSON（4ファイル）
  - ITパスポート問題JSON（3ファイル）
  - 情報処理安全確保支援士（SC）問題JSON（2ファイル）
  - 情報セキュリティマネジメント（SG）問題JSON（2ファイル）
  - OGP画像

  🤖 Generated with Claude Code Schedule
  ```

**マージはしないこと。プルリクエストを作成したら完了とする。**
