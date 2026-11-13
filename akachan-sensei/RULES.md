# 赤ちゃん先生 作り方のルール（金井さんと決めたこと）

アカウント：@baby_sensei_jp（名前「赤ちゃん先生👓くらしのNG・OK」、旧 @k_pro2026.11）。2026/11/12 に名前を変更済み（14日以内の名前変更は2回まで）。

## 動画
- 0秒目（最初のフレーム）から文字を出す。フェードインしない。
  - 「cover」カード：👶赤ちゃん先生 第N話 ／ テーマ ／ ✕ NG：… ／ ○ OK：…（episode.json の "cover"）
  - 予約時は videoCoverMilliseconds を 0〜500 にして、表紙にもこのカードが出るようにする。
- 一番笑える場面（オチ）を最初の1〜2秒に入れる（ティーザー）。
- 全体は20〜25秒。各クリップは要点だけに短く切る。
- 赤ちゃんは Flow「Baby boy talking on bed から保存したフレーム」を毎回素材に付ける。プロンプトは "The same character from the reference image"。口に物をくわえたままセリフを言わせない（音声生成が失敗する）。

## 投稿（Metricool brandId 7793073）
- REEL・showReelOnFeed true・isAiGenerated true・20:30。
- 金井さんの「OK」が来るまで予約しない。
- firstCommentText に毎回「あなたはどっち派？👇 🅰️… 🅱️… コメントで教えてね😊」型の質問を入れる。
- ハッシュタグは5つまで。キャプション最後にも質問を入れる。

## 毎日のおまけ
- 赤ちゃん先生用に新しく作るページは、Artifacts の「赤ちゃん先生」フォルダ（id 0b3466d1-b987-49b6-af2e-2b0ef76d5b6d）に入れる。
- 管理ページ：artifact slug 63d169cf-9a1a-4000-9395-0eb4b1d00ef0（元ファイル /home/claude/hub/index.html）。毎日の作業の最後に「今日やること・話の一覧と結果・最終更新」を書き換えて publish_files で更新する。
- フォロー＆コメントのページ：artifact slug 44cd6734-294d-43a8-a39b-d78521c743ab（https://claude.ai/artifact/9VmaAGrmEtLkWzx2G49qiJ）。元ファイル /home/claude/follow/index.html の DATE・KEY・ITEMS を毎日書き換え、タイトルを「赤ちゃん先生 フォロー・コメント M/D」にして publish_files（slug と base_version 付き）で更新。前日までに出したアカウントは入れない。
- フォローする相手のリスト10〜20件（子育て・生活の豆知識・赤ちゃん系）と、投稿ごとに違うコメント案を送る。押すのは金井さん（自動フォロー・自動コメント・DMはしない）。
- 数字（再生・3秒視聴率・平均視聴時間・保存/シェア/コメント）を見て、何を変えたかを毎回伝える。

## 時間
- Flow のクレジットは毎日19:53に戻る → 20:00に作る。

## Flow の操作メモ（2026/11/13 の新しい画面）
- 右側の「エージェント」パネルが出たら閉じ、プロンプト欄の「エージェント」ボタンを押してオフにすると、従来の「動画・720p・8秒・9:16・x1」の入力に戻る（設定は Veo 3.1 - Lite を確認）。
- 素材の追加：「+」→ 左の「画像」で絞り込み →「Baby boy talking on bed から保存したフレーム」を選ぶ →「プロンプトに追加」。
- 生成ボタンは ref クリックが外れることがあるので、スクリーンショット座標で右下の → を押す。
- 動画URLの取り方：編集画面の <video> は出ないことがある。その場合は read_network_requests で rpcids=as29s の応答本文を読み、"https://flow-content.google/video/<メディアID>?Expires…&Signature…" を使う（メディアIDはプロンプト本文の近くに出る）。
