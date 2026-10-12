# 本棚メモ — React + TypeScript 練習プロジェクト

読んだ本・読みたい本を記録するアプリを **自分で一から** 作ります。
見た目は `src/styles.css` に用意済みなので、クラス名を付けるだけで整います。ロジックに集中してください。

```bash
npm install
npm run dev
```

## 作るもの（仕様）

### 本のデータ
| 項目 | 内容 |
| --- | --- |
| ID | 一意な値 |
| タイトル | 必須 |
| 著者 | 任意 |
| ステータス | 未読 / 読書中 / 読了 のどれか |
| 評価 | 0〜5（0 は未評価） |

型の設計（`type` / `interface`、ユニオン型など）から自分で考えてください。

### 機能（上から順に作るのがおすすめ）
1. **一覧表示** — 本のリストを表示する。0件なら空表示
2. **追加** — タイトル・著者を入力して追加。タイトルが空なら追加できない。追加後は入力をクリア
3. **削除** — 各本を削除できる
4. **ステータス切替** — 未読 → 読書中 → 読了 → 未読 と切り替わる
5. **評価** — 星1〜5をクリックで設定。同じ星をもう一度押すと0に戻る
6. **絞り込み** — すべて / 未読 / 読書中 / 読了 のタブで表示を切り替え
7. **統計** — 登録数・読書中・読了の件数を表示
8. **保存** — リロードしても消えないよう localStorage に保存する

### 発展課題（余裕があれば）
- 本の編集（タイトル・著者をその場で編集）
- 並び替え（追加順 / 評価順 / タイトル順）
- タイトル検索
- 状態管理を `useReducer` に置き換える
- localStorage 部分をカスタムフック化する
- 書誌情報を外部 API（例：Google Books API）から取得する

### 学べること
`useState` / props / リスト描画と `key` / 制御コンポーネント / イミュータブルな更新 / 導出値 / `useEffect` / 型付け（props・イベント・ユニオン型）/ コンポーネント分割

## クラス一覧

マークアップに付けるだけでスタイルが当たります。欲しい見た目がなければ Claude に頼んでください。

| 用途 | クラス |
| --- | --- |
| 全体レイアウト | `app` `app-header` `app-title` `app-subtitle` `app-main` |
| 汎用 | `card` `row` `stack` `spacer` `text-muted` |
| フォーム | `form` `field` `field-label` `field-error` `input` `select` `textarea` / エラー時 `is-invalid` |
| ボタン | `btn` + `btn-primary` `btn-secondary` `btn-ghost` `btn-danger`、小さく `btn-sm` |
| タブ | `tabs` > `tab`、選択中 `is-active` |
| 統計 | `stats` > `stat` > `stat-label` `stat-value`（`dl` / `dt` / `dd` 想定） |
| リスト | `list` > `list-item`（読了時 `is-done`）> `item-body` > `item-title` `item-meta`、操作 `item-actions` |
| 空表示 | `empty` |
| バッジ | `badge` + `badge-unread` `badge-reading` `badge-done` |
| 星評価 | `stars` > `star`、塗り `is-filled` |
| メッセージ | `notice`、エラー `notice-error` |

### マークアップ例（構造のみ）
```html
<ul class="list">
  <li class="list-item">
    <div class="item-body">
      <p class="item-title">タイトル</p>
      <p class="item-meta">著者</p>
    </div>
    <div class="item-actions">
      <button class="badge badge-reading">読書中</button>
      <button class="btn btn-danger">削除</button>
    </div>
  </li>
</ul>
```
