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

### EmotionShowcase テーマカラー単一ソース化

**Priority:** P4

**What:** `EmotionShowcase.tsx:14` の reset 値 `'#00F5D4'` を `globals.css` の `:root` と共有する

**Why:** 現在 teal カラーが `globals.css` と `EmotionShowcase.tsx` の2箇所に重複。テーマ変更時の二重管理リスク。

**Pros:** テーマカラーの単一ソース化（DRY）

**Cons:** JS から CSS 変数値を読む処理が必要（`getComputedStyle` か定数ファイルへの抽出）

**Context:** 現状は両方 `#00F5D4` で整合しているため実害なし。将来テーマ変更時に踏むバグの予防的修正。

**Depends on:** なし

---

## Completed

<!-- Items completed in PRs are moved here -->
