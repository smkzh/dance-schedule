# TODO: 修正・改善リスト

後回しにしている修正・改善項目をまとめる。

---

## バグ・不整合

### CSV アップロードが振り付け者複数人に未対応
- **場所**: `app/api/upload/route.ts` 63行目 / `supabase/test-data/numbers.csv`
- **内容**: `choreographer` 列が1名しか入れられない形式になっている。`calculateCandidates.ts` は複数振り付け者に対応しているが、CSV 読み込みがそれに追いついていない。
- **対応方針**: CSV の `choreographer` 列を `・` 区切りの複数名対応にして、`split("・").includes(r.member_name)` で判定する。

---

## 未実装機能

### Step 13-2: 日付別ビュー（スケジュール係向け）
- **場所**: `app/schedule/page.tsx`（未作成）
- **内容**: 日付ごとに全ナンバーの練習可能な時間帯と欠席状況を表示するページ。`calculateCandidates` を再利用して実装する予定。
- **詳細**: `docs/implementation-plan.md` の Step 13-2 参照。
