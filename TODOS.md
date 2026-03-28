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

## SEO (追加分)

### サイトマップ index 分割（50K URL 超過時）

**Priority:** P3

**What:** `sitemap:tracks` が 40,000 件を超えた場合に sitemap index に自動分割

**Depends on:** トラック数の増加

---

### removeTrackFromSitemap（モデレーション対応）

**Priority:** P3

**What:** `zrem` でサイトマップから特定トラックを除外する関数追加

**Depends on:** モデレーション/DMCA テイクダウン機能の必要性

---

### orphan processing トラックの検出・修復

**Priority:** P3

**What:** 認証済みユーザーの processing のまま放置されたトラックを定期検出し、done/failed に遷移

**Depends on:** cron/background job インフラ

---

### トラックページのコンテンツ充実化

**Priority:** P2

**What:** SEO 価値を高めるため、トラックページに感情説明文、関連トラック、音楽パラメータ等を追加

**Why:** CEO レビュー: 現状は thin content（タイトル+コピー+プレイヤーのみ）で検索上位は困難

---

### 感情別ランディングページ

**Priority:** P3

**What:** `/emotion/[slug]` の静的 SEO ページ（calm, anxiety, hope 等 30 感情）

**Why:** コンテンツ SEO なしでは検索流入が見込めない

**Depends on:** SEO 流入の実績確認後に優先度判断

---

### ULID_REGEX の共有ユーティリティ化

**Priority:** P2

**What:** `app/api/og/route.tsx`・`app/api/status/[trackId]/route.ts`・`app/track/[id]/page.tsx` の3箇所に重複する `ULID_REGEX` を `lib/ulid.ts` 等に一元化する

**Why:** 正規表現の修正時に3箇所の変更が必要になる。コードレビューで Important として指摘（cadf8a0）

---

### `getSiteUrl()` ユーティリティ化

**Priority:** P2

**What:** `app/layout.tsx`・`app/robots.ts`・`app/sitemap.ts`・`app/track/[id]/page.tsx` の4箇所に重複する siteUrl 解決ロジックを `lib/site-url.ts` 等に一元化する

**Why:** フォールバック URL 変更時に4箇所の修正が必要になる。コードレビューで Important として指摘（cadf8a0）

---

### hreflang / alternate タグ追加

**Priority:** P2

**What:** 5ロケール（en, ja, ko, zh, zh-TW）に対応する hreflang タグと canonical URL を全ページに設定

**Why:** autoplan CEOレビュー + Engレビューで指摘。多言語対応しているがhreflangがないため、Googleが適切なロケール版を返せない。法的ページのインデックス化に伴い影響が拡大。

---

### ホームページ / `/create` の JSON-LD 構造化データ

**Priority:** P3

**What:** トップページに MusicApplication、`/create` に WebApplication の JSON-LD を追加

**Why:** autoplan レビューで指摘。`/track/[id]` には AudioObject JSON-LD があるが、主要ページにはない。

---

## Completed

<!-- Items completed in PRs are moved here -->

### My Tracksページのデザインポリッシュ

**Completed:** v0.2.8.0 (2026-03-28)

Staggered fade-blur entry animation、emotion badge pill、相対時間表示、アニメーション付きEmpty state (S-waveアイコン)、loading skeleton、teal CTA、i18n (5言語)。Server/Client分離維持、既存パターン完全踏襲。

### 動的サイトマップ（トラックページ含む）

**Completed:** v0.2.4.0 (2026-03-24)

Redis sorted set `sitemap:tracks` で userId 付き + status=done のトラックをインデックス。`updateTrack(done)` と `saveTrackToLibrary(done)` にフック。`app/sitemap.ts` を ISR 動的生成に変更。backfill スクリプト付き。TTL 問題は userId フィルタで回避。

### EmotionShowcase テーマカラー単一ソース化

**Completed:** v0.1.6.0 (2026-03-23)

`handleClick` のdeselect時に `setProperty('--emotion-hue', '#00F5D4')` していたハードコードを削除。`removeProperty` を使いCSS `:root` の `--emotion-hue: #00F5D4` に委譲するよう変更。unmount cleanup と同パターンに統一。テストも対応更新。

### サインインメールのデザインポリッシュ

**Completed:** v0.2.4.0 (2026-03-24)

Resendデフォルトテンプレートを Chromatic Emotion ブランドのカスタム React Email テンプレートに置換。ダーク背景 `#0A0A0F`、teal CTA `#00F5D4`、DM Sans フォント。`sendVerificationRequest` をカスタム実装に切り替え。

### 連絡先メールアドレスを環境変数化

**Completed:** v0.1.5.0 (2026-03-23)

`CONTACT_EMAIL` 環境変数（デフォルト: `contact@soultrack.io`）で設定可能。`messages/legal-*.json` は `{contactEmail}` プレースホルダーを使用し、各ページでサーバーサイドでインジェクト。
