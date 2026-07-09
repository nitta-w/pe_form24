import { embedTimeCalendar } from './time-calendar-sync/main.js';

$(() => {
  /* ================= CONFIG (Lステップ連携) ================= */
  const CONFIG = {
    BOT_BASIC_ID: '897vblrf',
    VAR_IDS: {
      gender: '2184987', age: '2184988', body_parts: '2184994', diet_history: '2460256',
      coupon: '2184995', clinic_area: '2184547', clinic: '2184548',
      reserve_date1: '2184549', reserve_time1: '2184551',
      reserve_time2: '2349621', reserve_time3: '2433745',
      lp_source: '2504096',
    },
    LP_ID: 'sururim_quest_v1',
  };
  const ST = { i: -1, a: { gender: '', age: '', body_parts: [], diet: [], area: '', clinic: '', coupon: '3大特典クーポン' } };

  const CLINICS = {
    '北海道・東北': ['札幌店（大通駅）', '旭川店（旭川駅）', '青森店（青森駅）', '秋田店（秋田駅）', '仙台店（仙台駅）', '福島店（郡山駅）'],
    '関東': ['新宿店（新宿東口）', '渋谷店（文化村通り）', '銀座店（銀座駅）', '池袋店（サンシャイン通り）', '表参道店（表参道）', '広尾店（広尾駅）', '錦糸町店（錦糸町）', '吉祥寺店（吉祥寺）', '八王子店（八王子駅）', '町田店（町田駅）', '横浜駅前店（横浜駅）', '川崎店（川崎駅）', '藤沢店（藤沢駅）', '海老名店（海老名駅）', '大宮店（大宮駅）', '浦和店（浦和駅）', '川口店（川口駅）', '川越店（川越駅）', '千葉店（千葉駅）', '柏店（柏駅）', '松戸店（松戸駅）', '水戸店（水戸駅）', '宇都宮店（宇都宮駅）', '高崎店（高崎駅）'],
    '中部': ['名古屋店（名古屋駅）', '栄店（栄駅）', '浜松店（新浜松駅）', '静岡店（静岡駅北口）', '新潟店（新潟駅）', '長野店（長野駅）', '金沢店（金沢駅）', '岐阜店（名鉄岐阜駅）', '四日市店（四日市駅）'],
    '関西': ['梅田店（梅田駅）', '心斎橋店（心斎橋駅）', '京都店（京都駅）', '神戸三宮店（三宮駅）'],
    '中国・四国': ['広島店（立町駅）', '高松店（高松駅）'],
    '九州・沖縄': ['福岡天神店（天神南駅）', '熊本店（熊本駅）', '鹿児島店（鹿児島中央駅）'],
  };

  /* ================= UTIL =================
   * qs/qsa は独自のクエリセレクタ省略記法（jQuery の $ とは別物）。
   * このファイル内で jQuery の $ は postAdCountStatus / addParamsToCtaUrl /
   * CTA バインド / カレンダーモジュール呼び出しにのみ使用する。 */
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const sl = (ms) => new Promise((r) => setTimeout(r, ms));
  function ce(t, c, h) { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  const BODY = () => qs('#body');

  /* 半角数字→全角変換（DotGothic16の半角数字は視認性が低いため）。HTMLタグ内は変換しない */
  function zk(s) {
    return String(s).replace(/&#9654;/g, '▶').split(/(<[^>]+>)/).map((part) =>
      part.startsWith('<') ? part : part.replace(/[0-9%]/g, (c) => (c === '%' ? '％' : String.fromCharCode(c.charCodeAt(0) + 0xFEE0)))
    ).join('');
  }

  /* localStorageが使えない環境（プレビューやプライベートモード等）でも止まらない安全ラッパー */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { console.warn('storage unavailable:', e.message); return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { console.warn('storage unavailable:', e.message); } },
  };
  window.addEventListener('unhandledrejection', (e) => console.error('unhandled rejection:', e.reason));

  /* ================= PIXEL ART RENDERER =================
     rows: 文字列配列（1文字=1ピクセル）/ pal: 文字→色 / cell: px */
  function px(rows, pal, cell = 5, cls = '') {
    const w = rows[0].length * cell, h = rows.length * cell; let r = '';
    rows.forEach((row, y) => { [...row].forEach((ch, x) => {
      const c = pal[ch]; if (c) r += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${c}"/>`;
    }); });
    return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${r}</svg>`;
  }

  /* ---- MIRAI（案内フェアリー） ---- */
  const MIRAI_ROWS = [
    '....oooooo....', '...ohhGGhho...', '..ohhhhhhhho..', '..ohhhhhhhho..',
    '..ohffffffho..', '..ohfeffefho..', '..ohfbffbfho..', '...ohffffho...',
    '....offffo....', '...owwwwwwo...', '..owwwppwwwo..', '.oswwwwwwwwso.',
    '.owwwwwwwwwwo.', '.owwwwwwwwwwo.', 'owwwwwwwwwwwwo', '....od..do....',
  ];
  const MIRAI_PAL = { o: '#5A2B40', h: '#FF9FBE', G: '#FFD75E', f: '#FFEBDD', e: '#3A1F2E', b: '#FFB5C8', w: '#FFF6EC', p: '#FF4785', s: '#FFEBDD', d: '#B34A6E' };
  const MIRAI_SVG = px(MIRAI_ROWS, MIRAI_PAL, 5);

  /* ---- タップ誘導の指マーク（横向き指差し・FF14風） ---- */
  const HAND_ROWS = [
    '....oooo......', '...oWWWWo.....', '..oWWWWWWoooo.', '..oWWWWWWWWWWo',
    '..oWWWWWWWWWWo', '..oWWWWWWoooo.', '..oWWWWWWo....', '...oWWWWo.....', '....oooo......',
  ];
  const HAND_PAL = { o: '#3A1F2E', W: '#FFF6EC' };
  const HAND_SVG = px(HAND_ROWS, HAND_PAL, 3);
  const HAND_S = px(HAND_ROWS, HAND_PAL, 2);

  /* ---- 脂肪スライム（ボス戦） ---- */
  const SLIME_ROWS = [
    '.....oooo.....', '...ooYYYYoo...', '..oYYLYYYYYo..', '.oYYLYYYYYYYo.',
    '.oYeYYYYYeYYo.', 'oYYYYYYYYYYYYo', 'oYYYmmmmmmYYYo', 'oYYYYYYYYYYYYo',
    '.oYYYYYYYYYYo.', '..oooooooooo..',
  ];
  const SLIME_PAL = { o: '#8A6A2E', Y: '#FFE3A8', L: '#FFF3D6', e: '#4A2333', m: '#C97B4A' };
  const BOSS_NAMES = { 'アゴ下': 'あごした', '二の腕': 'にのうで', '上腹部': 'うわばら', '下腹部': 'したばら', '側腹部': 'わきばら', '太もも外側': 'そとふともも', '太もも内側': 'うちふともも', '背中': 'せなか' };

  /* ---- スルリム注射器（攻撃エフェクト） ---- */
  const SYR_ROWS = [
    '.........ooooooo..o.', '.........oppWppo..o.', 'nnnnnnnnnoppWppooooo',
    '.........oppWppo..o.', '.........ooooooo..o.',
  ];
  const SYR_PAL = { n: '#D9DCE8', o: '#3A1F2E', p: '#FF6FA5', W: '#FFD9E6' };
  const SYR_SVG = px(SYR_ROWS, SYR_PAL, 3);

  /* 勝利演出: 光の柱＋舞い上がる星（宝箱の紙吹雪とは別演出） */
  function victoryFX() {
    const sc = qs('#scene');
    const pillar = ce('div', 'vpillar'); sc.appendChild(pillar); setTimeout(() => pillar.remove(), 1400);
    for (let i = 0; i < 12; i++) {
      const s = ce('div', 'vstar');
      s.style.left = (36 + Math.random() * 30) + '%';
      s.style.bottom = (40 + Math.random() * 50) + 'px';
      s.style.animationDelay = (Math.random() * .5) + 's';
      if (i % 3 === 0) s.classList.add('vstar--cream');
      if (i % 4 === 0) s.classList.add('vstar--pink');
      sc.appendChild(s); setTimeout(() => s.remove(), 1900);
    }
  }

  /* ---- 宝箱 ---- */
  const CHEST_C = [
    '..kkkkkkkkkkkk..', '.kwwwwwwwwwwwwk.', 'kwWWWWWWWWWWWWwk', 'kwWggggggggggWwk',
    'kwwwwwwwwwwwwwwk', 'kkkkkkkkkkkkkkkk', 'kwwwwwggggwwwwwk', 'kwwwwwgGGgwwwwwk',
    'kwWwwwgggwwwwWwk', 'kwWwwwwwwwwwwWwk', 'kwwwwwwwwwwwwwwk', '.kkkkkkkkkkkkkk.',
  ];
  const CHEST_O = [
    '..kkkkkkkkkkkk..', '.kwWWWWWWWWWWwk.', 'kwWggggggggggWwk', 'kwwwwwwwwwwwwwwk',
    'kkkkkkkkkkkkkkkk', 'kGyyyyyyyyyyyyGk', 'kyyGyyGGyyGyyyyk', 'kkkkkkkkkkkkkkkk',
    'kwwwwwggggwwwwwk', 'kwWwwwgGGgwwwWwk', 'kwwwwwwwwwwwwwwk', '.kkkkkkkkkkkkkk.',
  ];
  const CHEST_PAL = { k: '#4A2312', w: '#B36B2E', W: '#D98A42', g: '#FFD75E', G: '#FFF0B0', y: '#FFE894' };

  /* ---- ミニ宝箱（HUD/タイトル） ---- */
  const CHEST_MINI = ['.kkkkkk.', 'kwWWWWwk', 'kwggggwk', 'kkkkkkkk', 'kwwgGwwk', 'kwwggwwk', '.kkkkkk.'];

  /* ---- クリスタル / 石碑 / 鏡 / ギルド旗 / ゲート ---- */
  const CRYSTAL = [
    '....pp....', '...pPPp...', '..pPPLPp..', '..pPLLPp..', '.pPPLLPPp.',
    '.pPPPLPPp.', '..pPPPPp..', '...pPPp...', '....pp....', '..kkkkkk..', '.kwwwwwwk.',
  ];
  const CRYSTAL_PAL = { p: '#B34A6E', P: '#FF6FA5', L: '#FFD9E6', k: '#4A2312', w: '#B36B2E' };
  const TABLET = [
    '.ssssssss.', 'sSSSSSSSSs', 'sSggggggSs', 'sSSSSSSSSs', 'sSgggggSSs',
    'sSSSSSSSSs', 'sSggggggSs', 'sSSSSSSSSs', 'sSSSSSSSSs', 'ssssssssss',
  ];
  const TABLET_PAL = { s: '#3B2549', S: '#5A3F63', g: '#FFD75E' };
  const MIRROR = [
    '..gggggg..', '.gGGGGGGg.', 'gGmmmmmmGg', 'gGmMMMMmGg', 'gGmMffMmGg',
    'gGmMMMMmGg', 'gGmmmmmmGg', '.gGGGGGGg.', '..gggggg..', '...kkkk...',
  ];
  const MIRROR_PAL = { g: '#C99B2E', G: '#FFD75E', m: '#6E4F78', M: '#FFB5CC', f: '#FFF6EC', k: '#4A2312' };
  const FLAG = [
    'kppppppppp', 'kpwwwwwwwp', 'kpwhhwhhwp', 'kphhhhhhhp', 'kpwhhhhhwp',
    'kpwwhhhwwp', 'kpwwwhwwwp', 'kppppppppp', 'k.........', 'k.........', 'k.........',
  ];
  const FLAG_PAL = { k: '#4A2312', p: '#FF4785', w: '#FFF6EC', h: '#FF6FA5' };
  const GATE = [
    '..gggggggg..', '.gGGGGGGGGg.', 'gGLLLLLLLLGg', 'gGLyyyyyyLGg', 'gGLyWWWWyLGg',
    'gGLyWWWWyLGg', 'gGLyWWWWyLGg', 'gGLyWWWWyLGg', 'gGLyyyyyyLGg', 'gGLLLLLLLLGg',
  ];
  const GATE_PAL = { g: '#C99B2E', G: '#FFD75E', L: '#FFF0B0', y: '#FFE894', W: '#FFFDF2' };

  /* ---- 扉（枠16x20・パネル6x18 — 開口部12x18と同比率で歪みなし） ---- */
  const DOOR_FRAME = [
    '..ssssssssssss..', '.sSSSSSSSSSSSSs.', 'sS............Ss', 'sS............Ss',
    'sS............Ss', 'sS............Ss', 'sS............Ss', 'sS............Ss',
    'sS............Ss', 'sS............Ss', 'sS............Ss', 'sS............Ss',
    'sS............Ss', 'sS............Ss', 'sS............Ss', 'sS............Ss',
    'sS............Ss', 'sS............Ss', 'sS............Ss', 'sS............Ss',
  ];
  const DOOR_L = [
    'kkkkkk', 'kWWWWk', 'kWWWpk', 'kWWppk', 'kWWppk', 'kWWWpk', 'kWWWWk', 'kWWWWk',
    'kWWWWk', 'kWWWgk', 'kWWWgk', 'kWWWWk', 'kwWWWk', 'kwWWWk', 'kwWWWk', 'kwWWWk', 'kwwwwk', 'kkkkkk',
  ];
  const DOOR_R = [
    'kkkkkk', 'kWWWWk', 'kpWWWk', 'kppWWk', 'kppWWk', 'kpWWWk', 'kWWWWk', 'kWWWWk',
    'kWWWWk', 'kgWWWk', 'kgWWWk', 'kWWWWk', 'kWWWwk', 'kWWWwk', 'kWWWwk', 'kWWWwk', 'kwwwwk', 'kkkkkk',
  ];
  /* 階層で扉が進化する（木→石→黄金→水晶）— 「潜っている感」の演出。
     行データ(DOOR_L/R)は共通、パレット差し替えのみなのでドット崩れなし */
  const DOOR_TIERS = [
    { door: { w: '#A55A70', W: '#C97B8E', k: '#5A2B40', p: '#FF9FBE', P: '#FFD9E6', g: '#FFD75E' }, frame: { s: '#4B2F5C', S: '#5F3D72' } },
    { door: { w: '#6E6788', W: '#948CB0', k: '#3A3450', p: '#C9C2E8', P: '#E8E4FF', g: '#FFD75E' }, frame: { s: '#544A6A', S: '#6E6288' } },
    { door: { w: '#B8862E', W: '#DCA845', k: '#5E4212', p: '#FFE894', P: '#FFF6D0', g: '#FFF0B0' }, frame: { s: '#7A5A1E', S: '#9A7630' } },
    { door: { w: '#C4589A', W: '#E87BB8', k: '#5A1F44', p: '#FFD9E6', P: '#FFF0F6', g: '#FFF6EC' }, frame: { s: '#8A2E66', S: '#B04A88' } },
  ];
  function doorTier(floor) { return floor <= 2 ? 0 : floor <= 4 ? 1 : floor <= 6 ? 2 : 3; }
  /* 性別選択用: 男性の扉はブルー（女性はtier0のピンクのまま） */
  const DOOR_PAL_M = { w: '#4A6BA8', W: '#6E90CC', k: '#25355C', p: '#9FC4FF', P: '#D9E8FF', g: '#FFD75E' };
  const DOOR_FRAME_M = { s: '#2E3D66', S: '#3E5080' };

  function doorHTML(id, floor = 1) {
    const t = DOOR_TIERS[doorTier(floor)];
    return `<div class="doorbox" id="${id}">
      <div class="doorbox__hole"><div class="doorbox__light"></div>
        <div class="doorbox__pnl doorbox__pnl--l">${px(DOOR_L, t.door, 7)}</div>
        <div class="doorbox__pnl doorbox__pnl--r">${px(DOOR_R, t.door, 7)}</div>
      </div>
      <div class="doorbox__frame">${px(DOOR_FRAME, t.frame, 7)}</div>
    </div>`;
  }

  /* small icons (inventory) — セル3px（28px枠に収まる等倍サイズ） */
  const IC_TICKET = px(['gggggggg', 'gWWpWWWg', 'gWWpWWWg', 'gWWpWWWg', 'gggggggg'], { g: '#FFD75E', W: '#FFF6EC', p: '#FF4785' }, 3);
  const IC_HEART = px(['.pp.pp.', 'ppppppp', 'ppppppp', '.ppppp.', '..ppp..', '...p...'], { p: '#FF4785' }, 3);
  const IC_CHEST = px(CHEST_MINI, CHEST_PAL, 3);
  const IC_KEY = px(['.ggg....', 'g...g...', 'g...gggg', 'g...g..g', '.ggg...g'], { g: '#FFD75E' }, 3);
  const KEY_BIG = px(['.ggg....', 'g...g...', 'g...gggg', 'g...g..g', '.ggg...g'], { g: '#FFD75E' }, 7);
  const IC_CHECK = px(['.....p', '....pp', 'p..pp.', 'pppp..', '.pp...'], { p: '#62E088' }, 3);

  /* ---- 5つの理由アイコン（ドット絵・rsn__icスロットは後日実画像に差し替え可） ---- */
  const RICO_SYR = px(SYR_ROWS, SYR_PAL, 2);
  const RICO_BURST = px(['g..p..g', '.g.p.g.', '..ppp..', 'ppp.ppp', '..ppp..', '.g.p.g.', 'g..p..g'], { g: '#FFD75E', p: '#FF4785' }, 5);
  const RICO_CLOCK = px(['..ggg..', '.g...g.', 'g..W..g', 'g..WW.g', 'g.....g', '.g...g.', '..ggg..'], { g: '#FFD75E', W: '#FFF6EC' }, 5);
  const RICO_SPARK = px(['g..p..g', '...p...', '.ppppp.', '...p...', 'g..p..g'], { g: '#FFD75E', p: '#FF9FBE' }, 5);
  const RICO_CROWN = px(['p...g...p', 'g..ggg..g', 'gg.ggg.gg', 'ggggggggg', 'gpgggggpg', 'ggggggggg'], { g: '#FFD75E', p: '#FF4785' }, 4);

  /* ================= SOUND (チップチューン) ================= */
  let AC = null, sndOK = true, sndOn = true;
  function ac() { if (!sndOK) return null; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); return AC; } catch (e) { sndOK = false; console.warn('audio unavailable', e); return null; } }
  function tone(freq, dur, type = 'square', vol = .08, when = 0) {
    const a = ac(); if (!a || !sndOn) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, a.currentTime + when);
    g.gain.exponentialRampToValueAtTime(.001, a.currentTime + when + dur);
    o.connect(g); g.connect(a.destination);
    o.start(a.currentTime + when); o.stop(a.currentTime + when + dur + .02);
  }
  const SFX = {
    blip: () => tone(880, .06),
    tick: () => tone(1600, .02, 'square', .016),
    sel: () => { tone(990, .05); tone(1320, .08, 'square', .07, .05); },
    door: () => { tone(160, .22, 'sawtooth', .06); tone(120, .28, 'sawtooth', .05, .08); },
    warp: () => { [440, 554, 659, 880].forEach((f, i) => tone(f, .09, 'square', .06, i * .06)); },
    chest: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .14, 'square', .09, i * .09)); },
    get: () => { tone(1047, .08); tone(1319, .12, 'square', .08, .08); },
    hit: () => { tone(220, .08, 'sawtooth', .09); tone(180, .06, 'square', .06, .04); },
    levelup: () => {
      [392, 523, 659, 784].forEach((f, i) => tone(f, .1, 'square', .09, i * .095));
      tone(1047, .55, 'square', .08, .4); tone(1319, .55, 'triangle', .07, .4);
    },
  };
  /* ================= BGM（チップチューンループ） =================
     tone()経由なので sndOn のミュートに自動連動。音量は効果音より小さめ */
  const BGM = {
    timer: null, step: 0, cur: '',
    tracks: {
      field: { spb: .28, bass: [110, 0, 131, 0, 110, 0, 131, 0, 98, 0, 131, 0, 98, 0, 123, 0], mel: [440, 0, 523, 659, 0, 523, 440, 0, 392, 0, 494, 587, 0, 494, 392, 0] },
      boss: { spb: .17, bass: [110, 110, 0, 110, 104, 104, 0, 104, 98, 98, 0, 98, 117, 117, 131, 0], mel: [659, 0, 622, 659, 0, 587, 0, 523, 587, 0, 523, 494, 523, 0, 440, 0] },
      clear: { spb: .23, bass: [131, 0, 196, 0, 220, 0, 175, 0, 131, 0, 196, 0, 175, 196, 262, 0], mel: [523, 587, 659, 784, 659, 523, 784, 0, 880, 784, 659, 587, 659, 784, 1047, 0] },
    },
    play(name) {
      if (this.cur === name) return;
      this.stop(); const t = this.tracks[name]; if (!t || !ac()) return;
      this.cur = name; this.step = 0;
      this.timer = setInterval(() => {
        if (!sndOn) return;
        const i = this.step % t.bass.length;
        if (t.bass[i]) tone(t.bass[i], t.spb * .9, 'triangle', .05);
        if (t.mel[i]) tone(t.mel[i], t.spb * .75, 'square', .022);
        this.step++;
      }, t.spb * 1000);
    },
    stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } this.cur = ''; },
  };

  /* スマホバイブ（非対応環境では何もしない） */
  function vib(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { console.warn('vibrate n/a:', e.message); } }
  /* 画面シェイク */
  function shake() { const a = qs('#app'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }
  const SND_ON_ROWS = ['...p..g.', '..pp.g.g', '.ppp.g.g', '.ppp.g.g', '..pp.g.g', '...p..g.'];
  const SND_OFF_ROWS = ['...p....', '..pp.x.x', '.ppp..x.', '.ppp..x.', '..pp.x.x', '...p....'];
  function drawSnd() {
    qs('#hSnd').innerHTML = sndOn
      ? px(SND_ON_ROWS, { p: '#FF9FBE', g: '#FFD75E' }, 3)
      : px(SND_OFF_ROWS, { p: '#5A3F63', x: '#FF6A6A' }, 3);
  }

  /* ================= FLOW 定義 ================= */
  const PARTS_OPTS = [
    { l: 'アゴ下・フェイスライン', v: 'アゴ下' }, { l: '二の腕', v: '二の腕' },
    { l: 'お腹（上部）', v: '上腹部' }, { l: 'お腹（下部）', v: '下腹部' },
    { l: 'ウエスト・脇腹', v: '側腹部' }, { l: '太もも（外側）', v: '太もも外側' },
    { l: '太もも（内側）', v: '太もも内側' }, { l: '背中・ハミ肉', v: '背中' },
  ];
  const FLOW = [
    { t: 'msgs', scene: 'door', floor: 1, msgs: [
      'ようこそ、<b>脂肪破壊クエスト</b>へ。わたしは案内役の妖精 <b>MIRAI</b> です。',
      'このクエストの最深部には、あなたの「落ちない脂肪」の<em>本当の理由</em>と、<b>特別チケット入りのたからばこ</b>が眠っています。',
      'いくつかの扉を開けながら、一緒に最深部を目指しましょう。',
    ] },
    { t: 'doors2', key: 'gender', scene: 'doors2', floor: 1, prompt: '最初の分かれ道です。あなたの性別の扉をタップしてください。', opts: [{ l: '女性', v: '女性' }, { l: '男性', v: '男性' }] },
    { t: 'menu', key: 'age', scene: 'door', floor: 2, grid: true, prompt: '年代を教えてください。<small>（診断の精度が上がります）</small>', opts: [{ l: '〜20歳', v: '20歳以下' }, { l: '20代前半', v: '20代前半' }, { l: '20代後半', v: '20代後半' }, { l: '30代前半', v: '30代前半' }, { l: '30代後半', v: '30代後半' }, { l: '40代〜', v: '40代以上' }] },
    { t: 'msgs', scene: 'door', floor: 2, msgs: [
      'ありがとうございます。年代によって脂肪が落ちにくい部位が変わるので、大切な手がかりです。',
      '次の部屋には——この冒険で<b>一番大切な質問</b>が待っています。',
    ] },
    { t: 'menu', key: 'body_parts', scene: 'door', floor: 3, multi: true, prompt: 'いま、<b>一番気になっている部位</b>はどこですか？<small>（複数選択できます）</small>', opts: PARTS_OPTS },
    { t: 'msgs', scene: 'door', floor: 3, msgs: [
      'そこを選びましたか…。実はその部位、<em>普通のダイエットでは最も落としにくいエリア</em>のひとつなんです。',
      'なぜ「部分的に残ってしまう」のか。次の部屋の<b>魔法のクリスタル</b>が、その謎を見せてくれます。',
    ] },
    { t: 'edu', scene: 'crystal', floor: 4 },
    { t: 'menu', key: 'diet', scene: 'door', floor: 5, multi: true, prompt: 'ちなみに、これまでに試したダイエットはありますか？', opts: [{ l: '運動・ジム', v: '運動' }, { l: '食事制限', v: '食事制限' }, { l: 'エステ・マッサージ', v: 'エステ' }, { l: 'サプリ・置き換え', v: 'サプリ' }, { l: '特になし', v: 'なし' }] },
    { t: 'social', scene: 'door', floor: 5 },
    { t: 'reasons', scene: 'tablet', floor: 6 },
    { t: 'ba', scene: 'mirror', floor: 7 },
    { t: 'boss', scene: 'boss', floor: 7 },
    { t: 'msgs', scene: 'door', floor: 7, msgs: [
      'お見事でした！最後に、スルリム式の特徴を整理しますね——',
      '<b>ピンポイントの脂肪におよそ15分</b>。<b>ダウンタイムほぼなし</b>。そして脂肪細胞の"数"を減らすから<em>リバウンドしにくい</em>。',
      'さあ、次はいよいよ<b>最深部</b>。たからばこの部屋です。',
    ] },
    { t: 'chest', scene: 'chest', floor: 8 },
    { t: 'vip', scene: 'flag', floor: 8 },
    { t: 'area', key: 'area', scene: 'flag', floor: 9, prompt: '枠の仮押さえをする<b>最寄りクリニック</b>を探しましょう。お住まいのエリアは？' },
    { t: 'clinic', scene: 'flag', floor: 9 },
    { t: 'cal', scene: 'flag', floor: 9 },
    { t: 'final', scene: 'gate', floor: 10 },
  ];
  const CHEST_IDX = FLOW.findIndex((s) => s.t === 'chest');
  const TOTAL_FLOORS = 10;

  /* ================= 広告計測（ad_count） =================
   * coding-js.md §6 準拠。テンプレの postAdCountStatus は完全コピー（改変禁止）。
   * FLOW は多画面カルーセルではなく独自の線形進行のため、
   * runStep() で1画面進むたびに adCountStatus をインクリメントして送信する。 */
  const adState = { adCountStatus: 3, adCountStatusMax: FLOW.length + 2 };

  const postAdCountStatus = () => {
    if ($.cookie('status_id') < adState.adCountStatusMax) {
      if ($.cookie('status_id') < adState.adCountStatus) {
        const postData = {
          type: 5,
          ad_id: $.cookie('ad_id'),
          status_id: adState.adCountStatus,
        };
        $.ajax({
          type: 'POST',
          url: `./js/ajax.php`,
          data: postData,
        }).done(() => {
          $.cookie('status_id', adState.adCountStatus, {
            expires: 3,
            path: '/',
            domain: location.hostname,
          });
        });
      }
    }
  };

  /* ================= HUD ================= */
  function hud() {
    const s = FLOW[ST.i]; if (!s) return;
    qs('#hFloor').textContent = 'B' + s.floor + 'F';
    const m = qs('#hMap'); m.innerHTML = '';
    for (let f = 1; f <= TOTAL_FLOORS; f++) {
      if (f === 8) {
        const c = ce('div', 'hud__cell hud__cell--chest'); c.innerHTML = px(CHEST_MINI, CHEST_PAL, 2);
        if (s.floor === 8) c.classList.add('is-current');
        m.appendChild(c); continue;
      }
      const c = ce('div', 'hud__cell' + (f < s.floor ? ' done' : f === s.floor ? ' cur' : ''));
      m.appendChild(c);
    }
    const g = ce('div', 'hud__cell hud__cell--goal');
    g.innerHTML = px(['p...', 'pp..', 'ppp.', 'pp..', 'p...', 'p...'], { p: s.floor >= 10 ? '#FFD75E' : '#3B2549' }, 3);
    m.appendChild(g);
  }

  /* ================= SCENE ================= */
  function baseScene(caption) {
    return `<div class="scene__glow"></div>
    <div class="torch torch--l"><div class="torch__light"></div><div class="torch__flame"></div><div class="torch__stick"></div></div>
    <div class="torch torch--r"><div class="torch__light"></div><div class="torch__flame"></div><div class="torch__stick"></div></div>
    <div class="scene__floor"></div>
    ${caption ? `<div class="scn-caption">${caption}</div>` : ''}
    <div class="mirai">${MIRAI_SVG}</div>`;
  }
  function buildScene(s) {
    qs('#app').dataset.tier = doorTier(s.floor);
    const sc = qs('#scene'); let inner = '';
    switch (s.scene) {
      case 'doors2':
        inner = baseScene('') + `<div class="scn-obj scn-obj--pair" id="pairDoors"></div>`; break;
      case 'boss':
        inner = baseScene('けっせん！ しぼうスライム') + `<div class="scn-obj scn-obj--boss">
          <div class="hpwrap"><div class="hp-label" id="hpLabel">スライム HP １００</div><div class="hpbar"><div class="hpbar__fill" id="hpFill"></div></div></div>
          <div class="bigobj slime" id="slime">${px(SLIME_ROWS, SLIME_PAL, 9)}</div>
        </div>`; break;
      case 'crystal':
        inner = baseScene('まほうの クリスタルの ま') + `<div class="scn-obj bigobj">${px(CRYSTAL, CRYSTAL_PAL, 12)}</div>`; break;
      case 'tablet':
        inner = baseScene('いにしえの せきひの ま') + `<div class="scn-obj bigobj">${px(TABLET, TABLET_PAL, 12)}</div>`; break;
      case 'mirror':
        inner = baseScene('しんじつの かがみの ま') + `<div class="scn-obj bigobj">${px(MIRROR, MIRROR_PAL, 12)}</div>`; break;
      case 'chest':
        inner = baseScene('さいしんぶ・たからのま') + `<div class="burst" id="burst"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><div class="scn-obj"><div class="bigobj bigobj--tap" id="chestObj">${px(CHEST_C, CHEST_PAL, 9)}</div><div class="obj-hint obj-hint--wait" id="chestHint">${HAND_S}タップしてあける</div></div>`; break;
      case 'flag':
        inner = baseScene('よやくギルド うけつけ') + `<div class="scn-obj bigobj">${px(FLAG, FLAG_PAL, 12)}</div>`; break;
      case 'gate':
        inner = baseScene('クリア！ ひかりのゲート') + `<div class="scn-obj bigobj bigobj--idle">${px(GATE, GATE_PAL, 11)}</div>`; break;
      default: {
        const left = CHEST_IDX - ST.i;
        inner = baseScene(left > 0 ? zk(`たからばこまで あと${left}のへや`) : '') + `<div class="scn-obj">${doorHTML('door', s.floor)}</div>`;
      }
    }
    sc.innerHTML = inner;
    if (s.scene === 'doors2') {
      const pd = qs('#pairDoors');
      const t2 = DOOR_TIERS[doorTier(s.floor)];
      s.opts.forEach((o, i) => {
        const dp = o.v === '男性' ? DOOR_PAL_M : t2.door;
        const fp = o.v === '男性' ? DOOR_FRAME_M : t2.frame;
        const w = ce('div', 'scn-obj__door-choice', `
          <div class="doorbox doorbox--sm pick" data-i="${i}">
            <div class="doorbox__hole"><div class="doorbox__light"></div>
              <div class="doorbox__pnl doorbox__pnl--l">${px(DOOR_L, dp, 7)}</div>
              <div class="doorbox__pnl doorbox__pnl--r">${px(DOOR_R, dp, 7)}</div>
            </div>
            <div class="doorbox__frame">${px(DOOR_FRAME, fp, 7)}</div>
          </div>
          <div class="door-label">${o.l}</div>`);
        pd.appendChild(w);
      });
    }
  }

  /* ================= MESSAGE (タイプライター) ================= */
  let _typing = false, _skip = false, _tapRes = null;
  qs('#stage').addEventListener('click', (e) => {
    if (e.target.closest('button,select,a,.cal__day,.pref__clear,.pref__date,.doorbox.pick,.cmd__i')) return;
    if (_typing) { _skip = true; return; }
    if (_tapRes) { const r = _tapRes; _tapRes = null; qs('#msgwin').classList.remove('ready'); SFX.blip(); r(); }
  });
  function waitTap() { return new Promise((r) => { qs('#msgwin').classList.add('ready'); _tapRes = r; }); }
  async function typeText(html) {
    html = zk(html);
    const el = qs('#msgT'); _typing = true; _skip = false;
    el.innerHTML = '';
    const tokens = html.match(/<[^>]+>|./gs) || [];
    let buf = '', ti = 0;
    for (const tk of tokens) {
      buf += tk;
      if (_skip) { el.innerHTML = html; break; }
      if (tk.length === 1 && tk !== ' ') { el.innerHTML = buf; if (ti++ % 3 === 0) SFX.tick(); await sl(17); }
      else el.innerHTML = buf;
    }
    el.innerHTML = html; _typing = false;
  }
  async function say(lines, name = 'MIRAI') {
    qs('#msgName').textContent = name;
    for (let i = 0; i < lines.length; i++) { await typeText(lines[i]); await waitTap(); }
  }
  async function sayNoWaitLast(lines, name = 'MIRAI') {
    qs('#msgName').textContent = name;
    for (let i = 0; i < lines.length; i++) {
      await typeText(lines[i]);
      if (i < lines.length - 1) await waitTap();
    }
  }

  /* ================= MENU ================= */
  function menu(opts, { multi = false, grid = false } = {}) {
    return new Promise((res) => {
      const w = ce('div', 'cmd pf' + (grid ? ' cmd--grid' : ''));
      opts.forEach((o) => {
        const b = ce('button', 'cmd__i');
        b.innerHTML = `<span class="cur"></span>${multi ? `<span class="cb">${IC_CHECK}</span>` : ''}<span>${zk(o.l)}</span>`;
        b.dataset.v = o.v; b.dataset.l = o.l;
        b.onclick = () => {
          SFX.blip();
          if (multi) { b.classList.toggle('on'); const n = qsa('.cmd__i.on', w).length; go.disabled = n === 0; }
          else { qsa('.cmd__i', w).forEach((x) => x.classList.remove('on')); b.classList.add('on'); setTimeout(commit, 240); }
        };
        w.appendChild(b);
      });
      let go = null;
      if (multi) {
        go = ce('button', 'cmd__go', '&#9654; これでけってい'); go.disabled = true;
        if (grid) go.classList.add('cmd__go--grid-full');
        go.onclick = commit; w.appendChild(go);
      }
      BODY().appendChild(w); w.scrollIntoView({ block: 'nearest' });
      function commit() {
        const sel = qsa('.cmd__i.on', w); if (!sel.length) return;
        SFX.sel();
        qsa('button', w).forEach((x) => x.classList.add('u-pointer-none'));
        res({ vals: sel.map((x) => x.dataset.v), labels: sel.map((x) => x.dataset.l), el: w });
      }
    });
  }

  /* ================= 部屋移動演出 ================= */
  async function openDoorAndWarp() {
    const d = qs('#door');
    if (d) { SFX.door(); vib(25); d.classList.add('open'); await sl(650); }
    SFX.warp();
    const st = qs('#stage');
    st.classList.add('warp');
    qs('#flash').classList.add('on');
    await sl(620);
    st.classList.remove('warp');
    qs('#flash').classList.remove('on');
  }
  function enterRoom() { const st = qs('#stage'); st.classList.add('enter'); setTimeout(() => st.classList.remove('enter'), 500); }

  /* ================= STEP 実行 ================= */
  async function run() {
    try { await runStep(); }
    catch (err) {
      console.error('step error:', err);
      await typeText('エラーが発生しました。お手数ですが画面を再読み込みしてください。');
    }
  }
  async function runStep() {
    ST.i++;
    const s = FLOW[ST.i]; if (!s) return;

    /* 1画面進むたびに ad_count を送信（coding-js.md §3-3 の「進む」相当） */
    adState.adCountStatus++;
    postAdCountStatus();

    hud(); buildScene(s); BODY().innerHTML = ''; enterRoom();
    switch (s.t) {
      case 'msgs': {
        await say(s.msgs);
        await openDoorAndWarp(); run(); break;
      }
      case 'doors2': {
        await sayNoWaitLast([s.prompt]);
        qsa('#pairDoors .doorbox').forEach((db) => {
          db.onclick = async () => {
            const i = +db.dataset.i; const o = s.opts[i];
            ST.a[s.key] = o.v;
            qsa('#pairDoors .doorbox').forEach((x) => { x.classList.remove('pick'); x.onclick = null; });
            SFX.door(); db.classList.add('open');
            await typeText(`&#9654; <b>${o.l}</b> のとびらが ひらいた！`);
            await sl(550); SFX.warp();
            const st = qs('#stage'); st.classList.add('warp'); qs('#flash').classList.add('on');
            await sl(620); st.classList.remove('warp'); qs('#flash').classList.remove('on');
            run();
          };
        });
        break;
      }
      case 'menu': {
        await sayNoWaitLast([s.prompt]);
        const r = await menu(s.opts, { multi: s.multi, grid: s.grid });
        if (s.multi) ST.a[s.key] = r.vals; else ST.a[s.key] = r.vals[0];
        r.el.remove();
        await typeText(`&#9654; <b>${r.labels.join('、')}</b> をえらんだ！`);
        await sl(500);
        await openDoorAndWarp(); run(); break;
      }
      case 'edu': {
        await sayNoWaitLast(['クリスタルが「部分的に脂肪が残る<em>本当の理由</em>」を映し出しています…'], 'クリスタル');
        const c = ce('div', 'card pf', `
          <div class="card__t">脂肪が"部分的に"残る本当の理由</div>
          <div class="card__b">
            <!-- ▼実素材差し替え: この .imgph ごと <img src="..."> または <video> に置き換え -->
            <div class="imgph">&#9654; 脂肪細胞の変化 イメージ<br/><small>GIF／動画／画像をここに配置</small></div>
            <p>普通のダイエットでは脂肪細胞の<b>大きさ</b>が変わるだけ。<em>数は減りません。</em></p>
            <p>スルリム式は脂肪細胞を<em>最大３５％破壊</em>。数自体を減らすことで、リバウンドしにくい体質へ導きます。</p>
            <div class="edu">
              <div class="edu__c edu__c--d"><strong>大きさ</strong>ダイエット<br/>→細胞は残る<br/>→リバウンド</div>
              <div class="edu__c edu__c--s"><strong>-35%</strong>スルリム式<br/>→細胞の数ごと<br/>→スッキリ</div>
            </div>
          </div>`);
        BODY().appendChild(c); c.scrollIntoView({ block: 'nearest' });
        SFX.get();
        await say(['…ご覧いただけましたか？ つまり<b>「意思の弱さ」のせいではなかった</b>んです。']);
        await openDoorAndWarp(); run(); break;
      }
      case 'social': {
        await sayNoWaitLast(['お気持ち、とてもよく分かります。実は——'], 'MIRAI');
        const c = ce('div', 'soc pf', `このクエストに挑戦した冒険者は 本日 <span class="soc__n" id="liveCount">${getLiveCount().toLocaleString()}</span> 人。<br/>そのうち <b>９３％</b> が「もっと早く知りたかった」と回答しています。`);
        BODY().appendChild(c); startLiveCount();
        await say(['同じ悩みを持つ方の<b>9割以上</b>が、あなたと同じ経験をされています。']);
        await openDoorAndWarp(); run(); break;
      }
      case 'reasons': {
        await sayNoWaitLast(['石碑に、スルリム式が選ばれている<b>5つの理由</b>が刻まれています。'], 'せきひ');
        const data = [
          { n: '01', t: '１回で従来の約５回分', d: 'FDA承認のデオキシコール酸を高濃度配合。少ない回数で効果を実感いただけます', ic: RICO_SYR },
          { n: '02', t: '脂肪細胞を最大３５％破壊', d: '脂肪細胞の"数"自体を減らすため、リバウンドしにくい仕組みです', ic: RICO_BURST },
          { n: '03', t: '１部位およそ１５分', d: '切開不要・麻酔不要。お仕事帰りにも通えます。当日シャワーOK', ic: RICO_CLOCK },
          { n: '04', t: 'ダウンタイムほぼなし', d: '翌日からメイク可能。一時的な腫れや内出血は通常１〜２週間で改善します', ic: RICO_SPARK },
          { n: '05', t: '韓国で大バズの超人気メニュー', d: '韓国で爆発的に流行した施術を、JUNOが日本人の体質に合わせて独自にパワーアップ', ic: RICO_CROWN },
        ];
        for (let i = 0; i < data.length; i++) {
          const r = data[i];
          const el = ce('div', 'rsn pf', `<div class="rsn__row"><span class="rsn__ic">${r.ic}</span><div><div class="rsn__n">REASON ${r.n}</div><div class="rsn__t">${r.t}</div><div class="rsn__d">${r.d}</div></div></div>`);
          BODY().appendChild(el);
          setTimeout(() => { el.classList.add('vis'); SFX.blip(); }, i * 380);
        }
        await sl(data.length * 380 + 300);
        qsa('.rsn', BODY()).at(-1)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        await say(['以上、5つの理由でした。次の部屋には<b>しんじつの鏡</b>——実際の症例があります。']);
        await openDoorAndWarp(); run(); break;
      }
      case 'ba': {
        await sayNoWaitLast(['しんじつの鏡が、実際に施術を受けた方の<b>Before/After</b>を映します。'], 'かがみ');
        const BA = [
          { part: '二の腕', cap: '<b>A様 ２９歳｜二の腕</b> #スルリム１回<br/>半袖の季節に間に合わせたいと来院されました' },
          { part: 'お腹', cap: '<b>Y様 ３２歳｜下腹部</b> #産後<br/>運動では戻らなかった下腹部が２週間で変化' },
          { part: '太もも', cap: '<b>M様 ２７歳｜太もも内側</b> #スキニー<br/>内もものすき間ができたとお喜びの声' },
          { part: 'アゴ下', cap: '<b>S様 ３４歳｜アゴ下</b> #小顔<br/>フェイスラインがシャープに。横顔に自信が持てるように' },
        ];
        const c = ce('div', 'ba pf', `
          <div class="ba__frame">
            <div class="ba__h ba__h--b"><span class="ba__lb">BEFORE</span><span id="baB">実際の症例写真<br/>(${BA[0].part})</span></div>
            <div class="ba__h ba__h--a"><span class="ba__lb">AFTER</span><span id="baA">施術後<br/>(${BA[0].part})</span></div>
          </div>
          <div class="ba__cap" id="baCap">${BA[0].cap}</div>
          <div class="ba__nav">
            <button class="ba__ar" id="baP"><svg viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" stroke-width="3"/></svg></button>
            <div class="ba__ds" id="baDs">${BA.map((_, i) => `<div class="ba__d${i === 0 ? ' on' : ''}"></div>`).join('')}</div>
            <button class="ba__ar" id="baN"><svg viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="3"/></svg></button>
          </div>`);
        BODY().appendChild(c); c.scrollIntoView({ block: 'nearest' });
        let idx = 0;
        const upd = () => {
          qs('#baB').innerHTML = `実際の症例写真<br/>(${BA[idx].part})`;
          qs('#baA').innerHTML = `施術後<br/>(${BA[idx].part})`;
          qs('#baCap').innerHTML = BA[idx].cap;
          qsa('#baDs .ba__d').forEach((d, i) => d.classList.toggle('on', i === idx));
        };
        qs('#baP').onclick = () => { SFX.blip(); idx = (idx - 1 + BA.length) % BA.length; upd(); };
        qs('#baN').onclick = () => { SFX.blip(); idx = (idx + 1) % BA.length; upd(); };
        await say(['矢印で他の症例も見られます。ご覧になったら、画面タップで先へ進みましょう。']);
        await openDoorAndWarp(); run(); break;
      }
      case 'boss': {
        const part = (ST.a.body_parts || [])[0] || 'おなか';
        const bossName = (BOSS_NAMES[part] || 'しぼう') + 'スライム';
        ST.a._boss = bossName;
        BGM.play('boss');
        await say([`……部屋の奥から気配が！ 出ました、あなたの宿敵 <b>${bossName}</b> です！`]);
        qs('#hpLabel').textContent = zk(`${bossName} HP 100`);
        qs('#msgName').textContent = 'バトル';
        await typeText(`<em>スルリム注射で攻撃！</em> スライムを <b>れんだ</b> だ！`);
        let hp = 100, combo = 0, maxCombo = 0, lastHit = 0;
        const slime = qs('#slime');
        await new Promise((res) => {
          slime.addEventListener('click', function hit(e) {
            e.stopPropagation();
            const d = 18 + Math.floor(Math.random() * 10);
            hp = Math.max(0, hp - d);
            const now = Date.now();
            combo = (now - lastHit < 900) ? combo + 1 : 1; lastHit = now;
            maxCombo = Math.max(maxCombo, combo);
            if (combo >= 2) {
              const old = qs('.combo', qs('#scene')); if (old) old.remove();
              qs('#scene').appendChild(ce('div', 'combo' + (combo >= 5 ? ' mx' : ''), `${combo} COMBO!`));
            }
            SFX.hit(); vib(30); shake();
            slime.classList.remove('hit'); void slime.offsetWidth; slime.classList.add('hit');
            const syr = ce('div', 'syr', SYR_SVG);
            syr.style.left = (48 + Math.random() * 16) + '%'; syr.style.top = (46 + Math.random() * 20) + '%';
            qs('#scene').appendChild(syr); setTimeout(() => syr.remove(), 360);
            const dmg = ce('div', 'dmg', `-${d}`);
            dmg.style.left = (34 + Math.random() * 24) + '%'; dmg.style.top = (36 + Math.random() * 18) + '%';
            qs('#scene').appendChild(dmg); setTimeout(() => dmg.remove(), 600);
            qs('#hpFill').style.width = hp + '%';
            qs('#hpLabel').textContent = zk(`${bossName} HP ${hp}`);
            if (hp <= 0) { slime.removeEventListener('click', hit); res(); }
          });
        });
        BGM.stop();
        const old = qs('.combo', qs('#scene')); if (old) old.remove();
        slime.classList.add('dead');
        qs('#hpLabel').textContent = `${bossName} を たおした！`;
        SFX.levelup(); vib([60, 40, 120]);
        victoryFX();
        const title = maxCombo >= 10 ? 'でんせつの討伐王' : maxCombo >= 6 ? '討伐の英雄' : '討伐の勇者';
        ST.a._title = title; ST.a._key = true;
        await sl(1000);
        const bn = ce('div', 'winbanner', '脂肪細胞 ３５％はかい！');
        qs('#scene').appendChild(bn); SFX.get();
        setTimeout(() => bn.remove(), 2800);
        await sl(900);
        qs('#scene').appendChild(ce('div', 'keydrop', KEY_BIG)); SFX.get();
        BGM.play('field');
        qs('#msgName').textContent = 'MIRAI';
        await say([
          `お見事！ いまの攻撃で <b>${bossName}</b> の脂肪細胞を <em>35%はかい</em> しました！`,
          '破壊された脂肪細胞は<em>もう戻りません</em>。実際のスルリム式も、たった1回でこの威力なんです。',
          `称号 <em>「${title}」</em> を かくとく！ さらに <b>たからのカギ</b> を てにいれた！ ……さあ、いよいよ最深部です。`,
        ]);
        await openDoorAndWarp(); run(); break;
      }
      case 'chest': {
        await say([
          'ついに<b>最深部</b>へ到着しました…！ここまでお付き合いいただき、ありがとうございます。',
          '目の前のたからばこには、診断結果に基づいた<em>あなた専用の特別チケット</em>が入っています。',
        ]);
        qs('#chestHint').classList.remove('obj-hint--wait');
        qs('#msgName').textContent = 'たからばこ';
        await typeText('&#9654; たからばこを タップしてあけよう！');
        const chest = qs('#chestObj');
        await new Promise((r) => { chest.onclick = () => { chest.onclick = null; r(); }; });
        if (ST.a._key) {
          await typeText('&#9654; <b>たからのカギ</b> をつかった！ ……カチャリ');
          SFX.sel(); await sl(550);
        }
        chest.classList.remove('bigobj--tap');
        chest.innerHTML = px(CHEST_O, CHEST_PAL, 9);
        qs('#chestHint').remove();
        qs('#burst').classList.add('on');
        SFX.chest(); vib([50, 50, 120]); shake(); fireConfetti();
        BGM.play('clear');
        await typeText('&#9654; <em>たからばこを あけた！</em> 中から3つの特別チケットが あらわれた！');
        await sl(900);
        showGiftPopup();
        break;
      }
      case 'vip': {
        qs('#msgName').textContent = 'MIRAI';
        const c = ce('div', 'card pf pf--gold', `
          <div class="card__t">GIFT ０４ ─ 優先仮押さえ権</div>
          <div class="card__b">
            <p>現在、スルリム式は<b>大変混み合っている</b>状況です。</p>
            <p>特に<em>土日祝やお仕事帰りの時間帯</em>は通常１〜２週間待ちになることも。</p>
            <p class="card__note">このページ限定で、人気枠を含めた<b>優先的な仮押さえ</b>が可能です。次の受付で最寄りクリニックと希望日時をお選びください。</p>
          </div>`);
        BODY().appendChild(c); SFX.get();
        await say(['さらにもうひとつ——<b>優先仮押さえ権</b>もお付けします。この先の「よやくギルド」で使えますよ。']);
        await openDoorAndWarp(); run(); break;
      }
      case 'area': {
        await sayNoWaitLast([s.prompt], 'ギルドうけつけ');
        const r = await menu(Object.keys(CLINICS).map((a) => ({ l: a, v: a })), { grid: true });
        ST.a.area = r.vals[0]; r.el.remove();
        await typeText(`&#9654; <b>${r.labels[0]}</b> のちずを ひらいた！`);
        await sl(450); run(); break;
      }
      case 'clinic': {
        await sayNoWaitLast(['この中から店舗をお選びください。'], 'ギルドうけつけ');
        const list = CLINICS[ST.a.area] || ['新宿店'];
        const f = ce('div', 'field pf', `
          <div class="field__l"><span>店舗選択</span><span class="bdg">必須</span></div>
          <select class="field__sel" id="cSel"><option value="">えらんでください</option>${list.map((c) => `<option value="${c}">${c}</option>`).join('')}</select>
          <p class="field__help">全院カウンセリング無料 ／ 医師が丁寧にヒアリングいたします</p>
          <button class="cmd__go cmd__go--wide" id="cNb" disabled>&#9654; これでけってい</button>`);
        BODY().appendChild(f); f.scrollIntoView({ block: 'nearest' });
        await new Promise((r) => {
          qs('#cSel').onchange = (e) => { qs('#cNb').disabled = !e.target.value; };
          qs('#cNb').onclick = () => { const v = qs('#cSel').value; if (!v) return; ST.a.clinic = v; SFX.sel(); f.remove(); r(); };
        });
        await typeText(`&#9654; <b>${ST.a.clinic}</b> をえらんだ！`);
        await sl(450); run(); break;
      }
      case 'cal': {
        await sayNoWaitLast(['<b>優先仮予約</b>の希望日時を選んでください。<small>LINE経由限定で、土日祝の人気枠（金の印）も対象です</small>'], 'ギルドうけつけ');
        await renderCalendarStep();
        run(); break;
      }
      case 'final': {
        await renderFinal(); break;
      }
    }
  }

  /* ================= 宝箱 → GIFT POPUP ================= */
  function showGiftPopup() {
    const ov = qs('#ov'); const w = qs('#ovWrap');
    w.innerHTML = `
      <div class="ov__head">
        <div class="ov__badge">TREASURE GET!</div>
        <div class="ov__title">あなた専用の<br/>３大特典チケット</div>
        <div class="ov__sub">ダンジョン踏破のごほうびです</div>
      </div>
      <div class="gcard pf pf--pink" id="gc1">
        <div class="gcard__get">&#9654; チケットを てにいれた！</div>
        <div class="gcard__num">GIFT 01</div>
        <div class="gcard__badge">７月末まで！サマーキャンペーン</div>
        <div class="gcard__t">１部位目が さらに半額</div>
        <div class="gcard__old">定価７４，８００円 → <s>９，８００円</s></div>
        <div class="gcard__price">4,900<span class="yen">円</span></div>
        <div class="gcard__note">（税込）/ １部位目</div>
        <div class="gcard__d">期限内に枠の仮押さえ確定で有効化されます</div>
      </div>
      <div class="gcard pf pf--pink" id="gc2">
        <div class="gcard__get">&#9654; チケットを てにいれた！</div>
        <div class="gcard__num">GIFT 02</div>
        <div class="gcard__t">２部位目以降も特別価格</div>
        <div class="gcard__price">14,800<span class="yen">円</span></div>
        <div class="gcard__note">（税込）/ 何部位でもOK ※１部位のみでもOK</div>
      </div>
      <div class="gcard pf pf--pink" id="gc3">
        <div class="gcard__get">&#9654; チケットを てにいれた！</div>
        <div class="gcard__num">GIFT 03</div>
        <div class="gcard__t">人気の美容施術が１つ無料</div>
        <div class="gcard__d">飲む医療ダイエット・ボツリヌス施術・美容内服薬など<br/>お好きなメニューをお選びいただけます</div>
      </div>
      <button class="ov__btn" id="ovClose">&#9654; すべて うけとる</button>`;
    ov.classList.add('show');
    setTimeout(() => { qs('#gc1')?.classList.add('vis'); SFX.get(); }, 250);
    setTimeout(() => { qs('#gc2')?.classList.add('vis'); SFX.get(); }, 650);
    setTimeout(() => { qs('#gc3')?.classList.add('vis'); SFX.get(); }, 1050);
    qs('#ovClose').onclick = () => { SFX.sel(); ov.classList.remove('show'); afterGift(); };
  }
  async function afterGift() {
    let target;
    const stored = store.get('sururim_timer_target');
    if (stored && Number(stored) > Date.now()) target = Number(stored);
    else { target = Date.now() + 24 * 60 * 60 * 1000; store.set('sururim_timer_target', String(target)); }
    window._timerTarget = target;
    const c = ce('div', 'act pf pf--gold', `
      <div class="act__t">３大特典チケットが<br/>すべて有効になりました！</div>
      <div class="act__s">期限内に仮押さえをお済ませください</div>
      <div class="act__lb">ゆうこうきげん</div>
      <div class="act__timer" id="actTimer">23:59:59</div>`);
    BODY().appendChild(c); c.scrollIntoView({ block: 'nearest' });
    qs('#hTimer').classList.add('show');
    tickTimer();
    await say(['チケットには<em>有効期限</em>があります。画面右上にも残り時間を出しておきますね。', 'それでは<b>よやくギルド</b>へ。優先枠の仮押さえに進みましょう！']);
    await openDoorAndWarp(); run();
  }
  let _timerRunning = true;
  function tickTimer() {
    const t = () => {
      if (!_timerRunning) return;
      const rem = Math.max(0, (window._timerTarget || 0) - Date.now());
      const h = String(Math.floor(rem / 3600000)).padStart(2, '0');
      const m = String(Math.floor((rem % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((rem % 60000) / 1000)).padStart(2, '0');
      const str = `${h}:${m}:${s}`;
      const a = qs('#actTimer'); if (a) a.textContent = str;
      const b = qs('#hTimerV'); if (b) b.textContent = str;
      const c2 = qs('#dlTimer'); if (c2) c2.textContent = str;
      requestAnimationFrame(() => { setTimeout(t, 250); });
    }; t();
  }

  /* ================= カレンダー（time-calendar-sync 統合） =================
   * calendar-spec.md 準拠。日付は単一選択＋第1〜第3希望時間（同一日）。
   * clinicId は入力データに ID が無いため、エリア内リストの並び順から暫定生成する
   * （refactoring-spec.md §13 オープン項目3）。 */
  function renderCalendarStep() {
    return new Promise((resolve) => {
      const wrap = ce('div', 'pf', `
        <div id="js-time-calendar-1">
          <div class="js-tc"></div>
          <div class="js-tc-list"></div>
        </div>
        <button class="cmd__go cmd__go--wide" id="calDoneBtn" disabled>&#9654; これでけってい</button>`);
      BODY().appendChild(wrap);
      wrap.scrollIntoView({ block: 'nearest' });

      const $parentEl = qs('#js-time-calendar-1');
      const $doneBtn = qs('#calDoneBtn', wrap);

      const clinicId = (CLINICS[ST.a.area] || []).indexOf(ST.a.clinic) + 1 || 1;
      const cal = embedTimeCalendar({
        parentSelector: '#js-time-calendar-1',
        checkBoxAttrName: 'date_1',
        scheduleFetchUrl: new URL('/js/schedule.php', window.location.origin),
        options: {
          maxSelectedDate: 3,
          useScheduleDummyData: true,
          couponSettings: {
            isAllTimeCoupon: true,
            showStartDays: 0,
            showDays: 7,
            showTimeList: [],
          },
        },
      });
      cal.init();

      const updateDoneState = () => {
        const hasError = $parentEl.hasAttribute('data-tc-is-error');
        const dateChecked = qs('[name="date_1"]:checked', $parentEl);
        const time1 = qs('[name="date_1_time_1"]', $parentEl);
        const ready = hasError || (dateChecked && time1 && time1.value !== '');
        $doneBtn.disabled = !ready;
      };
      $parentEl.addEventListener('change', updateDoneState);

      cal.createCalendar({ params: { clinicId, days: 21 } }).then(updateDoneState);

      $doneBtn.addEventListener('click', () => {
        SFX.sel();
        qsa('button,select', wrap).forEach((el) => { el.disabled = true; });
        (async () => {
          const date = qs('[name="date_1"]:checked', $parentEl)?.value || '';
          const label = date ? formatDate(date, 'M月D日(dow)') : '（追ってLINEでご相談）';
          await typeText(`&#9654; <b>${label}</b> で仮押さえ希望を登録した！`);
          await sl(500);
          await openDoorAndWarp();
          resolve();
        })();
      });
    });
  }

  /* ================= 脂肪タイプ判定（電子カルテ用） ================= */
  function fatType() {
    const tried = (ST.a.diet || []).filter((x) => x !== 'なし');
    const parts = ST.a.body_parts || [];
    if (tried.length >= 2) return {
      name: 'がんこ型しぼう',
      desc: 'いくつものダイエットを生きのびた<b>歴戦の脂肪</b>。運動や食事制限では脂肪細胞の<b>大きさ</b>しか変わらず、<em>数はそのまま</em>だったのが敗因です。あなたの意思の弱さではありません。',
      plan: '細胞の「数」そのものにアプローチする<em>スルリム式（最大３５％破壊）</em>が攻略の近道です。',
    };
    if (tried.length === 1) return {
      name: 'ふっかつ型しぼう',
      desc: '一度は小さくなっても、細胞が残っているかぎり<b>ＨＰが回復（リバウンド）</b>してくるタイプ。がんばりがムダになりやすいのが特徴です。',
      plan: '復活のもとである脂肪細胞ごと破壊し、<em>もう戻らない</em>状態にするのが攻略法です。',
    };
    if (parts.length >= 2) return {
      name: 'ちらばり型しぼう',
      desc: '複数の部位に分かれて陣取るタイプ。全身ダイエットでは<b>各個撃破しにくい</b>のが特徴です。',
      plan: '１部位およそ１５分の<em>ピンポイント攻撃</em>で、気になる部位から順に各個撃破するのが攻略法です。',
    };
    return {
      name: 'かくれ型しぼう',
      desc: '１か所にひそんで動かない<b>ボス型</b>。まわりは痩せてもそこだけ残りやすいのが特徴です。',
      plan: '弱点をねらった<em>ピンポイント攻撃（１部位およそ１５分）</em>が最も刺さる攻略法です。',
    };
  }

  /* ================= FINAL ================= */
  async function renderFinal() {
    qs('#msgName').textContent = 'MIRAI';
    const a = ST.a;
    const $checkedDate = qs('[name="date_1"]:checked');
    const dateLabel = $checkedDate ? zk(formatDate($checkedDate.value, 'M月D日(dow)')) : '（追ってLINEでご相談）';
    await sayNoWaitLast(['<em>クエストクリア、おめでとうございます！</em>まずは冒険の記録——<b>あなたの脂肪タイプ診断書</b>です。']);
    const ft = fatType();
    const karte = ce('div', 'karte pf pf--gold', `
      <div class="karte__head"><h3>でんしカルテ ─ 脂肪タイプ診断書</h3><span>No.Q-${String(Math.floor(1000 + Math.random() * 9000))}</span></div>
      <div class="karte__type">
        <div class="karte__lb">あなたのタイプ</div>
        <div class="karte__name">${ft.name}</div>
      </div>
      <div class="karte__desc"><p>${ft.desc}</p><p>${ft.plan}</p></div>
      <div class="karte__rows">
        <div class="karte__r"><span class="karte__k">対象部位</span><span class="karte__v">${zk((a.body_parts || []).join('・') || '—')}</span></div>
        <div class="karte__r"><span class="karte__k">年代</span><span class="karte__v">${zk(a.age || '—')}</span></div>
        <div class="karte__r"><span class="karte__k">試した対策</span><span class="karte__v">${zk((a.diet || []).join('・') || 'なし')}</span></div>
        <div class="karte__r"><span class="karte__k">獲得した称号</span><span class="karte__v">${a._title || '討伐の勇者'}（${a._boss || 'しぼうスライム'}撃破）</span></div>
      </div>
      <div class="karte__note">※このカルテはLINE追加でセーブされます。セーブしないと消えてしまいます</div>`);
    BODY().appendChild(karte); karte.scrollIntoView({ block: 'nearest' }); SFX.get();
    await say(['この診断書は<b>LINEにセーブ</b>できます。つづいて、手に入れた<b>戦利品</b>の一覧です！']);
    const inv = ce('div', 'inv pf', `
      <div class="inv__head"><h3>&#9654; てにいれた アイテム</h3><p>LINE追加で電子カルテ情報が自動送信されます</p></div>
      <div class="inv__list">
        <div class="inv__i"><span class="ic">${IC_TICKET}</span><div class="inv__info"><b>１部位目 サマー特価</b>７月末までのキャンペーン適用 <small>定価７４，８００円→<s>９，８００円</s>→さらに半額</small></div><span class="inv__val">4,900円</span></div>
        <div class="inv__i"><span class="ic">${IC_CHEST}</span><div class="inv__info"><b>２部位目以降</b>何部位でも <small>※１部位のみでもOK</small></div><span class="inv__val">14,800円</span></div>
        <div class="inv__i"><span class="ic">${IC_HEART}</span><div class="inv__info"><b>人気美容施術</b>１つ無料プレゼント</div><span class="inv__val">0円</span></div>
        <div class="inv__i"><span class="ic">${IC_KEY}</span><div class="inv__info"><b>優先仮予約</b>${a.clinic || '—'}<br/><small>${dateLabel}</small></div><span class="inv__val">確保済</span></div>
        ${a._boss ? `<div class="inv__i"><span class="ic">${IC_HEART}</span><div class="inv__info"><b>称号「${a._title || '討伐の勇者'}」</b>${a._boss}を撃破（脂肪細胞３５％破壊）</div><span class="inv__val">GET</span></div>` : ''}
        ${(a.body_parts || []).map((p, idx) => `<div class="inv__i"><span class="ic">${IC_CHECK}</span><div class="inv__info"><b>${p}</b>${idx === 0 ? '１部位目 サマー特価' : '２部位目以降 特別価格'}</div><span class="inv__val">${idx === 0 ? '4,900円' : '14,800円'}</span></div>`).join('')}
      </div>`);
    BODY().appendChild(inv);
    const lineCard = ce('div', 'card pf', `
      <div class="card__t card__t--green">LINE追加でできること</div>
      <div class="card__b card__b--sm">
        <p>・特典チケットはすべて<b>LINEに自動送信</b>されます</p>
        <p>・仮押さえの情報も届くため<b>再入力は不要</b>です</p>
        <p>・予約日の変更や施術のご質問も<b>LINEからOK</b></p>
      </div>`);
    BODY().appendChild(lineCard);
    BODY().appendChild(ce('div', 'urg-wrap', `<div class="urg">このページからの登録は 本日あと残り１２名</div>`));
    const dl = ce('div', 'deadline pf pf--gold', `
      <div class="deadline__lb">チケットの受け取り期限</div>
      <div class="deadline__tm" id="dlTimer">23:59:59</div>
      <div class="deadline__tx">期限を過ぎるとチケットは<b>消えてしまいます</b>。<br/>このままLINE追加で、すべての特典が<br/>あなたのLINEに届きます。</div>
      <div class="deadline__tx deadline__tx--sm">消したい場所の脂肪を、思う存分破壊してください</div>`);
    BODY().appendChild(dl);
    BODY().appendChild(ce('footer', 'footer', `※自由診療／副作用:内出血・腫れ・鈍痛(１〜２週間)／効果には個人差があります<br/><a href="#">運営者情報</a><a href="#">プライバシーポリシー</a>`));
    BODY().classList.add('is-cta-visible');
    inv.scrollIntoView({ block: 'nearest' });
    if (!window._timerTarget) {
      const stored = store.get('sururim_timer_target');
      window._timerTarget = stored && Number(stored) > Date.now() ? Number(stored) : Date.now() + 24 * 60 * 60 * 1000;
      tickTimer();
    }
    qs('#fcta').classList.add('show');
    SFX.chest(); fireConfetti();
    await typeText('&#9654; 下のボタンから<b>LINE追加</b>で、冒険の戦利品をすべて受け取ってください！');
  }

  /* ================= CTA (Lステップ連携) =================
   * addParamsToCtaUrl は取得項目・アカウントID・mapping ID 以外は
   * coding-js.md §5 のテンプレ構造を改変していない。
   * refactoring-spec.md §10 の var_* マッピングに準拠。 */
  const addParamsToCtaUrl = () => {
    const requestClinic = ST.a.clinic ?? '';

    const $checkedDate = $('[name="date_1"]:checked');
    const requestDate = $checkedDate.val() ?? '';
    const requestFormattedDate = formatDate(requestDate, 'MM月DD日(dow)');

    const requestTime1 = $('[name="date_1_time_1"]').val() ?? '';
    const requestTime2 = $('[name="date_1_time_2"]').val() ?? '';
    const requestTime3 = $('[name="date_1_time_3"]').val() ?? '';

    const isCalendarError = $('[data-tc-is-error]').length > 0;
    const errorCodes = [];
    isCalendarError && errorCodes.push('E01_カレンダー表示');

    const botBasicId = $('[name="bot_basic_id"]').val().trim();
    const varMapping = {};

    switch (botBasicId) {
      case CONFIG.BOT_BASIC_ID:
        varMapping[CONFIG.VAR_IDS.gender] = ST.a.gender;
        varMapping[CONFIG.VAR_IDS.age] = ST.a.age;
        varMapping[CONFIG.VAR_IDS.body_parts] = (ST.a.body_parts || []).join(',');
        varMapping[CONFIG.VAR_IDS.diet_history] = (ST.a.diet || []).join(',');
        varMapping[CONFIG.VAR_IDS.coupon] = ST.a.coupon;
        varMapping[CONFIG.VAR_IDS.clinic_area] = ST.a.area;
        varMapping[CONFIG.VAR_IDS.clinic] = requestClinic;

        if (!isCalendarError) {
          varMapping[CONFIG.VAR_IDS.reserve_date1] = requestFormattedDate;
          varMapping[CONFIG.VAR_IDS.reserve_time1] = requestTime1;
          varMapping[CONFIG.VAR_IDS.reserve_time2] = requestTime2;
          varMapping[CONFIG.VAR_IDS.reserve_time3] = requestTime3;
        }

        varMapping[CONFIG.VAR_IDS.lp_source] = CONFIG.LP_ID;
        break;
    }

    $('.js-cta-link').each((_, element) => {
      const $link = $(element);
      const url = new URL($link.attr('data-href'));

      Object.keys(varMapping).forEach((key) => {
        url.searchParams.set(`var_${key}`, varMapping[key]);
      });

      $link.attr('href', url.toString());
    });
  };

  /**
   * CTAボタンクリック時の処理
   */
  const onClickCtaBtn = () => {
    try {
      if (window.gtag) gtag('event', 'conversion', { send_to: 'LINE_ADD' });
      if (window.fbq) fbq('track', 'Lead');
    } catch (e) {
      console.warn('tracking error', e);
    }
    addParamsToCtaUrl();
  };
  $('.js-cta-link').on('click', onClickCtaBtn);

  /**
   * 日付フォーマット（coding-js.md §4 準拠・改変禁止）
   */
  function formatDate(date, format) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const pad = (n) => String(n).padStart(2, '0');

    const tokens = [
      ['YYYY', d.getFullYear()],
      ['MM', pad(d.getMonth() + 1)],
      ['DD', pad(d.getDate())],
      ['hh', pad(d.getHours())],
      ['mm', pad(d.getMinutes())],
      ['ss', pad(d.getSeconds())],
      ['dow', ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]],

      ['M', d.getMonth() + 1],
      ['D', d.getDate()],
      ['h', d.getHours()],
      ['m', d.getMinutes()],
      ['s', d.getSeconds()],
    ];

    return tokens.reduce((result, [key, value]) => {
      return result.replace(new RegExp(key, 'g'), value);
    }, format);
  }

  /* ================= LIVE COUNT ================= */
  function getLiveCount() {
    const now = new Date();
    const todayKey = 'sururim_dgn_count_' + now.toDateString();
    const stored = store.get(todayKey);
    if (stored) return Number(stored);
    const h = now.getHours(); const m = now.getMinutes();
    const hourWeights = [2, 1, 1, 0, 0, 0, 3, 8, 18, 32, 45, 58, 70, 80, 88, 95, 105, 115, 122, 128, 132, 135, 120, 60];
    let base = 0; for (let i = 0; i < h; i++) base += hourWeights[i] || 10;
    base += Math.floor((hourWeights[h] || 10) * m / 60);
    base += 800 + Math.floor(Math.random() * 200);
    store.set(todayKey, String(base));
    return base;
  }
  let _liveCountTimerId = null;
  function startLiveCount() {
    _liveCountTimerId = setInterval(() => {
      const el = qs('#liveCount'); if (!el) return;
      const cur = parseInt(el.textContent.replace(/,/g, '')) || 1000;
      if (Math.random() < 0.6) {
        const next = cur + Math.floor(Math.random() * 2) + 1;
        el.textContent = next.toLocaleString();
        store.set('sururim_dgn_count_' + new Date().toDateString(), String(next));
      }
    }, 5000);
  }

  /* 離脱・非表示時に setInterval / requestAnimationFrame ループをまとめて停止 */
  document.addEventListener('pagehide', () => {
    BGM.stop();
    _timerRunning = false;
    if (_liveCountTimerId) clearInterval(_liveCountTimerId);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) BGM.stop();
  });

  /* ================= CONFETTI（ピクセル紙吹雪） ================= */
  function fireConfetti() {
    const cv = qs('#confetti'); const ctx = cv.getContext('2d');
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    const colors = ['#FF4785', '#FF9FBE', '#FFD75E', '#FFF6EC', '#62E088', '#FFB5CC'];
    const ps = [];
    for (let i = 0; i < 110; i++) { ps.push({ x: cv.width / 2 + Math.random() * 180 - 90, y: cv.height / 2 - 80, vx: (Math.random() - .5) * 13, vy: Math.random() * -13 - 4, s: Math.floor(Math.random() * 3) * 3 + 6, c: colors[Math.floor(Math.random() * colors.length)], a: 1 }); }
    let frame = 0; const maxF = 170;
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach((p) => { p.vy += .3; p.x += p.vx; p.y += p.vy; p.a = Math.max(0, 1 - frame / maxF);
        ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x / 3) * 3, Math.round(p.y / 3) * 3, p.s, p.s); });
      ctx.globalAlpha = 1;
      frame++; if (frame < maxF) requestAnimationFrame(draw); else ctx.clearRect(0, 0, cv.width, cv.height);
    }
    draw();
  }

  /* ================= TITLE / KICKOFF ================= */
  function initTitle() {
    qs('#tBattle').innerHTML = `
      <div class="title__hero">${px(MIRAI_ROWS, MIRAI_PAL, 6)}<span class="t-syr">${SYR_SVG}</span></div>
      <span class="vs">VS</span>
      <div class="title__foe">${px(SLIME_ROWS, SLIME_PAL, 8)}<span class="t-emote">!!</span></div>`;
    const st = qs('#tStars');
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 1.4) + 's';
      if (Math.random() < .3) s.classList.add('is-big');
      st.appendChild(s);
    }
    qs('#tStart').onclick = async () => {
      SFX.warp();
      BGM.play('field');
      qs('#title').classList.add('hide');
      await sl(450);
      run();
    };
    store.set('sururim_quest_save', '');
  }
  qs('#hSnd').onclick = () => { sndOn = !sndOn; drawSnd(); if (sndOn) SFX.blip(); };

  /* $(() => {...}) 自体が DOM 準備完了を待つため、DOMContentLoaded の二重登録は不要 */
  drawSnd(); initTitle(); hud();
  qs('#tapHand').innerHTML = HAND_SVG;
  postAdCountStatus();
});
