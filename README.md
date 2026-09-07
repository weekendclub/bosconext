# BOSCO NEXT 公式サイト

東京を拠点に活動するソーシャルフットボールクラブ **BOSCO NEXT（ボスコ ネクスト）** の公式サイトです。

| | URL |
|---|---|
| 公開サイト（正規URL） | https://weekendclub.github.io/bosconext/ |
| 編集画面（CMS） | https://bosconext.netlify.app/admin/ |
| ミラー（ログイン用） | https://bosconext.netlify.app/ |

> `https://weekendclub.github.io/bosconext/admin/` を開いた場合も、自動で Netlify 側の編集画面へ転送されます。

---

## 更新のしかた

**ふだんの更新は、ほぼすべて編集画面（`/admin`）のフォームでできます。** HTML や GitHub を触る必要はありません。

くわしくは **[編集ガイド.md](編集ガイド.md)** を読んでください。初回だけ必要なログイン設定（GitHub の OAuth アプリ作成 → Netlify に登録）も、そこに手順があります。

編集画面から編集できるもの：お知らせ／トップの文章・写真／チーム・選手／スケジュール／大会戦績／フォトギャラリー／リンク

---

## ファイルの構成

```
/
├── index.html            トップページ
├── team.html             チーム＆選手
├── tournaments.html      大会出場概要
├── schedule.html         スケジュール
├── gallery.html          フォトギャラリー
├── links.html            リンク
├── contact.html          お問い合わせ  ／ thanks.html  送信完了
├── league.html           リーグ        ／ press.html   新聞・雑誌切り抜き
├── members.html          会員専用ページ
│
├── style.css             全ページ共通のデザイン
├── site.js               全ページ共通の処理（ヘッダー・フッター・メニュー・リンク）
├── team-photo.js         トップのデフォルト写真（画像を埋め込んだファイル）
│
├── *.json                編集画面で保存されるデータ
│                         news / home / team / schedule / tournaments / gallery / links
├── images/uploads/       編集画面からアップロードした画像の保存先
│
├── admin/index.html      編集画面（Decap CMS）
├── config.yml            編集画面の設定（項目・保存先）
│
├── sitemap.xml           検索エンジン向けサイトマップ
├── robots.txt            検索エンジン向けの案内（Netlify ドメイン用）
└── .nojekyll             GitHub Pages の Jekyll 処理を無効にする印
```

- ページの中身（お知らせ・選手・戦績など）は `*.json` に入っていて、各ページが読み込んで表示します。
- デザインを直したいときは `style.css`、メニューや SNS リンクは `site.js` の `SITE_INFO` を編集します。

---

## 手元で確認する（任意）

JSON はブラウザで直接ファイルを開くと読み込めません（`file://` では `fetch` がブロックされます）。
確認するときは簡易サーバを立ててください。

```bash
python3 -m http.server 8000
# → http://localhost:8000/        で表示を確認
# → http://localhost:8000/admin/  で編集画面を確認（ローカルではログインは不要・不可）
```

---

## 公開の仕組み

- `main` ブランチに push すると、**GitHub Pages**（このリポジトリ / root）と **Netlify**（`bosconext` プロジェクト）の両方に自動で反映されます。
- 画像などのパスは**相対パス**で書いています。GitHub Pages（`/bosconext/` の下）と Netlify（ルート直下）のどちらでも同じように解決させるためです。ルートからの絶対パス（`/images/...`）は使わないでください。
- 各ページの `canonical` は GitHub Pages 側を指しています（検索結果に出したい正規URL）。

## 履歴

もとは `weekendclub/weekendclub.github.io` リポジトリの `bosconext/` フォルダにありました。
BOSCO NEXT 単独で編集権限を管理できるよう、このリポジトリへ移しています。公開URLは変わりません。
