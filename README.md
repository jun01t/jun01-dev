# 机上

jun01tの日記に繰り返し出てくる技術と、フルリモートの机に関係するガジェットだけを短くまとめるサイトです。

## 起動

```sh
npm install
npm run dev
```

## 記事を足す

`src/data/items.ts` の `items` に1件追加します。`date` は情報源の日付、`source.kind` は `primary`（公式）、`roundup`（まとめ）、`review`（実機メモ）、`own`（本人の記事）です。
