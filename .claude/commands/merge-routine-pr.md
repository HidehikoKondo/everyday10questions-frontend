# ルーティンPRマージスキル

ルーティンが自動作成した予想問題更新のプルリクエストを確認し、mainブランチにマージする。

## 手順

### 1. マージ対象のPRを特定する

以下のBashコマンドで、`update/questions-` で始まるブランチからのオープンPRを一覧表示する。

```bash
gh pr list --base main --state open --json number,title,headRefName,createdAt \
  --jq '.[] | select(.headRefName | startswith("update/questions-")) | "\(.number)\t\(.headRefName)\t\(.title)"'
```

### 2. PRの内容を確認する

特定したPR番号で差分を確認する。

```bash
gh pr diff <PR番号>
```

### 3. PRをマージする

以下のコマンドでマージし、マージ後にブランチを削除する。

```bash
gh pr merge <PR番号> --merge --delete-branch
```

マージが成功したらPR URLとマージ結果を表示して完了とする。

## 注意事項

- `update/questions-` で始まるオープンPRが複数ある場合は、最も新しい日付のもの（ブランチ名の日付が最新）を対象とする
- 対象PRが存在しない場合はその旨を伝えてスキルを終了する
- マージは `--merge`（マージコミット作成）方式で行う
