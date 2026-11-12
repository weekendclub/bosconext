/**
 * ============================================================
 *  BOSCO NEXT お問い合わせフォームの「受け口」
 *  （Google Apps Script のウェブアプリとして動かします）
 *
 *  サイトのお問い合わせフォーム（contact.html）から送られた内容を受け取り、
 *  ご用件に応じた担当のメールアドレスへ、メールで届けます。
 *
 *  ・送信内容は、このスクリプトを置いた Google アカウントの中だけで処理されます
 *    （Google 以外の会社のサービスは経由しません）。
 *  ・このスクリプトにできるのは「下の CONFIG に書いた担当アドレスへメールを送ること」だけです。
 *    ほかの宛先には送れません。Google に許可を求める内容も「メールの送信」だけです。
 *  ・届くメールの差出人は、このスクリプトを置いた Google アカウントの Gmail アドレスになります
 *    （チームの受信箱にだけ見えます。問い合わせた人には見えません）。
 *  ・届いたメールに「返信」すると、問い合わせた本人に届きます。
 *
 *  ▼ 設置の手順（最初の1回だけ・5分ほど）は README.md の
 *    「お問い合わせフォームの仕組み」に書いてあります。
 *
 *  ▼ 項目を増やす・変えるときは、contact.html（入力欄と「表示の仕組み」）と、
 *    このファイルの TYPES / LABELS / LIMITS の両方をそろえて直します。
 *    直したあとは、Apps Script の画面に貼り直して
 *    「デプロイ → デプロイを管理 → 鉛筆（編集）→ バージョン：新バージョン → デプロイ」で反映します。
 *    （「新しいデプロイ」を作り直すと URL が変わってしまうので、必ず「デプロイを管理」から）
 * ============================================================
 */

var VERSION = 1;

var CONFIG = {
  /* 届け先。ご用件ごとに「@ より前」を書きます（@ より後ろは mailDomain）。
     ※ アドレスを1つの文字列で書かないのは、迷惑メール業者の自動収集を避けるためです */
  mailDomain: 'yahoo.co.jp',
  recipients: {
    join:    'bosco_next_futsal-management',   /* 入部・体験・見学 */
    manager: 'bosco_next_futsal-management',   /* マネージャー・スタッフ希望 */
    match:   'bosco_next_futsal-matchmake',    /* 練習試合・対戦のご相談 */
    other:   'bosco_futsal'                    /* その他のお問い合わせ */
  },
  /* メールの差出人として表示する名前 */
  senderName: 'BOSCO NEXT お問い合わせフォーム',
  /* 1日に受け付ける件数の上限（いたずらの大量送信で受信箱があふれるのを防ぐ） */
  dailyLimit: 40,
  /* ページを開いてから送信までが、これより短いものは機械による送信とみなす（ミリ秒） */
  minElapsedMs: 3000
};

/* ご用件ごとの項目。fields＝メールに載せる順番、required＝必須のもの */
var TYPES = {
  join: {
    label: '入部・体験・見学',
    fields: ['name', 'kana', 'gender', 'email', 'email2', 'disability', 'message'],
    required: ['name', 'kana', 'gender', 'email', 'disability', 'message']
  },
  manager: {
    label: 'マネージャー・スタッフ希望',
    fields: ['name', 'kana', 'gender', 'email', 'email2', 'message'],
    required: ['name', 'kana', 'gender', 'email', 'message']
  },
  match: {
    label: '練習試合・対戦のご相談',
    fields: ['team', 'name', 'email', 'email2', 'message'],
    required: ['team', 'name', 'email', 'message'],
    labels: { name: 'ご担当者のお名前' }
  },
  other: {
    label: 'その他のお問い合わせ',
    fields: ['name', 'email', 'email2', 'message'],
    required: ['name', 'email', 'message']
  }
};

var LABELS = {
  team: 'チーム名',
  name: 'お名前',
  kana: 'フリガナ',
  gender: '性別',
  email: 'メールアドレス',
  email2: 'メールアドレス（もう1つ）',
  disability: '障がいの有無（障がいについて）',
  message: 'メッセージ'
};

/* 1項目あたりの最大文字数（これを超えた分は切り捨て） */
var LIMITS = { team: 80, name: 60, kana: 60, gender: 20, email: 120, email2: 120, disability: 300, message: 4000 };

/* 改行を残す項目（それ以外は1行にそろえる） */
var MULTILINE = { disability: true, message: true };

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


/* ---------- 入口 ---------- */

/* フォームからの送信（POST） */
function doPost(e) {
  var result;
  try {
    result = handle_((e && e.parameter) || {});
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    result = { ok: false, error: 'server' };
  }
  return respond_(result);
}

/* ブラウザで URL を開いたとき（設置できたかの確認用） */
function doGet() {
  return respond_({ ok: true, service: 'bosconext-contact', version: VERSION });
}


/* ---------- 本体 ---------- */

function handle_(p) {
  /* 人には見えない入力欄（わな）に何か入っていたら機械とみなす */
  if (clean_(p.cf_hp, 200, false)) return { ok: false, error: 'rejected' };

  var type = String(p.type || '');
  var def = Object.prototype.hasOwnProperty.call(TYPES, type) ? TYPES[type] : null;
  if (!def) return { ok: false, error: 'invalid', fields: ['type'] };

  /* 値を取り出して整える */
  var v = {};
  def.fields.forEach(function (f) {
    v[f] = clean_(p[f], LIMITS[f], !!MULTILINE[f]);
  });

  /* 必須と形式のチェック（画面側でも確認しているが、こちらでも必ず確認する） */
  var bad = def.required.filter(function (f) { return !v[f]; });
  ['email', 'email2'].forEach(function (f) {
    if (v[f] && !EMAIL_RE.test(v[f]) && bad.indexOf(f) < 0) bad.push(f);
  });
  if (bad.length) return { ok: false, error: 'invalid', fields: bad };

  var elapsed = Number(p.t);
  if (!(elapsed >= CONFIG.minElapsedMs)) return { ok: false, error: 'too_fast' };

  /* 動作確認用：dry=1 のときは、ここまでの確認だけしてメールは送らない */
  if (String(p.dry || '') === '1') return { ok: true, dry: true };

  if (MailApp.getRemainingDailyQuota() < 1) return { ok: false, error: 'limit' };
  if (!underDailyLimit_()) return { ok: false, error: 'limit' };

  MailApp.sendEmail({
    to: CONFIG.recipients[type] + '@' + CONFIG.mailDomain,
    replyTo: v.email,
    name: CONFIG.senderName,
    subject: buildSubject_(type, v),
    body: buildBody_(type, v, nowJst_())
  });
  return { ok: true };
}

function buildSubject_(type, v) {
  var who = (type === 'match' && v.team) ? v.team + '（' + v.name + ' さん）' : v.name + ' さん';
  return '【BOSCO NEXT】' + TYPES[type].label + '：' + who;
}

function buildBody_(type, v, when) {
  var def = TYPES[type];
  var lines = ['BOSCO NEXT のホームページから、お問い合わせが届きました。', '', '■ ご用件', def.label, ''];
  def.fields.forEach(function (f) {
    if (f === 'kana') return;                       /* フリガナは名前と同じ行に出す */
    if (!v[f] && def.required.indexOf(f) < 0) return;   /* 任意で空の項目は載せない */
    lines.push('■ ' + ((def.labels && def.labels[f]) || LABELS[f]));
    lines.push(f === 'name' && v.kana ? v.name + '（' + v.kana + '）' : v[f]);
    lines.push('');
  });
  lines.push('――――――――――――――――――――');
  lines.push('このメールにそのまま「返信」すると、ご本人（' + v.email + '）に届きます。');
  lines.push('受付日時：' + when + '（日本時間）');
  return lines.join('\n');
}


/* ---------- 道具 ---------- */

/* 余計な空白や制御文字を取りのぞき、長すぎる入力を切りつめる */
function clean_(value, max, multiline) {
  var s = String(value == null ? '' : value);
  s = s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (!multiline) s = s.replace(/\s+/g, ' ');
  s = s.replace(/^\s+|\s+$/g, '');
  return s.length > max ? s.slice(0, max) : s;
}

function nowJst_() {
  return Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
}

/* きょうの受付件数を数える。上限を超えていたら false */
function underDailyLimit_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties();
    var key = 'count_' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');
    var n = Number(props.getProperty(key) || 0);
    if (n >= CONFIG.dailyLimit) return false;
    if (n === 0) {
      /* 日付が変わったら、前の日までの記録を片づける */
      props.getKeys().forEach(function (k) {
        if (k.indexOf('count_') === 0 && k !== key) props.deleteProperty(k);
      });
    }
    props.setProperty(key, String(n + 1));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
