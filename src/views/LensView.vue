<script setup lang="ts">
import { categories } from '../data/items'
</script>

<template>
  <div class="shell">
    <p class="kicker"><span>視点</span><span>何を机に置くか</span></p>
    <h1 class="display">本番で触っているものと、毎日の机に残るもの。</h1>
    <p class="dek">
      公開されている日記から、選定の軸を固定しています。話題の広さより、次の仕事か次の机に接続できるかを見ています。
    </p>

    <div class="lens">
      <section>
        <h2>技術の軸</h2>
        <ul>
          <li>Ruby on Rails、Vue.js、Nuxt、TypeScript。APIから画面、公開まで一人で閉じる構成。</li>
          <li>Web Components を、PHP、Rails、WordPress、Nuxt の境目に置く。</li>
          <li>AWSは S3、CloudFront、Route 53、EC2、RDS。構成は Terraform。データベースは PostgreSQL。</li>
          <li>Cursor、Claude、Claude Code、Codex、ChatGPT、OpenAI、MCP。エージェントにまとまった仕事を渡す開発。</li>
          <li>AIでコードが速くなっても、コンピュータ、ネットワーク、データベース、セキュリティの基礎を横に置く。</li>
        </ul>
      </section>
      <section>
        <h2>机の軸</h2>
        <ul>
          <li>フルリモートで、ノートと外付け画面を毎日つなぐ。</li>
          <li>仕事用と個人用の端末を、同じキーボードとマウスで切り替える。</li>
          <li>長時間の入力、スクロール、画面の高さと光。</li>
        </ul>
      </section>
    </div>

    <div class="grid" style="margin-top: 1rem">
      <section v-for="category in categories" :key="category.id" class="note">
        <h2>{{ category.label }}</h2>
        <p>{{ category.blurb }}</p>
        <RouterLink :to="`/archive?category=${category.id}`">この分類を見る</RouterLink>
      </section>
    </div>

    <section class="note" style="margin-top: 1rem">
      <h2>毎朝の収集</h2>
      <p>
        公式のRSSとAtomを、キーワードだけで選んでいます。モデルAPIは呼んでいないので、収集そのものに料金はかかりません。新しい一致ができた朝だけファイルが更新され、接続した公開先が再デプロイされます。
      </p>
    </section>

    <section class="note" style="margin-top: 1rem">
      <h2>読み方</h2>
      <p>
        定点は、公式のリリースノートと公開記事を読み直して書いています。ガジェットの価格と給電ワットは変わるので、買う直前に販売ページを見てください。記事を足すときは
        <code>src/data/items.ts</code>
        に1件追加します。
      </p>
    </section>
  </div>
</template>
