# 机上

jun01tの日記に繰り返し出てくる技術と、フルリモートの机に関係するガジェットだけを短くまとめるサイトです。

定点の文章は `src/data/items.ts` にあります。毎朝の収集は公開フィードの抜粋で、`public/digest.json` に置きます。

## 起動

```sh
npm install
npm run update
npm run dev
```

## 毎日の更新

`npm run update` が、Cursor、Rails、Nuxt、Vue、Terraform、AWS、Publickey、PC Watch の公開フィードを読み、キーワードが一致したものだけを残します。モデルAPIは使わないので、収集に料金はかかりません。中身が同じ日はファイルを書き換えません。

GitHub Actions が毎日 8:00 JST に同じ処理を実行します。変化があったときだけコミットして push するので、このリポジトリにつながった Cloudflare Pages、Vercel、Netlify は、その push で再ビルドされます。GitHub Pages を「GitHub Actions」から配信する設定にしていれば、同じワークフローが Pages にも載せて更新します。

スケジュールは、このワークフローがデフォルトブランチにあるときだけ動きます。

## 定点の記事を足す

`src/data/items.ts` の `items` に1件追加します。`date` は情報源の日付、`source.kind` は `primary`（公式）、`roundup`（まとめ）、`review`（実機メモ）、`own`（本人の記事）です。
