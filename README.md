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

`npm run update` が、Cursor、Claude Code、Claude Platform、Codex、OpenAI News、OpenAI Node SDK、Rails、Nuxt、Vue、React、Next.js、TypeScript、Vite、Terraform、AWS、Publickey、PC Watch の公開フィードを読みます。OpenAI News は ChatGPT、GPT、Codex、Sora に触れている記事だけ残します。Codex の更新一覧は、Codex や ChatGPT のように机のキーワードへ触れている項目だけ残します。モデルAPIは使わないので、収集に料金はかかりません。中身が同じ日はファイルを書き換えません。

GitHub Actions が毎日 8:00 JST に同じ処理を実行します。変化があったときだけコミットして push するので、このリポジトリにつながった Cloudflare Pages、Vercel、Netlify は、その push で再ビルドされます。GitHub Pages を「GitHub Actions」から配信する設定にしていれば、同じワークフローが Pages にも載せて更新します。

スケジュールは、このワークフローがデフォルトブランチにあるときだけ動きます。

## 定点の記事を足す

`src/data/items.ts` の `items` に1件追加します。`date` は情報源の日付、`source.kind` は `primary`（公式）、`roundup`（まとめ）、`review`（実機メモ）、`own`（本人の記事）です。


## 関心と重要ニュース

トップページの TOP 3 は、公開日が東京時間で直近7日（本日を含む過去6日前まで）の収集記事が対象です。関心を選ぶとその技術に一致する記事に絞られます。未選択は全件表示です。スコアの重みは `src/lib/discovery.mjs` の `WEIGHTS` にあり、一次情報、新鮮さ、明示的なセキュリティ修正・互換性変更・リリースの見出し、関心一致を加点します。これは優先して読むための目安で、脆弱性の深刻度判定ではありません。抽出理由を表示し、RSSにない要約は生成しません。

関心は `jun01-desk-interests-v1`、ブックマークは既存の `jun01-desk-saved` に保存します。保存領域が使えない場合はメモリ上で動作し、その旨を表示します。検索は日本語変換確定後250msで適用され、分類・収集・保存フィルターを併用できます。OSのダークモード設定にも追従します。

## 検証とSEO

```sh
npm ci
npm test
npm run build
```

新規依存関係はありません。Nodeの組み込みテストでランキング、フィルター、保存失敗、フィード変換、収集CLIの部分障害・全障害を検証します。PR用の Verify desk ワークフローはテストと型チェックを含むビルドのみを行い、デプロイしません。

GitHub Pagesのサブパスでビルドする例：

```sh
PAGES_BASE=/jun01-dev/ SITE_URL=https://jun01t.github.io/jun01-dev/ npm run build
```

`SITE_URL` は実際の公開URL（サブパス込み）に合わせてください。本番ワークフローはGitHub Pagesの設定から公開URLを読み取ります。他のホストではその環境変数を指定します。指定時はcanonicalとsitemap.xmlを生成し、robots.txtから参照します。未指定のローカルビルドでは公開URLを推測せず、静的canonicalとサイトマップは生成しません。

記事ごとのHTMLにはタイトル、概要、OGP、本文の抜粋を埋め込むため、JavaScriptを実行しないクローラーでも読めます。既存Vueルーターと記事スラッグは維持しています。404用HTMLはnoindexです。OG画像の新規作成は含みません。

## 収集の障害時

一部フィードが失敗しても継続し、前回の記事は既存の21日・最大36件・1ソース4件の範囲で保持します。1フィードからは最大8件を取得します。追跡用クエリとフラグメントを除いて重複判定し、既存記事と一致した場合はスラッグと初回収集日時を引き継ぎます。過去データにない初回収集日時は推測で補完しません。新規収集時から記録します。

全フィードの取得に失敗した場合、または既存ファイルが破損している場合は失敗終了し、既存ファイルを上書きしません。出力は一時ファイルからの置換です。Actionsのサマリーにフィード成功数とエラーを記録します。失敗通知の配信先はGitHubの本人のActions通知設定に従います（メールや外部サービスの通知設定は変更していません）。

ブラウザでの確認項目：PC/モバイル、関心の保存と再読み込み、検索中の戻る・進む、日本語変換中の入力、保存フィルター併用、保存禁止環境、ダークモード、記事URLへの直接アクセス。
