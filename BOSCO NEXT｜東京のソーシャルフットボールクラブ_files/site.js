/* ============================================================
   BOSCO NEXT 共通スクリプト（全ページのヘッダー・フッター・動作）

   ★ メニュー・リンク・チーム名は、この下の SITE_INFO を
      書き換えれば「すべてのページ」にまとめて反映されます。
   ============================================================ */
var SITE_INFO = {
  clubName:   "BOSCO NEXT",
  clubNameJa: "ボスコ ネクスト",
  tagline:    "どんな壁も乗り越えられる",

  /* 体験・入部やお問い合わせの行き先、SNS など（URLを書き換えればOK） */
  links: {
    join:        "contact.html",   /* 「体験・入部」ボタンの行き先 */
    contact:     "contact.html",   /* 「お問い合わせ」ボタンの行き先 */
    x:           "https://x.com/BOSCONEXT",
    instagram:   "https://www.instagram.com/bosconext_futsal/",
    note:        "https://note.com/mackeyfootball/n/ndbd9daead388",
    blog:        "http://ameblo.jp/bosconext/",
    jimdoContact:"https://bosconext.jimdofree.com/お問い合わせ/お問い合わせ/",
    jimdoJoin:   "https://bosconext.jimdofree.com/お問い合わせ/入部希望/",
    jimdoMembers:"https://bosconext.jimdofree.com/会員専用ページ/"
  },

  /* 上のメニューに出すページ */
  nav: [
    {label:"ホーム",           url:"index.html"},
    {label:"チーム＆選手",     url:"team.html"},
    {label:"大会出場概要",     url:"tournaments.html"},
    {label:"スケジュール",     url:"schedule.html"},
    {label:"フォトギャラリー", url:"gallery.html"},
    {label:"リンク",           url:"links.html"},
    {label:"お問い合わせ",     url:"contact.html"}
  ],
  /* 補助的なページ（スマホメニューとフッターに表示） */
  morePages: [
    {label:"リーグ",             url:"league.html"},
    {label:"新聞・雑誌切り抜き", url:"press.html"},
    {label:"会員専用ページ",     url:"members.html"}
  ]
};

/* ===== ここから下は仕組み（基本さわらなくてOK） ===== */
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

function currentPage(){
  var p = location.pathname.split("/").pop();
  return (p && p.length) ? p : "index.html";
}

function renderHeader(){
  var here = currentPage();
  var links = SITE_INFO.nav.map(function(n){
    var act = (n.url === here) ? ' class="active"' : '';
    return '<li><a href="'+esc(n.url)+'"'+act+'>'+esc(n.label)+'</a></li>';
  }).join("");

  var header = document.getElementById("site-header");
  if(header){
    header.innerHTML =
      '<div class="wrap nav">'+
        '<a href="index.html" class="brand"><span class="ball"></span>'+esc(SITE_INFO.clubName)+'</a>'+
        '<ul class="nav-links">'+links+'</ul>'+
        '<div class="nav-cta"><a class="btn btn-dark" href="'+esc(SITE_INFO.links.join)+'">⚽ 体験・入部</a></div>'+
        '<button class="burger" id="burger" aria-label="メニュー"><span></span><span></span><span></span></button>'+
      '</div>';
  }

  var all = SITE_INFO.nav.concat(SITE_INFO.morePages);
  var mob = document.getElementById("mobileMenu");
  if(mob){
    mob.innerHTML = all.map(function(n){
      return '<a href="'+esc(n.url)+'">'+esc(n.label)+'</a>';
    }).join("") +
    '<a class="btn btn-primary" href="'+esc(SITE_INFO.links.join)+'">⚽ 体験・入部のお問い合わせ</a>';
  }
}

function renderFooter(){
  var foot = document.getElementById("site-footer");
  if(!foot) return;
  var all = SITE_INFO.nav.concat(SITE_INFO.morePages);
  var pages = all.map(function(n){return '<a href="'+esc(n.url)+'">'+esc(n.label)+'</a>';}).join("");
  var sns =
    '<a href="'+esc(SITE_INFO.links.x)+'" target="_blank" rel="noopener">X</a>'+
    '<a href="'+esc(SITE_INFO.links.instagram)+'" target="_blank" rel="noopener">Instagram</a>'+
    '<a href="'+esc(SITE_INFO.links.note)+'" target="_blank" rel="noopener">note</a>'+
    '<a href="'+esc(SITE_INFO.links.blog)+'" target="_blank" rel="noopener">ブログ</a>';
  foot.innerHTML =
    '<div class="wrap">'+
      '<div class="foot-top">'+
        '<div>'+
          '<div class="foot-brand"><span class="ball"></span>'+esc(SITE_INFO.clubName)+'</div>'+
          '<p class="foot-tag">'+esc(SITE_INFO.tagline)+'</p>'+
        '</div>'+
        '<div class="foot-links">'+sns+'</div>'+
      '</div>'+
      '<div class="foot-cols">'+pages+'</div>'+
      '<div class="foot-bottom">'+
        '<span>© '+esc(SITE_INFO.clubName)+' '+(new Date().getFullYear())+'</span>'+
        '<span>東京近辺で活動するソーシャルフットボールクラブ</span>'+
      '</div>'+
    '</div>';
}

/* スクロールで要素をふわっと出す（動的に追加した要素にも使える） */
var __revObserver = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){ e.target.classList.add("in"); __revObserver.unobserve(e.target); }
  });
},{threshold:.12});
function observeReveals(){
  document.querySelectorAll(".reveal").forEach(function(el){
    if(!el.classList.contains("in")) __revObserver.observe(el);
  });
}

function initChrome(){
  var burger = document.getElementById("burger");
  var mm = document.getElementById("mobileMenu");
  if(burger && mm){
    burger.addEventListener("click",function(){burger.classList.toggle("open");mm.classList.toggle("open");});
    mm.addEventListener("click",function(e){if(e.target.tagName==="A"){burger.classList.remove("open");mm.classList.remove("open");}});
  }
  var toTop = document.getElementById("toTop");
  if(toTop){
    window.addEventListener("scroll",function(){toTop.classList.toggle("show", window.scrollY>500);});
    toTop.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});
  }
  /* data-link="join" などのボタンに、上の links のURLを自動で設定 */
  document.querySelectorAll("[data-link]").forEach(function(el){
    var u = SITE_INFO.links[el.getAttribute("data-link")];
    if(u){ el.setAttribute("href", u); }
  });
  observeReveals();
}

/* データファイル(JSON)を読み込む共通処理。CMSで編集した内容をページに反映するために使う。
   読み込めない場合（ローカルで直接ファイルを開いたとき等）は cb(null) を呼ぶので、各ページで予備データを表示できる。 */
function loadJSON(path, cb){
  fetch(path, {cache:"no-store"})
    .then(function(r){ if(!r.ok) throw 0; return r.json(); })
    .then(function(d){ cb(d); })
    .catch(function(){ cb(null); });
}

renderHeader();
renderFooter();
initChrome();
