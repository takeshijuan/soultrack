# TODOs

## LP / EmotionShowcase

### LP 音声プレビュー機能

**Priority:** P2

**What:** `EmotionShowcase` の感情チップクリック時に、その感情に対応した数秒の音楽サンプルを再生する

**Why:** 背景色変化だけでなく「実際にこんな音楽が生まれる」が体験として伝わることで、LP → /create へのコンバージョン率向上が期待できる

**Pros:**
- 「これが何か」を説明なしに伝えられる最強の手段
- LPでの滞在時間と試用意欲の向上

**Cons:**
- 30感情分のサンプルクリップの生成・保存が必要（Vercel Blob）
- 音楽の品質が MusicGen の限界に縛られる
- クリップのコスト管理（1回生成したものを静的ファイルとして提供すれば追加コストなし）

**Context:** SNS公開後にユーザーが LP でどう行動するかを見てから判断する。チップをクリックした後に何人が /create に進むかが指標。

**Depends on:** SNS公開 → ユーザー行動の観察 → コンバージョン率が低い場合に優先実装

---


## Completed

<!-- Items completed in PRs are moved here -->

### EmotionShowcase テーマカラー単一ソース化

**Completed:** v0.1.6.0 (2026-03-23)

`handleClick` のdeselect時に `setProperty('--emotion-hue', '#00F5D4')` していたハードコードを削除。`removeProperty` を使いCSS `:root` の `--emotion-hue: #00F5D4` に委譲するよう変更。unmount cleanup と同パターンに統一。テストも対応更新。

### 連絡先メールアドレスを環境変数化

**Completed:** v0.1.5.0 (2026-03-23)

`CONTACT_EMAIL` 環境変数（デフォルト: `contact@soultrack.io`）で設定可能。`messages/legal-*.json` は `{contactEmail}` プレースホルダーを使用し、各ページでサーバーサイドでインジェクト。
