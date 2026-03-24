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

## Waitlist / ウェイトリスト

### ウェイトリストAPIのレートリミット

**Priority:** P3

**What:** `/api/waitlist` にIP単位のレートリミットを追加（`getRateLimitCount` パターンを再利用）

**Why:** 現在は公開エンドポイントでレートリミットなし。スパムメールでKVが汚染されるリスク。
`kv.sadd` の集合deduplicationで最悪ケースは限定的だが、将来的に修正が必要。

**Depends on:** SNS公開後にスパムが問題になった場合に優先実装

---

### ウェイトリスト件数確認スクリプト

**Priority:** P3

**What:** `bun run waitlist:count`（または `tsx scripts/waitlist-count.ts`）で `kv.scard('waitlist:emails')` を叩き、登録件数をターミナルに表示するスクリプト

**Why:** X ポスト後に「何人登録したか」をすぐ確認したい。Vercel KV ダッシュボードでも見られるが、CLI の方が速い

**Pros:**
- 実装 5 分（CC で 1 分）
- KV 抽象レイヤーを使えば既存パターンに合致

**Cons:**
- `getWaitlistCount()` を `lib/kv.ts` に追加する必要がある

**Depends on:** この PR マージ後、SNS 公開後すぐに欲しくなる可能性大

---

## Completed

<!-- Items completed in PRs are moved here -->

### EmotionShowcase テーマカラー単一ソース化

**Completed:** v0.1.6.0 (2026-03-23)

`handleClick` のdeselect時に `setProperty('--emotion-hue', '#00F5D4')` していたハードコードを削除。`removeProperty` を使いCSS `:root` の `--emotion-hue: #00F5D4` に委譲するよう変更。unmount cleanup と同パターンに統一。テストも対応更新。

### 連絡先メールアドレスを環境変数化

**Completed:** v0.1.5.0 (2026-03-23)

`CONTACT_EMAIL` 環境変数（デフォルト: `contact@soultrack.io`）で設定可能。`messages/legal-*.json` は `{contactEmail}` プレースホルダーを使用し、各ページでサーバーサイドでインジェクト。
