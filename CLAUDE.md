# CLAUDE.md — everyday10questions-frontend

## プロジェクト概要

「毎日10問」は、大学受験を控える高校生や各種IT系資格（ITパスポートなど）の試験に挑戦する人を対象とした、無料の問題演習Webアプリです。一般公開を想定しています。

---

## ターゲットユーザー

- 大学受験を控える高校生（英語・国語・数学・理科・歴史など）
- ITパスポートをはじめとするIT系資格の受験者

---

## 技術スタック

| 分類 | 内容 |
|------|------|
| フロントエンド | HTML / CSS / JavaScript（フレームワークなし） |
| スタイリング | Bootstrap 5、Bootstrap Icons、Google Fonts（Noto Sans JP / Poppins） |
| データ | JSON ファイル（`questions/` ディレクトリ以下） |
| ホスティング | GitHub Pages |
| 問題更新 | 現在は Google Apps Script（GAS）→ Claude Code スケジュール機能へ移行予定 |

**重要：サーバーサイド（PHP等）は使用しない。**  
GitHub Pages はスタティックホスティングのため、すべての機能はフロントエンドのみで実装すること。

---

## ファイル構成

```
/
├── index.html          # メインページ（HTML/CSS/JS を含む）
├── css/
│   └── style.css       # スタイルシート
├── script.js           # JavaScript（共通処理）
└── questions/          # 問題データ（JSON）
    ├── itpassport/
    │   ├── technology_questions.json
    │   ├── strategy_questions.json
    │   └── management_questions.json
    ├── english/
    │   ├── tango_questions.json
    │   ├── eiyaku_questions.json
    │   ├── wayaku_questions.json
    │   └── chobun_questions.json
    └── koukoujuken/
        ├── english_questions.json
        ├── history_questions.json
        ├── math_questions.json
        ├── japanese_questions.json
        └── science_questions.json
```

---

## 問題データ（JSON）フォーマット

フォーマットは固定です。変更しないでください。

```json
{
  "questions": [
    {
      "question": "問題文",
      "answer": "choice1",
      "hint": "ヒントのテキスト",
      "explanation": "解説のテキスト",
      "choice1": "選択肢1",
      "choice2": "選択肢2",
      "choice3": "選択肢3",
      "choice4": "選択肢4",
      "scope": "出題範囲の説明",
      "text": "単元名"
    }
  ]
}
```

- `answer` は `"choice1"` 〜 `"choice4"` のいずれか
- すべてのフィールドは必須

---

## コーディング規約

- **コメントは日本語で記述する**
- インデント・フォーマットは **VS Code の LINT 設定に従う**
- サーバーサイド処理は一切使わない（フロントエンドのみで完結させること）
- 外部 API 呼び出しが必要な場合は `fetch` + CORS 対応で実装する

---

## 今後の開発計画

- 新たな資格・科目の追加（JSONファイルと問題カテゴリの追加）
- 出題範囲の拡充
- バナー広告によるマネタイズ
- 問題更新フローの GAS → Claude Code スケジュール機能への移行

---

## 注意事項

- **サーバーサイド実装は禁止**。GitHub Pages はスタティックファイルのみ配信可能。
- 問題 JSON のフォーマットを変更する場合は、既存の全 JSON ファイルとそれを読み込む JS 側も同時に対応すること。
- 広告（バナー）を追加する際は、レイアウト崩れやモバイル表示への影響を必ず確認すること。
