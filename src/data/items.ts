export type CategoryId = 'web' | 'ai' | 'cloud' | 'gadget'
export type SourceKind = 'primary' | 'roundup' | 'own' | 'review'

export interface Source {
  name: string
  url: string
  kind: SourceKind
}

export interface Item {
  slug: string
  title: string
  category: CategoryId
  date: string
  summary: string
  why: string
  points: string[]
  tags: string[]
  source: Source
  lead?: boolean
  side?: boolean
  auto?: boolean
}

export const issue = {
  title: '机上',
  kicker: 'jun01tの机に置く、ウェブ技術とガジェット',
}

export const categories: { id: CategoryId; label: string; blurb: string }[] = [
  { id: 'web', label: 'ウェブ', blurb: 'Nuxt、Rails、境目のUI' },
  { id: 'ai', label: 'AI開発', blurb: 'Cursor、Claude、ChatGPT、OpenAI' },
  { id: 'cloud', label: 'クラウド', blurb: '実行場所を自分の側に置く' },
  { id: 'gadget', label: 'ガジェット', blurb: 'フルリモートの机' },
]

export const sourceKindLabel: Record<SourceKind, string> = {
  primary: '一次情報',
  roundup: 'まとめ記事',
  own: '本人の記事',
  review: '実機メモ',
}

export const items: Item[] = [
  {
    slug: 'nuxt-3-eol',
    title: 'Nuxt 3のサポートは2026年7月31日で終わっている',
    category: 'web',
    date: '2026-07-31',
    lead: true,
    summary:
      'Nuxt 3は2026年7月31日にサポート終了となり、バグ修正もセキュリティパッチも届かない。いまの安定版はNuxt 4で、npmのlatestもv4。Nuxt 5はNitro v3を含む予定で、公開ロードマップでは2026年Q4が見込み。',
    why: '日記でも実務でもNuxt 3が中心にある。新規も、すでに出しているサイトも、更新が止まったラインに置いたままにする期間は短いほどよい。公式はv3からv4の移行は比較的素直だった、と受け止めを書いている。',
    points: [
      '4.xの初回リリースは2025年7月16日。ドキュメントの現行はv4。',
      '5.xのEOLは、5が出てから6ヶ月後という案内。',
      '3系に残す場合でも、セキュリティパッチの3.21.10までは上げておく対象になる。',
    ],
    tags: ['Nuxt', '移行'],
    source: {
      name: 'Nuxt Roadmap',
      url: 'https://nuxt.com/docs/4.x/community/roadmap/',
      kind: 'primary',
    },
  },
  {
    slug: 'nuxt-4-5',
    title: 'Nuxt 4.5はビルドと初期表示をまとめて更新した',
    category: 'web',
    date: '2026-07-18',
    summary:
      '2026年7月18日のNuxt 4.5は、Vite 8、Rspack 2（内部はRsbuild）、実験的なSSRストリーミング、安定したエラーコード、useLayout、named viewsを含む。Nuxt 5へ寄せる土台が大きいリリース。',
    why: 'マーケティングサイトとアプリの両方をNuxtで出している。初期表示の速さと、開発サーバの立ち上がりは、PHPやRailsへ埋め込む前の確認時間にそのまま効く。',
    points: [
      'experimental.ssrStreamingは既定でオフ。描画開始後にステータスやCookieを変えるルートは、バッファ描画へ戻る。',
      'useFetchとuseAsyncDataに、リアクティブなenabledが付いた。条件が揃うまでリクエストを出さない。',
      'builder: \'rspack\' の書き方はそのまま。中身はRsbuild。',
      '上げ方の案内は npx nuxt upgrade --dedupe。',
    ],
    tags: ['Nuxt', 'Vite', 'SSR'],
    source: {
      name: 'Nuxt 4.5',
      url: 'https://nuxt.com/blog/v4-5',
      kind: 'primary',
    },
  },
  {
    slug: 'nuxt-security-patch',
    title: 'Nuxt 4.5.1と3.21.10はセキュリティ修正',
    category: 'web',
    date: '2026-07-27',
    summary:
      '2026年7月27日、Nuxt 4.5.1と3.21.10、そして@nuxt/devtools 3.3.1が公開された。公式はいくつかのセキュリティ問題の修正として、早めの更新を勧めている。devtoolsの修正はcriticalと案内されている。',
    why: '4へ移す作業の途中でも、本番に残っている3系と、ローカルのdevtoolsは先にパッチできる。移行チケットとセキュリティ更新を同じ日に閉じなくてよい。',
    points: [
      '4系の行き先は4.5.1。',
      '3系の行き先は3.21.10。Vite 8などの大きな更新は4系のみ。',
      'devtoolsを使っている開発環境も3.3.1へ。',
    ],
    tags: ['Nuxt', 'セキュリティ'],
    source: {
      name: 'Nuxt Blog',
      url: 'https://nuxt.com/blog',
      kind: 'primary',
    },
  },
  {
    slug: 'rails-8-1-4',
    title: 'Rails 8.1.4が9月24日に出た',
    category: 'web',
    date: '2026-09-24',
    side: true,
    summary:
      '2026年9月24日、Rails 8.1.4がリリースされた。8.1.3からのメンテナンスリリースで、公式発表は各コンポーネントのCHANGELOGをGitHubで確認する形になっている。',
    why: 'API、Sidekiqのジョブ、管理画面の土台がRailsにある。機能の話ではなく、本番の8.1系をパッチまで追う話。',
    points: [
      '発表はrafaelfranca。Action PackからActive Record、RailtiesまでgemごとのCHANGELOGがある。',
      'GitClear上の直前バージョンは8.1.3.1（2026年7月29日）。',
      'gemの同一性は公式ページのSHA-256で確認できる。',
    ],
    tags: ['Rails', 'パッチ'],
    source: {
      name: 'Ruby on Rails',
      url: 'https://rubyonrails.org/2026/9/24/Rails-Version-8-1-4-has-been-released',
      kind: 'primary',
    },
  },
  {
    slug: 'cursor-rollouts-security',
    title: 'CursorにRolloutsとSecurity Reviewが付いた',
    category: 'ai',
    date: '2026-09-23',
    summary:
      '2026年9月23日、TeamsとEnterprise向けに二つのボットが公開された。Rolloutsはプルリクエストの変更がデプロイされたあと、環境ごとに健全かどうかを見る。Security Reviewは、悪用できる不具合をプルリクエストごとに一つのコメントで返す。見た目や品質の指摘はBugbotの担当のまま。',
    why: 'CursorでアプリケーションとTerraformを書いている。デプロイ後の確認と、SQL・認可・秘密情報の見落としは、RailsとNuxtを一人で見ているときの穴になりやすい。',
    points: [
      'Rolloutsは差分から監視プランをプルリクエストに書き、ログ、メトリクス、トレースで判定する。自動マージや自動ロールバックはしない。',
      '回帰を見つけると作者へ通知する。設定によってはrevertのプルリクエストを開くか、クラウドエージェントへ渡す。',
      '接続先はOriginまたはGitHub、継続的デリバリー、Datadogなどのテレメトリ。',
      'Security Reviewは下書きをスキップする。指摘には重大度、攻撃経路、修正案が付く。',
      '発表時点では、試用クレジットがTeamsで約50変更、Enterpriseで約500変更分、10日間付く案内がある。',
    ],
    tags: ['Cursor', 'レビュー', 'デプロイ'],
    source: {
      name: 'Cursor Changelog',
      url: 'https://cursor.com/changelog',
      kind: 'primary',
    },
  },
  {
    slug: 'cursor-projects',
    title: 'Cursor Projectsは長い仕事をコーディネーターに預ける',
    category: 'ai',
    date: '2026-09-10',
    summary:
      '2026年9月10日に出たProjectsは、機能追加や移行のようなまとまった仕事を扱う。コーディネーターが計画し、実装するエージェントへ渡し、結果を戻す。プロジェクトはクラウドのマシンで動き、調べたことや作業の好みが共有コンテキストとして残る。ベータで、全ユーザーへの展開が始まっている。',
    why: 'Nuxt 4への移行や、RDSバックアップのような複数ファイルにまたがる仕事は、チャットを毎回ゼロから説明するより、一つのプロジェクトに置いたほうが続きやすい。',
    points: [
      'コーディネーター自身はコードを書かない。',
      'Slackのチャンネル、スケジュール、プルリクエストを購読できる。',
      'ラップトップを閉じてもクラウド側は続く。手元での確認が必要なときだけローカルエージェントが動く。',
    ],
    tags: ['Cursor', 'エージェント'],
    source: {
      name: 'Cursor Changelog',
      url: 'https://cursor.com/changelog',
      kind: 'primary',
    },
  },
  {
    slug: 'cursor-self-hosted',
    title: 'Cursorのツール実行を自分のネットワークに置ける',
    category: 'cloud',
    date: '2026-09-02',
    summary:
      '2026年9月2日の更新で、セルフホストのマシンが使えるようになった。コード、ビルド成果物、秘密情報は内部のマシンに残り、エージェントのツール呼び出しはそこで処理される。クラウドエージェントは、AWS Lambda、Coder、Cloudflare、Daytona、Modal、Namespace、Vercel、E2Bといった既存の実行基盤でも動かせる、と案内されている。',
    why: 'RDSやTerraformの認証情報を外へ出したくない作業がある。実行場所をAWS側へ寄せられるかは、バックアップ自動化の延長で検討できる。',
    points: [
      'My Machinesは、個人のノートPCやVMをアカウントへつなぐ。',
      'Team poolsは要求に合わせて増減し、アイドル時は休止できる。プールは一つのリポジトリに固定されない。',
      'LinuxとMacではcomputer useがあり、クリック、入力、スクリーンショット、ブラウザ操作ができる。',
    ],
    tags: ['Cursor', 'AWS', 'Terraform'],
    source: {
      name: 'Cursor Changelog',
      url: 'https://cursor.com/changelog',
      kind: 'primary',
    },
  },
  {
    slug: 'web-components-boundary',
    title: 'Web ComponentsはNuxtとRailsとPHPの境目に置ける',
    category: 'web',
    date: '2026-07-18',
    summary:
      '共通のヘッダーやフッターを、Nuxt、PHP、Ruby on Rails、WordPressで使い回すとき、Web Componentsが境目になる。Nuxtで作ったUIを、既存のPHPとjQueryの画面へ渡すときも、カスタム要素にするとホスト側はタグだけを知っていればよい。',
    why: 'この組み合わせはすでに本番の話として日記に書いている。Nuxt 4へ上げるときも、配信単位がカスタム要素なら、受け側のPHPやRailsを同じ日に書き換えなくてよい。',
    points: [
      'スタイルとスクリプトをCDNに置く形と相性がよい。',
      '初期状態は属性で渡し、中は要素の中に閉じる。',
      'Nuxt 4のnamed viewsやレイアウトはアプリの内側の話で、外のCMSへ渡す単位とは分けて考えると整理しやすい。',
    ],
    tags: ['Web Components', 'Nuxt', 'Rails', 'CDN'],
    source: {
      name: 'jun01tの日記 / 技術',
      url: 'https://blog.jun01t.com/archive/category/%E6%8A%80%E8%A1%93',
      kind: 'own',
    },
  },
  {
    slug: 'dell-u2725qe',
    title: 'Dell U2725QEはノートを1本で机につなぐ候補',
    category: 'gadget',
    date: '2026-09-16',
    summary:
      '在宅ワークのガジェットまとめ（2026年9月16日）で筆頭に挙がっている、27型4KのDell UltraSharp U2725QE。Thunderboltハブを内蔵し、ノートPCをケーブル1本で画面と周辺機器につなぎやすい、という紹介。',
    why: 'フルリモートで、毎朝ノートを外付け画面へつなぐなら、ドッキングの手間が始業の摩擦になる。27型4Kなら、Nuxtの画面とRailsのログを左右に置ける。',
    points: [
      '紹介の要点は、27型、4K、Thunderboltハブ。',
      '給電ワット数は記事の要約だけでは確定しない。購入前にDellの現行仕様を見る。',
      '色の仕事が主なら、同じまとめにある広色域モデルと並べて選ぶ。',
    ],
    tags: ['モニター', '在宅'],
    source: {
      name: '在宅ワークで買ってよかったガジェットTOP10',
      url: 'https://hiaceandoutdoorlifestyle.com/entry/2026/09/16/070000',
      kind: 'roundup',
    },
  },
  {
    slug: 'japannext-kvm-4k',
    title: '4K 120HzとKVMが4万円前後まで降りてきた',
    category: 'gadget',
    date: '2026-07-06',
    summary:
      '2026年7月6日の実使用メモでは、JAPANNEXT JN-IPS27G120U2-HSPC6を、WindowsノートとLinuxノートの切り替えに使っている。27型、4K、120Hz、USB-C 65W、KVM、ノングレアIPS、昇降スタンド。公式価格は42,980円として記録され、実売は変動する。',
    why: '仕事用の端末と、個人の実験用端末を同じ机に置くと、KVMが配線の本数を減らす。画面を二台並べる前に、一台で切り替える選択になる。',
    points: [
      'USB-C給電は65W。負荷の高いノートなら、足りるかを先に確認する。',
      '記事では白い筐体、34型ウルトラワイド、31.5型4Kなどの姉妹も並んでいる。',
      '長時間の事務作業で色とスタンドを優先するなら、同じ記事が挙げるEIZO FlexScan EV2795（27型WQHD、USB-C、KVM系）が別の候補。',
    ],
    tags: ['モニター', 'KVM'],
    source: {
      name: 'META-MARK ブログ',
      url: 'https://meta-mark.com/blog/japannext-kvm-monitor-engineer-4k120-usbc',
      kind: 'review',
    },
  },
  {
    slug: 'mx-mechanical-mini',
    title: 'MX Mechanical Miniはテンキーを机から外す',
    category: 'gadget',
    date: '2026-09-16',
    summary:
      'Logicool MX Mechanical Miniは、テンキーのない薄型メカニカルキーボード。スイッチは複数種類から選べ、複数台のペアリングとLogi Boltに対応する。静かな時間に使うなら、打鍵音を先に確認する、とまとめ記事は書いている。',
    why: '一日の大半がRailsとVueの入力になる。テンキーを省くと、マウスを体に近づけられる。端末の切り替えはKVMモニターと役割が重なるので、両方を同時に買わなくても足りることがある。',
    points: [
      'Miniのほか、フルサイズと、Mac向けUS配列がある。',
      '赤、茶、青に相当するスイッチを選べる。',
      '数字入力が多い日が主なら、Miniよりフルサイズが合う。',
    ],
    tags: ['キーボード'],
    source: {
      name: '在宅ワークで買ってよかったガジェットTOP10',
      url: 'https://hiaceandoutdoorlifestyle.com/entry/2026/09/16/070000',
      kind: 'roundup',
    },
  },
  {
    slug: 'mx-master-4',
    title: 'MX Master 4はスクロールとボタン割り当てが本体',
    category: 'gadget',
    date: '2026-09-16',
    summary:
      '2026年9月16日の在宅ガジェットまとめは、2025年発売のLogicool MX Master 4を、公式仕様として触覚フィードバック、Actions Ring、MagSpeedホイール、8ボタン、200から8,000dpi、Bluetooth Low EnergyとLogi Bolt、設定アプリLogi Options+と紹介している。',
    why: 'ブラウザ、エディタ、ターミナルを往復し、ログや差分を長くスクロールする。多ボタンは、その往復に割り当てられる。',
    points: [
      'キーボードと同じLogiの受け口にまとめられる。',
      'ホイールの速さとクリック感は、長文の読みと細かい選択で好みが分かれる。店頭か返品条件を見てから決めるとよい。',
    ],
    tags: ['マウス'],
    source: {
      name: '在宅ワークで買ってよかったガジェットTOP10',
      url: 'https://hiaceandoutdoorlifestyle.com/entry/2026/09/16/070000',
      kind: 'roundup',
    },
  },
  {
    slug: 'screenbar',
    title: 'BenQ ScreenBarは光を画面の上に置く',
    category: 'gadget',
    date: '2026-07-18',
    summary:
      '2026年7月18日のデスク周りまとめでは、モニター上端に掛けるBenQ ScreenBarシリーズが、手元を照らしながら画面への映り込みを減らす定番として挙がっている。',
    why: '夜にコードを読む時間が長い。天井の照明だけだと、画面と手元の明るさの差が残る。光の位置は、モニターのインチを上げるより先に効くことがある。',
    points: [
      'モニター上端の厚みと曲率で、掛かるモデルが変わる。購入前に対応するモニター厚を見る。',
      '色温度を下げると、夜の机には残りやすい。',
    ],
    tags: ['ライト', '在宅'],
    source: {
      name: 'デジスタ / デスクガジェット',
      url: 'https://digital-style.jp/desk-gadget',
      kind: 'roundup',
    },
  },
  {
    slug: 'cofo-arm',
    title: '画面の高さはアームで目の位置に合わせる',
    category: 'gadget',
    date: '2026-07-18',
    summary:
      '2026年7月18日のデスクまとめでは、モニターアームの候補としてCOFOの無重力モニターアーム Proが挙がっている。画面の高さと奥行きを、ノートPCの開閉とは別に決められる。',
    why: '日記では、36歳からの土台として体を先に整える、と書いている。画面を目の高さに置くのは、その延長で机に置けるものの一つ。4Kモニターを選んだあと、スタンドの可動域が足りないときに効く。',
    points: [
      '耐荷重と、クランプが机の天板に合うかを先に見る。',
      'KVMで一台にまとめる構成なら、アームはシングルで足りる。',
    ],
    tags: ['アーム', '姿勢'],
    source: {
      name: 'デジスタ / デスクガジェット',
      url: 'https://digital-style.jp/desk-gadget',
      kind: 'roundup',
    },
  },
]

export function categoryOf(id: CategoryId) {
  return categories.find((category) => category.id === id)!
}

export function itemBySlug(slug: string) {
  return items.find((item) => item.slug === slug)
}

export function relatedItems(slug: string, limit = 3) {
  const current = itemBySlug(slug)
  if (!current) return []
  return items
    .filter((item) => item.slug !== slug && item.category === current.category)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit)
}

export { formatDate, safeHttpUrl } from '../../scripts/digest-lib.mjs'
