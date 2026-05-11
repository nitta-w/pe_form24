import { embedTimeCalendar } from './time-calendar-sync/main.js';

// デバッグ時のみ true に。本番は必ず false に戻す。
const DEBUG_MODE = false;

$(() => {
  let _advanceSurvey = null;

  surveyController();
  initBeforeAfter();
  initCouponPopup();

  // チャット形式の診断フロー本体。STEPS をシナリオとして順に流す。
  function surveyController() {

    const ICO = {
      chk:     `<svg viewBox="0 0 14 14"><path d="M11 4L6 9L3 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
      arr:     `<svg viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      gift:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="8" width="18" height="13"/><path d="M12 8v13M3 12h18"/><path d="M12 8c-2-3-5-4-5-2s3 2 5 2 5 0 5-2-3-1-5 2z"/></svg>`,
      star:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
      cal:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      clock:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      tag:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
      heart:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
      syringe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 2l4 4M15 5l6 6-11 11H4v-6L15 5z"/><path d="M8 16l-2-2"/></svg>`,
      crown:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20M3 7l4 6 5-8 5 8 4-6v11H3z"/><circle cx="12" cy="13" r="1" fill="currentColor"/></svg>`,
      shield:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 5v7c0 5 4 9 9 10 5-1 9-5 9-10V5l-9-3z"/><path d="M9 12l2 2 4-4"/></svg>`,
      diamond: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 6 3-6M12 9l-3 12M12 9l3 12"/></svg>`,
      pill:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="8" y="2" width="8" height="20" rx="4"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
      trophy:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v4a6 6 0 01-12 0V4z"/><path d="M6 6H3v2a3 3 0 003 3M18 6h3v2a3 3 0 01-3 3M10 14h4v4h-4z"/><path d="M7 22h10"/></svg>`,
      finger:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5a2 2 0 014 0v9"/><path d="M13 9a2 2 0 014 0v5"/><path d="M17 11a2 2 0 014 0v5a6 6 0 01-6 6h-1c-2 0-3-1-4-2l-7-7a2 2 0 012-3"/></svg>`,
    };

    // diet 選択に「筋トレ」が含まれるかで訴求軸を切り替える
    function getProfile() {
      const checked = [];
      $('[name="diet"]:checked').each((_, el) => checked.push($(el).val()));
      return checked.some(v => v.startsWith('筋トレ')) ? 'muscle' : 'ease';
    }

    // 表示名 → API の area_id
    const AREA_IDS = {
      '北海道・東北': '1', '関東': '2', '中部': '3',
      '関西': '4', '中国・四国': '5', '九州・沖縄': '6',
    };

    // チャットのシナリオ定義。type で振る舞いが分岐する。
    const STEPS = [
      { id: 'intro', type: 'bot', auto: true, msgs: [
        'ようこそ。プライベートコンサルタントの <strong>KENT</strong> でございます。',
        '本日は、<em>切らず・筋肉は残したまま</em>・<em>皮下脂肪細胞の"数"を破壊</em>し、リバウンドしにくい身体へ導く医療プログラム「<strong>スルリム式 for MEN</strong>」をご案内させていただきます。',
        'いくつかお伺いさせてください。',
      ]},
      { id: 'age', type: 'choice', key: 'age', grid: true, prompt: 'まず、お客様の年代をお聞かせいただけますでしょうか。', opts: [
        { l: '17歳以下・高校生', v: '17歳以下・高校生' }, { l: '18〜19歳<br><span>※高校生を除く</span>', v: '18〜19歳' },
        { l: '20代', v: '20代' }, { l: '30代', v: '30代' },
        { l: '40代', v: '40代' }, { l: '50代', v: '50代' },
        { l: '60代', v: '60代' }, { l: '70代以上', v: '70代以上' },
      ]},
      { id: 'e1', type: 'bot', auto: true, msgs: [
        'かしこまりました。',
        '男性のお身体は<strong>30代以降、基礎代謝が年1%ずつ低下</strong>し、筋肉量は変わらずとも皮下脂肪だけが残りやすくなります。',
        'では——<strong>最も重要なご質問</strong>をさせてください。',
      ]},
      { id: 'parts', type: 'choice', key: 'body_part', multi: true,
        prompt: '<strong>現在、最も気になっていらっしゃる部位</strong>はどちらでしょうか。<br><small>複数お選びいただけます</small>', opts: [
          { l: '下腹部 ─ ぽっこり',     v: '下腹部 ─ ぽっこり'    },
          { l: '脇腹 ─ 浮き輪肉',       v: '脇腹 ─ 浮き輪肉'      },
          { l: '上腹部 ─ 腹筋が隠れる', v: '上腹部 ─ 腹筋が隠れる'    },
          { l: 'アゴ下 ─ 二重アゴ',     v: 'アゴ下 ─ 二重アゴ'    },
          { l: '胸まわり ─ バスト脂肪', v: '胸まわり ─ バスト脂肪'      },
          { l: '背中 ─ ハミ肉',         v: '背中 ─ ハミ肉'      },
          { l: '太もも ─ 内側・付根',   v: '太もも ─ 内側・付根' },
          { l: '二の腕 ─ 上腕',         v: '二の腕 ─ 上腕'    },
      ]},
      { id: 'e2', type: 'bot', auto: true, msgs: [
        '承知いたしました。',
        'お客様が選ばれた部位は、<em>筋トレでも食事制限でも落ちにくい「皮下脂肪」</em>の代表格でいらっしゃいます。',
        'なぜそこだけ残り続けるのか、そのメカニズムをご説明させていただきます。',
      ]},
      { id: 'edu', type: 'edu' },
      { id: 'diet', type: 'choice', key: 'diet', multi: true,
        prompt: '差し支えなければ、これまで取り組まれた減量法をお聞かせください。', opts: [
          { l: '筋トレ・ジム',       v: '筋トレ・ジム'   },
          { l: 'ランニング・有酸素', v: 'ランニング・有酸素'   },
          { l: '糖質制限',           v: '糖質制限' },
          { l: 'ファスティング',     v: 'ファスティング' },
          { l: 'プロテイン・サプリ', v: 'プロテイン・サプリ'   },
          { l: '特に無し',           v: '特に無し'     },
      ]},
      { id: 'e3', type: 'bot', auto: true, special: 'social', msgsFn: () => {
        if (getProfile() === 'muscle') {
          return [
            'ご共有ありがとうございます。',
            '弊院のコンサルテーションを受けられた30〜40代男性のうち、<strong>94%</strong>が「<em>筋トレはしているが、腹筋が皮下脂肪で隠れている</em>」というお悩みを抱えていらっしゃいました。',
          ];
        }
        return [
          'ご共有ありがとうございます。',
          '弊院のコンサルテーションを受けられた30〜40代男性のうち、<strong>94%</strong>が「<em>運動や食事制限は続かない、でも"そこだけ"何とかしたい</em>」と本音をお聞かせくださいました。',
        ];
      }},
      { id: 'reasons',         type: 'reasons'         },
      { id: 'ba',              type: 'ba'              },
      { id: 'merit', type: 'merit' },
      { id: 'coupon',          type: 'coupon'          },
      { id: 'reserve-benefit', type: 'reserve-benefit' },
      { id: 'area',            type: 'area'            },
      { id: 'clinic',          type: 'clinic'          },
      { id: 'reserve',         type: 'reserve'         },
      { id: 'final',           type: 'final'           },
    ];

    // 進捗バー・計測カウントの対象になるステップ種別
    const USER_STEP_TYPES   = ['choice', 'area', 'clinic', 'reserve', 'coupon', 'ba'];
    const USER_STEP_INDICES = STEPS
      .map((s, i) => USER_STEP_TYPES.includes(s.type) ? i : -1)
      .filter(i => i !== -1);

    // 進捗バーで GIFT アイコンを出す位置（クーポンステップが何問目か）
    const GIFT_STEPS = [
      USER_STEP_INDICES.indexOf(STEPS.findIndex(s => s.id === 'coupon')),
    ];

    let _idx = 0; // STEPS の現在位置
    const state = {
      step: 0,                                 // ユーザー操作の進捗（進捗バー用）
      totalUserStep: USER_STEP_INDICES.length, // 進捗バーの総数
      adCountStatus: 3,                        // 計測ステータスID（初期値3）
      adCountStatusMax: USER_STEP_INDICES.length + 2,
    };
    let _sn  = false; // 直前がユーザー操作だったか（true のときだけ自動スクロール）
    let _sct;         // scrollToEl の debounce タイマー

    const sl = ms => DEBUG_MODE ? Promise.resolve() : new Promise(r => setTimeout(r, ms));

    // common.js の autoplay 対象から外した動画（js-ignore-video-play）を
    // 自前の IntersectionObserver で再生／停止する。
    function initDynamicVideos(container) {
      const videos = container.querySelectorAll('video.js-dynamic-video');
      if (!videos.length) return;

      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.play().catch(() => {});
          } else {
            entry.target.pause();
          }
        });
      }, { threshold: 0.1 });

      videos.forEach((v) => {
        v.muted = true;
        v.play().catch(() => {});
        io.observe(v);
      });
    }

    // インラインSVGアイコンを span で包んで返す。w でサイズ可変。
    function icon(name, w = 18) {
      return `<span class="ico" style="width:${w}px;height:${w}px">${ICO[name] || ''}</span>`;
    }

    function $chat() { return $('#js-chat'); }

    // ボット側の吹き出し
    function addBot(html) {
      const $w = $('<div class="msg msg--b">');
      $w.html(AVSV + `<div class="bbl">${html}</div>`);
      $chat().append($w);
      return $w;
    }

    // ユーザー側の吹き出し
    function addUsr(text) {
      const $w = $('<div class="msg msg--u"><div class="bbl"></div></div>');
      $w.find('.bbl').text(text); // XSS対策で textContent
      $chat().append($w);
      return $w;
    }

    // ボット発言の代わりにカード（症例・ギフト等）を表示
    function addCard(html) {
      const $w = $('<div class="msg msg--b">');
      $w.html(AVSV + `<div class="card-wrap">${html}</div>`);
      $chat().append($w);
      return $w;
    }

    // 「・・・」のタイピング演出。ms 経過後に自分で消える。
    async function showTyp(ms = 800) {
      if (DEBUG_MODE) return;
      const $w = $('<div class="msg msg--b">');
      $w.html(AVSV + '<div class="typ"><span></span><span></span><span></span></div>');
      $chat().append($w);
      if (_sn) scrollToEl($w[0]);
      await sl(ms);
      $w.remove();
    }

    // 短時間に連続で呼ばれても 120ms debounce してまとめて1回だけスクロール
    function scrollToEl(el) {
      if (!el) return;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      clearTimeout(_sct);
      _sct = setTimeout(() => {
        el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      }, 120);
    }

    const AVSV = `<div class="av-s" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="#C9A96E"><path transform="translate(1.4,8.55) scale(0.3)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path transform="translate(6.6,4.825) scale(0.45)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path transform="translate(15.4,8.55) scale(0.3)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>`;

    // 進捗バーの再描画
    function prog() {
      const $bars = $('#js-prog-bars');
      const total = state.totalUserStep;
      const cur   = Math.min(state.step, total);
      const giftIcon = `<div class="prog__icon" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13"/><path d="M12 8v13"/><path d="M3 12h18"/><path d="M12 8c-2-3-5-4-5-2s3 2 5 2 5 0 5-2-3-1-5 2z"/></svg></div>`;
      const barsHtml = Array.from({ length: total }, (_, i) => {
        const cls = i < cur ? 'prog__s done' : i === cur ? 'prog__s cur' : 'prog__s';
        return `<div class="${cls}">${GIFT_STEPS.includes(i) ? giftIcon : ''}</div>`;
      }).join('');
      $bars.html(barsHtml);
      $('#js-prog-label').text(`Step ${cur + 1} / ${total}`);
      const rem = Math.max(0, total - cur);
      $('#js-prog-rem').text(rem > 0 ? `あと${rem}問` : 'COMPLETED');
    }

    // 次のステップへ。ユーザー操作のステップだけ進捗カウントを更新する。
    function next() {
      const completedType = STEPS[_idx]?.type;
      const isUserAction  = USER_STEP_TYPES.includes(completedType);
      _idx++;
      if (isUserAction) {
        state.step++;
        state.adCountStatus++;
        postAdCountStatus();
      }
      _sn = isUserAction;
      if (_idx < STEPS.length) render().catch(err => console.error('[render error]', err));
    }

    _advanceSurvey = () => next();

    // 現在の STEPS[_idx] を type で振り分けて描画する
    async function render() {
      const s = STEPS[_idx];
      if (!s) return;
      prog();

      switch (s.type) {

        case 'bot': {
          const botMsgs = s.msgsFn ? s.msgsFn() : s.msgs;
          for (let i = 0; i < botMsgs.length; i++) {
            await showTyp(600 + i * 100);
            const $m = addBot(botMsgs[i]);
            if (i === 0 && _sn) scrollToEl($m[0]);
            await sl(250);
          }
          if (s.special === 'social') {
            await sl(200);
            addCard(
              `<div class="soc">
                <div class="soc__dots" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
                <div class="soc__txt">本日 <strong class="js-live-count">800</strong> 名の男性がコンサルテーションを完了<br><strong>89%</strong> が「もっと早く知りたかった」とご回答</div>
              </div>`
            );
            initLiveCount();
          }
          if (s.auto) { await sl(400); next(); }
          break;
        }

        case 'choice': {
          await showTyp(600);
          const $p = addBot(s.prompt);
          scrollToEl($p[0]);
          await sl(200);
          renderOpts(s);
          break;
        }

        case 'edu': {
          await showTyp(700);
          const $ec = addCard(
            `<div class="card">
              <div class="card__t">なぜ"そこだけ"脂肪が落ちないのか</div>
              <div class="card__b">
                <div class="edu__video">
                  <video src="img/edu_fat.mp4" preload="none" loop muted playsinline class="js-ignore-video-play js-dynamic-video"></video>
                </div>
                <p>運動・食事制限・筋トレ——どの方法でも、脂肪細胞の<em>サイズ</em>が縮むだけで、<strong>数は減りません。</strong></p>
                <p>だから、少し食べすぎたり運動を止めれば <em>残った脂肪細胞</em> がすぐ膨らみ、元通りに戻ってしまいます。</p>
                <p>スルリム式は<strong>脂肪細胞の"数"自体を最大35%破壊</strong>。筋肉・血管・神経には作用させず、気になる部位の皮下脂肪だけを選択的に除去します。</p>
              </div>
            </div>`
          );
          if (_sn) scrollToEl($ec[0]);
          initDynamicVideos($ec[0]);
          await sl(800);
          next();
          break;
        }

        case 'reasons': {
          await showTyp(700);
          const $rm = addBot('男性のお客様にスルリム式が選ばれる<strong>5つの理由</strong>をご紹介いたします。');
          if (_sn) scrollToEl($rm[0]);
          const p = getProfile();
          const reasons = [
            p === 'muscle'
              ? { num:'01', title:'皮下脂肪だけを選択除去',      desc:'筋肉・血管・神経には作用せず、脂肪細胞のみに反応する医療成分を使用。鍛えた筋量はそのまま保持されます',    ico:'shield'  }
              : { num:'01', title:'運動せずに皮下脂肪を破壊',     desc:'脂肪細胞のみに反応する医療成分が、気になる部位の皮下脂肪だけをピンポイントで除去。辛い運動も食事我慢も不要です',  ico:'shield'  },
            p === 'muscle'
              ? { num:'02', title:'脂肪細胞を最大35%破壊',       desc:'細胞の"数"自体を減らすため、再肥大しにくい。筋トレやリバウンド対策が効きやすい体へ',                    ico:'diamond' }
              : { num:'02', title:'脂肪細胞"数"を最大35%破壊',   desc:'細胞の数そのものを減らすから、食べすぎても戻りにくい。「痩せては戻る」の無限ループから抜け出せます',        ico:'diamond' },
            { num:'03', title:'1部位およそ15分の施術',       desc:'切開不要・麻酔不要。お仕事帰りのアポイントでも対応可能です。当日シャワー・翌日出社OK',                   ico:'clock'   },
            { num:'04', title:'翌日から商談・会食OK',         desc:'ダウンタイムほぼなし。一時的な腫れや内出血は通常1〜2週間で改善いたします',                              ico:'crown'   },
            { num:'05', title:'韓国で男性向けに大バズ',       desc:'ソウル・江南エリアの男性に爆発的に流行した施術を、JUNOが日本人男性の体質に合わせて独自に最適化',          ico:'trophy'  },
          ];
          const html = reasons.map(r =>
            `<div class="rsn"><div class="rsn__img"><video src="img/reason${r.num}.mp4" preload="none" loop muted playsinline class="js-ignore-video-play js-dynamic-video"></video></div>
             <div class="rsn__body"><div class="rsn__num">Reason ${r.num}</div>
             <div class="rsn__title">${r.title}</div>
             <div class="rsn__desc">${r.desc}</div></div></div>`
          ).join('');
          const $reasonsCard = addCard(
            `<div><div class="reasons" id="js-reasons-scroll">${html}</div>
             <div class="rsn-arrow" aria-hidden="true">${icon('arr', 16)}</div></div>`
          );
          initDynamicVideos($reasonsCard[0]);
          // 横スクロールできることを匂わせるための軽いオートスクロール
          setTimeout(() => {
            const rs = document.getElementById('js-reasons-scroll');
            if (!rs) return;
            let pos = 0;
            const scroll = () => { pos += 0.8; rs.scrollLeft = pos; if (pos < 120) requestAnimationFrame(scroll); };
            scroll();
          }, 800);
          await sl(4000);
          next();
          break;
        }

        case 'ba': {
          if (DEBUG_MODE) { await sl(0); next(); break; }
          await showTyp(700);
          const $bm = addBot('実際に施術を受けられた方の症例をご覧いただけます。');
          if (_sn) scrollToEl($bm[0]);
          await sl(300);
          // 任意のタイミングで開いてもらうため、ボタンを押すまで先に進めない
          const $baBtn = $('<div class="nbw nbw--c">').html(
            `<button class="nb nb--ba">${icon('star', 14)} スルリム式 Before / After</button>`
          );
          $chat().append($baBtn);
          await new Promise(resolve => {
            $baBtn.find('.nb').one('click', () => { $baBtn.remove(); resolve(); });
          });
          renderBA();
          await sl(2000);
          next();
          break;
        }

        case 'merit': {
          await renderMerit();
          break;
        }

        case 'coupon': {
          await showTyp(900);
          const $cm1 = addBot('ここまでお時間をいただき、誠にありがとうございます。');
          if (_sn) scrollToEl($cm1[0]);
          await sl(300);
          addBot('コンサルテーション結果に基づき、<strong>あなた様専用の特典</strong>を封入させていただきました。');
          await sl(300);
          addBot('下のスクラッチカードで、特典の内容をお確かめください。');
          await sl(300);
          // ボタン押下でスクラッチカードを開く（制御は initCouponPopup 側 → showScratchCard）
          const $cpnBtn = $('<div class="nbw nbw--c">').html(
            `<button class="nb nb--cpn js-scratch-open-btn">
              ${icon('diamond', 16)} スクラッチで特典を獲得
            </button>`
          );
          $chat().append($cpnBtn);
          if (_sn) scrollToEl($cpnBtn[0]);
          break;
        }

        case 'reserve-benefit': {
          await showTyp(700);
          const $rb = addCard(
            `<div class="card card--gold">
              <div class="card__t card__t--gold">GIFT 04 ─ 優先仮押さえ権</div>
              <div class="card__b">
                <p>現在、スルリム式 for MEN は <strong class="em--acc">大変混み合っている</strong> 状況でございます。</p>
                <p>特に <strong class="em--acc em--ul">土日祝やお仕事帰りの時間帯</strong> は通常2〜3週間待ちとなっております。</p>
                <p class="card__note">
                  ${icon('crown', 14)} <strong>このページ限定</strong>にて、人気枠を含めた<strong class="em--pk">優先的な仮押さえ</strong>をご案内可能です。次のステップで最寄りクリニックと希望日時をお選びください。
                </p>
              </div>
            </div>`
          );
          if (_sn) scrollToEl($rb[0]);
          await sl(2200);
          next();
          break;
        }

        case 'area': {
          await showTyp(600);
          const $am = addBot('枠の仮押さえをさせていただく<strong>最寄りクリニック</strong>をお選びください。');
          scrollToEl($am[0]);
          await sl(200);
          renderAreaOpts();
          break;
        }

        case 'clinic': {
          await showTyp(500);
          const $cm = addBot('ご希望の店舗をお選びくださいませ。');
          scrollToEl($cm[0]);
          await sl(200);
          renderClinic();
          break;
        }

        case 'reserve': {
          await showTyp(600);
          const $rv = addBot(
            `${icon('cal', 16)} <strong>優先仮予約</strong>の日時をお選びください。<br><small>LINE経由限定にて <strong>土日祝の人気枠</strong> もご予約可能でございます</small>`
          );
          scrollToEl($rv[0]);
          await sl(200);
          renderCal();
          break;
        }

        case 'final':
          await showTyp(900);
          await renderFinal();
          break;
      }
    }

    // 選択肢の描画。multi=true ならチェックボックス＋次へボタン、false ならラジオで選択即遷移。
    function renderOpts(s) {
      const inputType = s.multi ? 'checkbox' : 'radio';
      const groupName = s.key;
      const optCls    = s.multi ? 'opt opt--m' : (s.grid ? 'opt opt--g' : 'opt');

      const optsHtml = s.opts.map(o => `
        <label class="${optCls}">
          <input type="${inputType}" name="${groupName}" value="${o.v}" class="opt__input">
          ${o.l}
        </label>`).join('');

      const $w = $(`<div class="opts">${optsHtml}</div>`);
      $chat().append($w);

      let $nbW;
      if (s.multi) {
        $nbW = $(`<div class="nbw"><button class="nb" disabled>次へ ${icon('arr', 12)}</button></div>`);
        $nbW.find('.nb').on('click', () => commit());
        $chat().append($nbW);

        $w.on('change', '.opt__input', function () {
          $(this).closest('.opt').toggleClass('sel', $(this).prop('checked'));
          $nbW.find('.nb').prop('disabled', $w.find('.opt__input:checked').length === 0);
        });
      } else {
        $w.on('change', '.opt__input', function () {
          $w.find('.opt__input').prop('disabled', true);
          $w.find('.opt').removeClass('sel');
          $(this).closest('.opt').addClass('sel');
          setTimeout(() => commit(), 280);
        });
      }

      scrollToEl($w[0]);

      if (DEBUG_MODE) {
        $w.find('.opt__input').first().prop('checked', true).trigger('change');
        if (s.multi) setTimeout(() => $nbW.find('.nb').trigger('click'), 0);
      }

      // 確定処理：選択肢をロックして、選んだ内容をユーザー側吹き出しに表示
      function commit() {
        const $checked = $w.find('.opt__input:checked');
        if (!$checked.length) return;
        $w.find('.opt__input').prop('disabled', true);
        $w.find('.opt').css('pointer-events', 'none');
        if ($nbW) $nbW.remove();

        const labels = $checked.toArray().map(el => $(el).closest('label').text().trim());
        addUsr(s.multi ? labels.join('、') : labels[0]);
        next();
      }
    }

    // diet 分岐でカード内容を切り替えるリッチメリットカード。
    async function renderMerit() {
      await showTyp(700);
      const $tm = addBot('症例をご覧いただきありがとうございます。');
      if (_sn) scrollToEl($tm[0]);
      await sl(300);

      const p = getProfile();
      const m1 = p === 'muscle'
        ? { ico: 'shield', title: '皮下脂肪のみ狙い撃ち',       desc: '筋肉・血管・神経には作用させず、<br>鍛え上げた筋量はそのまま保持' }
        : { ico: 'shield', title: '運動せずに皮下脂肪を削ぐ',    desc: '運動や食事我慢を頑張らずとも、<br>気になる部位の脂肪だけピンポイント除去' };
      const m3 = p === 'muscle'
        ? { ico: 'diamond', title: '脂肪細胞の"数"を破壊',       desc: '最大35%を削減し、<br>再肥大しにくい身体へ' }
        : { ico: 'diamond', title: '脂肪細胞の"数"を破壊',       desc: '最大35%を削減。<br>多少食べても戻りにくい体質に' };
      const footCopy = p === 'muscle'
        ? '多忙なエグゼクティブの方々にも選ばれております'
        : '運動嫌い・続けるのが苦手な方にも選ばれております';

      const $mc = addCard(
        `<div class="card card--merit">
          <div class="card__t">MERIT ─ スルリム式 for MEN</div>
          <ul class="merit-list">
            <li>
              <span class="merit-ico">${icon(m1.ico, 18)}</span>
              <div class="merit-body"><strong>${m1.title}</strong><span>${m1.desc}</span></div>
            </li>
            <li>
              <span class="merit-ico">${icon('clock', 18)}</span>
              <div class="merit-body"><strong>1部位およそ15分</strong><span>切開・麻酔不要。<br>翌日から商談・会食もOK</span></div>
            </li>
            <li>
              <span class="merit-ico">${icon(m3.ico, 18)}</span>
              <div class="merit-body"><strong>${m3.title}</strong><span>${m3.desc}</span></div>
            </li>
          </ul>
          <div class="card__foot">${footCopy}</div>
        </div>`
      );
      if (_sn) scrollToEl($mc[0]);
      await sl(500);
      next();
    }

    // Before/After 症例カードの初期描画。スライド制御は initBeforeAfter 側のイベント委譲で行う。
    function renderBA() {
      const BA = [
        { part: '下腹部', cap: '<strong>T様 30代｜下腹部</strong> <span class="ba-tag">#スルリム1回</span><br>筋トレで腹筋は鍛えていたが、皮下脂肪で隠れて見えなかった腹筋が表に' },
        { part: '脇腹',   cap: '<strong>M様 40代｜脇腹</strong> <span class="ba-tag">#スーツ</span><br>スーツのウエストラインがスッキリ。オーダーを作り直さずにサイズダウン' },
        { part: 'アゴ下', cap: '<strong>K様 30代｜アゴ下</strong> <span class="ba-tag">#若見え</span><br>フェイスラインがシャープに。会食やオンライン会議で第一印象が変化' },
        { part: '背中',   cap: '<strong>S様 20代｜背中</strong> <span class="ba-tag">#男らしさ</span><br>Tシャツの見え方に変化が' },
      ];
      const slides = BA.map((b, i) =>
        `<div class="js-ba-slide">
          <div class="ba-h"><span class="ba-lb">BEFORE</span><img src="img/ba_0${i + 1}_before.webp" width="160" height="200" loading="lazy" alt="${b.part} 施術前"></div>
          <div class="ba-h"><span class="ba-lb ba-lb--a">AFTER</span><img src="img/ba_0${i + 1}_after.webp" width="160" height="200" loading="lazy" alt="${b.part} 施術後"></div>
        </div>`
      ).join('');
      const dots = BA.map((_, i) =>
        `<div class="ba-d${i === 0 ? ' on' : ''}" data-i="${i}" role="tab" aria-label="症例${i + 1}" aria-selected="${i === 0}"></div>`
      ).join('');

      addCard(
        `<div class="ba-card">
          <div class="ba-hdr">
            <div class="ba-av" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="#C9A96E"><path transform="translate(1.4,8.55) scale(0.3)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path transform="translate(6.6,4.825) scale(0.45)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path transform="translate(15.4,8.55) scale(0.3)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
            <div class="ba-mt"><strong>sururim_for_men</strong><small>Case Gallery</small></div>
          </div>
          <div class="ba-car">
            <div class="ba-sls" id="js-ba-slide">${slides}</div>
            <button class="ba-ar js-ba-prev" aria-label="前の症例"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M13 4L7 10L13 16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
            <button class="ba-ar js-ba-next" aria-label="次の症例"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
          </div>
          <div class="js-ba-dots" role="tablist">${dots}</div>
          <div class="js-ba-caption">${BA[0].cap}</div>
        </div>`
      );
    }

    // 6エリア（北海道・東北 〜 九州・沖縄）のラジオを表示。選択即 next。
    function renderAreaOpts() {
      const optsHtml = Object.keys(AREA_IDS).map(area => `
        <label class="opt opt--g">
          <input type="radio" name="area" value="${area}" class="opt__input">
          ${area}
        </label>`).join('');

      const $w = $(`<div class="opts">${optsHtml}</div>`);
      $chat().append($w);
      scrollToEl($w[0]);

      $w.on('change', '.opt__input', function () {
        const area = $(this).val();
        $w.find('.opt__input').prop('disabled', true);
        $w.find('.opt').removeClass('sel');
        $(this).closest('.opt').addClass('sel');
        setTimeout(() => {
          $w.find('.opt').css('pointer-events', 'none');
          addUsr(area);
          next();
        }, 280);
      });
    }

    // 選択エリアの area_id を投げてクリニック一覧を取得し、select に流し込む。
    // 失敗時は data-clinic-list-error を立てて、addParamsToCtaUrl の分岐で参照される。
    async function renderClinic() {
      const selectedArea = $('[name="area"]:checked').val() || '';
      const areaId = AREA_IDS[selectedArea] || selectedArea;

      const $f = $('<div class="field" id="js-clinic-selector">').html(
        `<div class="field__l"><span>Clinic</span><span class="bdg">必須</span></div>
         <select name="clinic_shop" class="field__sel" disabled>
           <option value="">読み込み中...</option>
         </select>
         <p class="field__help">${icon('chk', 12)} 全院カウンセリング無料 ／ 男性経験豊富な医師が丁寧にヒアリング</p>`
      );
      $chat().append($f);

      const $clinicSelect = $f.find('[name="clinic_shop"]');

      const $nbW = $(`<div class="nbw"><button class="nb" disabled>次へ ${icon('arr', 12)}</button></div>`);
      const $nb  = $nbW.find('.nb');
      $chat().append($nbW);

      $clinicSelect.on('change', function () {
        $nb.prop('disabled', !$(this).val());
      });

      $nb.on('click', () => {
        const v = $clinicSelect.val();
        const isError = $clinicSelect.is('[data-clinic-list-error]');
        if (!v && !isError) return;
        $clinicSelect.prop('disabled', true);
        $nbW.remove();
        addUsr(v || '店舗未選択');
        next();
      });

      scrollToEl($f[0]);

      function buildOptions(data) {
        const optHtml = data.map(item => `<option value="${item.value}" data-clinic-id="${item.clinic_id}">${item.label}</option>`).join('');
        $clinicSelect.html(`<option value="">選択してください</option>${optHtml}`);
      }

      try {
        const requestUrl = new URL('./js/sururim_list.php', window.location.origin);
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ area_id: areaId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error status: ${response.status}`);
        }

        const data = await response.json();
        buildOptions(data);

      } catch (e) {
        console.error(e);
        /**
        // デバック用
        const data = [
          { clinic_id: 1, value: '札幌店', label: '札幌店（大森駅）' },
        ];
        buildOptions(data);
        */
        $clinicSelect.attr('data-clinic-list-error', '');
        $f.append('<p class="field__error">現在、アクセスが集中しております。店舗を選択せずにそのままお進みください。</p>');
        $nb.prop('disabled', false);
      } finally {
        if (!$clinicSelect.is('[data-clinic-list-error]')) {
          $clinicSelect.prop('disabled', false);
        }
      }
    }

    // 共通カレンダーモジュールを埋め込み、選択クリニックの空き枠を取得。
    // 日付＋第1・第2・第3希望時間が揃ったら「次へ」を有効化する。
    async function renderCal() {
      const $container = $('<div id="js-time-calendar-1">').html(
        '<div class="js-tc"></div><div class="js-tc-list"></div>'
      );
      const $card = $('<div class="cal-card">').append($container);
      $chat().append($card);
      scrollToEl($card[0]);

      const cal = embedTimeCalendar({
        parentSelector: '#js-time-calendar-1',
        checkBoxAttrName: 'date_1',
        scheduleFetchUrl: './js/sururim_schedule.php',
        options: {
          maxSelectedDate: 3,
          couponSettings: {
            isAllTimeCoupon: true,
            showStartDays: 0,
            showDays: 7,
            showTimeList: [],
          },
        },
      });
      cal.init();
      const $selectedOpt = $('[name="clinic_shop"] option:selected');
      const clinicId = parseInt($selectedOpt.attr('data-clinic-id'), 10) || 0;
      await cal.createCalendar({ params: { clinicId, days: 21 } });

      const $nbw = $('<div class="nbw nbw--cal">').html(
        `<button class="nb" id="calDone" disabled>次へ <svg viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>`
      );
      $nbw.insertAfter($card);

      const isCalError = () => $('[data-tc-is-error]').length > 0;

      if (isCalError()) {
        $nbw.find('#calDone').prop('disabled', false);
      }

      const getSelectedDate = () => $container.find('[name="date_1"]:checked').val() || '';
      const isCalReady = () =>
        getSelectedDate() !== '' &&
        $container.find('[name="date_1_time_1"]').val() !== '' &&
        $container.find('[name="date_1_time_2"]').val() !== '' &&
        $container.find('[name="date_1_time_3"]').val() !== '';

      $container.on('change', '[name="date_1"], [name^="date_1_time_"]', () => {
        $nbw.find('#calDone').prop('disabled', !isCalReady());
      });

      $nbw.on('click', '#calDone', () => {
        const date = getSelectedDate();
        const times = [1, 2, 3]
          .map((n) => $container.find(`[name="date_1_time_${n}"]`).val())
          .filter((v) => v !== '');

        $container.find('button, select, input').prop('disabled', true);
        $nbw.find('#calDone').prop('disabled', true);

        if (!date) {
          addUsr('日時未選択');
        } else {
          const dateLabel = formatDate(date, 'M/D(dow)');
          const timeLabel = times.length
            ? times.map((t, i) => `第${i + 1}希望時間: ${t}`).join('\n')
            : '時間未選択';
          addUsr(`${dateLabel}\n${timeLabel}`);
        }
        next();
      });
    }

    // 最終画面：獲得ギフト一覧、LINE誘導、カウントダウンタイマーをまとめて表示。
    // 表示後に固定CTAとフッターを is-active で出す。
    async function renderFinal() {
      const clinic        = $('[name="clinic_shop"]').val()?.trim() ?? '';
      const date          = $('[name="date_1"]:checked').val() ?? '';
      const formattedDate = formatDate(date, 'M/D(dow)');
      const time1         = $('[name="date_1_time_1"]').val()?.trim() ?? '';
      const time2         = $('[name="date_1_time_2"]').val()?.trim() ?? '';
      const time3         = $('[name="date_1_time_3"]').val()?.trim() ?? '';

      const bodyParts = [];
      $('[name="body_part"]:checked').each((_, el) => bodyParts.push($(el).val()));
      const bodyPartLabel = bodyParts.join('・') || '未選択';

      const timeLines = [time1, time2, time3]
        .filter(t => t)
        .map((t, i) => `<br>第${i + 1}希望時間：${t}`)
        .join('');

      const isReserveBlank = !clinic || !date;
      const reserveDetail = isReserveBlank
        ? '店舗未選択<br>日時未選択'
        : `${clinic}<br>希望日：${formattedDate}${timeLines}`;
      const reserveVal = isReserveBlank
        ? `<div class="gift__val gift__val--muted">未選択</div>`
        : `<div class="gift__val">確保済</div>`;

      const $giftCard = addCard(
        `<div class="gift">
          <div class="gift__head"><h3>本日のあなた様専用特典</h3><p>LINE追加でコンサルテーション結果が自動送信されます</p></div>
          <div class="gift__list">
            <div class="gift__item"><div class="gift__ico">${icon('diamond', 16)}</div><div class="gift__info"><strong>初回プレミアム価格</strong>1部位目</div><div class="gift__val">9,800円</div></div>
            <div class="gift__item"><div class="gift__ico">${icon('crown', 16)}</div><div class="gift__info"><strong>2部位目以降</strong></div><div class="gift__val">14,800円～</div></div>
            <div class="gift__item"><div class="gift__ico">${icon('pill', 16)}</div><div class="gift__info"><strong>人気の医療施術</strong>1つ無料プレゼント</div><div class="gift__val">0円</div></div>
            <div class="gift__item"><div class="gift__ico">${icon('cal', 16)}</div><div class="gift__info"><strong>優先仮予約</strong><small class="gift__detail">${reserveDetail}</small></div>${reserveVal}</div>
            <div class="gift__item"><div class="gift__ico">${icon('chk', 16)}</div><div class="gift__info"><strong>${bodyPartLabel}</strong>初回プレミアム価格</div><div class="gift__val">9,800円</div></div>
          </div>
        </div>`
      );
      scrollToEl($giftCard[0]);

      addCard(
        `<div class="card card--line">
          <div class="card__t card__t--line">LINEお友達追加でできること</div>
          <div class="card__b card__b--lg">
            <p>${icon('chk', 13)} <strong>ベネフィット・詳細案内はすべてLINEに自動送信</strong></p>
            <p>${icon('chk', 13)} 仮押さえ情報もLINEに届くため<strong>再入力不要</strong></p>
            <p>${icon('chk', 13)} 予約変更・施術に関するご質問も<strong>LINEから直接可能</strong></p>
          </div>
        </div>`
      );
      await sl(400);
      addCard(`<div class="urg">本ページからの登録は <strong>本日あと残り12名様</strong></div>`);

      await sl(300);
      addCard(
        `<div class="timer-box">
          <div class="timer-box__label">Gift Valid Until</div>
          <div class="timer-box__time"><span class="js-act-timer">23:59:59</span></div>
          <div class="timer-box__note">期限を過ぎますと特典は無効となります</div>
          <div class="timer-box__cta">このままLINE追加にて<br>すべての特典を受領いただけます</div>
          <div class="timer-box__sub">鍛えた筋肉の輪郭を、<br>余分な皮下脂肪から取り戻してください</div>
        </div>`
      );

      // 固定CTAが文末にかぶらないよう余白を足す
      $chat()[0].style.paddingBottom = '7rem';
      $('.js-fixed-btn').addClass('is-active');
      $('.page-footer').addClass('is-active');
      initActivatedTimer();
    }

    // 入力結果を Lステップ用の var_xxx として CTA リンクに付与する。
    // クリニック取得・カレンダーがエラー時はその項目をスキップし、errorCodes でエラー内容を渡す。
    const addParamsToCtaUrl = () => {
      const age = $('[name="age"]:checked').val()?.trim() ?? '';

      const selectedBodyParts = [];
      $('[name="body_part"]:checked').each((_, el) => selectedBodyParts.push($(el).val()));
      const bodyPart = selectedBodyParts.length ? `,${selectedBodyParts.join(',')},` : '';

      const selectedDiets = [];
      $('[name="diet"]:checked').each((_, el) => selectedDiets.push($(el).val()));
      const diet = selectedDiets.length ? `,${selectedDiets.join(',')},` : '';

      const requestClinic = $('[name="clinic_shop"]').val()?.trim() ?? '';

      const $checkedDate         = $('[name="date_1"]:checked');
      const requestDate          = $checkedDate.val() ?? '';
      const requestFormattedDate = formatDate(requestDate, 'M月D日(dow)');
      const isCouponDay          = $checkedDate.attr('data-tc-is-coupon-day') === 'true';
      const isToday              = $checkedDate.attr('data-tc-is-today') === 'true';

      const requestTime1 = $('[name="date_1_time_1"]').val() ?? '';
      const requestTime2 = $('[name="date_1_time_2"]').val() ?? '';
      const requestTime3 = $('[name="date_1_time_3"]').val() ?? '';

      const isClinicListError = $('[data-clinic-list-error]').length > 0;
      const isCalendarError   = $('[data-tc-is-error]').length > 0;
      const errorCodes = [];
      isCalendarError   && errorCodes.push('E01_カレンダー表示');
      isClinicListError && errorCodes.push('E02_店舗表示');

      const botBasicId = $('[name="bot_basic_id"]').val().trim();
      const varMapping = {};

      switch (botBasicId) {
        case '897vblrf':
          varMapping['2184988'] = age;
          varMapping['2184994'] = bodyPart;
          varMapping['2615634'] = diet;

          if (!isClinicListError) {
            varMapping['2184547'] = requestClinic;
          }

          if (!isClinicListError && !isCalendarError) {
            varMapping['2184549'] = requestFormattedDate;
            varMapping['2184551'] = requestTime1;
            varMapping['2349620'] = requestTime2;
            varMapping['2387138'] = requestTime3;

            varMapping['2460256'] = isCouponDay
              ? '日時特典あり'
              : '日時特典なし';

            if (isToday) {
              varMapping['2433744'] = '当日希望';
            }
          }

          varMapping['2504096'] = errorCodes;

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

    // 計測ステータスを ajax.php に送信。Cookie に既に同等以上のステータスがあるなら何もしない。
    const postAdCountStatus = () => {
      if ($.cookie('status_id') < state.adCountStatusMax) {
        if ($.cookie('status_id') < state.adCountStatus) {
          const postData = {
            type: 5,
            ad_id: $.cookie('ad_id'),
            status_id: state.adCountStatus,
          };
          $.ajax({
            type: 'POST',
            url: `./js/ajax.php`,
            data: postData,
          }).done(() => {
            $.cookie('status_id', state.adCountStatus, {
              expires: 3,
              path: '/',
              domain: location.hostname,
            });
          });
        }
      }
    };

    // CTAクリックの瞬間に最新の入力値で URL を組み直す
    $(document).on('click', '.js-cta-link', () => {
      addParamsToCtaUrl();
    });

    postAdCountStatus();
    render().catch(err => console.error('[render:init]', err));
  }

  // Before/After スライダーの操作（前後ボタン・ドット・スワイプ）を document に委譲して登録。
  // 中身（DOM）は renderBA で後から挿入されるので、初回ロード時に静的に bind できない。
  function initBeforeAfter() {
    const BA_CAPS = [
      '<strong>T様 30代｜下腹部</strong> <span class="ba-tag">#スルリム1回</span><br>筋トレで腹筋は鍛えていたが、皮下脂肪で隠れて見えなかった腹筋が表に',
      '<strong>M様 40代｜脇腹</strong> <span class="ba-tag">#スーツ</span><br>スーツのウエストラインがスッキリ。オーダーを作り直さずにサイズダウン',
      '<strong>K様 30代｜アゴ下</strong> <span class="ba-tag">#若見え</span><br>フェイスラインがシャープに。会食やオンライン会議で第一印象が変化',
      '<strong>S様 20代｜背中</strong> <span class="ba-tag">#男らしさ</span><br>Tシャツの見え方に変化が',
    ];
    let baIdx = 0;

    const updateBA = () => {
      $('#js-ba-slide').css('transform', `translateX(-${baIdx * 100}%)`);
      $('.js-ba-dots .ba-d').each((i, el) => {
        $(el).toggleClass('on', i === baIdx).attr('aria-selected', String(i === baIdx));
      });
      $('.js-ba-caption').html(BA_CAPS[baIdx]); // BA_CAPS は定数のため innerHTML 許容
    };

    $(document).on('click', '.js-ba-prev', () => { baIdx = (baIdx - 1 + BA_CAPS.length) % BA_CAPS.length; updateBA(); });
    $(document).on('click', '.js-ba-next', () => { baIdx = (baIdx + 1) % BA_CAPS.length; updateBA(); });
    $(document).on('click', '.js-ba-dots .ba-d', function () { baIdx = parseInt($(this).data('i'), 10); updateBA(); });

    // 横スワイプ：差分が 40px を超えたら前後に切り替え
    let _txStart = 0;
    $(document).on('touchstart', '#js-ba-slide', (e) => { _txStart = e.originalEvent.touches[0].clientX; }, { passive: true });
    $(document).on('touchend',   '#js-ba-slide', (e) => {
      const diff = e.originalEvent.changedTouches[0].clientX - _txStart;
      if (Math.abs(diff) > 40) { baIdx = diff < 0 ? (baIdx + 1) % BA_CAPS.length : (baIdx - 1 + BA_CAPS.length) % BA_CAPS.length; updateBA(); }
    }, { passive: true });
  }

  // クーポンモーダルの開閉。閉じたタイミングで「特典が有効になりました」のカードを出す。
  function initCouponPopup() {
    const $overlay = $('.js-coupon-overlay');
    let _prevFocus = null;

    const openCoupon = () => {
      _prevFocus = document.activeElement;
      $overlay.addClass('is-active');
      $overlay.scrollTop(0);
      fireConfetti();
      // 3 枚のギフトカードを時間差でフェードイン
      setTimeout(() => $('#js-cpn-card-1').addClass('is-visible'),  300);
      setTimeout(() => $('#js-cpn-card-2').addClass('is-visible'),  700);
      setTimeout(() => $('#js-cpn-card-3').addClass('is-visible'), 1100);
    };

    const closeCoupon = () => {
      if (_prevFocus) $(_prevFocus).trigger('focus');
      $overlay.removeClass('is-active');
      showActivatedCard();
    };

    // スクラッチカードを表示。40% 削れたら自動で全消去 → 受領ボタン → openCoupon。
    // surveyController スコープの icon()/ICO は参照できないため SVG をインライン展開する。
    const SC_TROPHY = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v4a6 6 0 01-12 0V4z"/><path d="M6 6H3v2a3 3 0 003 3M18 6h3v2a3 3 0 01-3 3M10 14h4v4h-4z"/><path d="M7 22h10"/></svg>`;
    const SC_FINGER = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5a2 2 0 014 0v9"/><path d="M13 9a2 2 0 014 0v5"/><path d="M17 11a2 2 0 014 0v5a6 6 0 01-6 6h-1c-2 0-3-1-4-2l-7-7a2 2 0 012-3"/></svg>`;

    const showScratchCard = () => {
      const $sc = $(
        `<div class="js-scratch-overlay" role="dialog" aria-modal="true" aria-label="スクラッチカード">
          <div class="sc-wrap">
            <div class="sc-header__badge">For You Only</div>
            <div class="sc-header__title">あなた様専用の特典<em>Scratch to Reveal</em></div>
            <div class="js-scratch-card">
              <div class="sc-unlock-glow"></div>
              <div class="sc-reveal">
                <div class="sc-trophy">${SC_TROPHY}</div>
                <div class="sc-lucky">LUCKY</div>
                <div class="sc-congrats">おめでとうございます</div>
                <div class="sc-detail">3 Premium Benefits Unlocked</div>
              </div>
              <canvas class="js-scratch-canvas"></canvas>
              <div class="js-scratch-finger">
                <div class="sc-finger__icon">${SC_FINGER}</div>
                <div class="sc-finger__text">指でこすってください</div>
              </div>
            </div>
            <div class="sc-progress"><div class="js-scratch-bar"></div></div>
            <div class="js-scratch-hint">金箔の下に、あなた様だけの特典を…</div>
          </div>
        </div>`
      );
      $('body').append($sc);
      // 次フレームで is-active を付けてフェードイン
      requestAnimationFrame(() => $sc.addClass('is-active'));

      const canvas = $sc.find('.js-scratch-canvas')[0];
      const $card  = $sc.find('.js-scratch-card');
      const $finger = $sc.find('.js-scratch-finger');
      const $bar   = $sc.find('.js-scratch-bar');
      const $hint  = $sc.find('.js-scratch-hint');
      const ctx    = canvas.getContext('2d');

      const setupCanvas = () => {
        const rect = $card[0].getBoundingClientRect();
        const w = rect.width  > 10 ? rect.width  : 320;
        const h = rect.height > 10 ? rect.height : w * 0.8;
        canvas.width  = Math.max(1, Math.floor(w * 2));
        canvas.height = Math.max(1, Math.floor(h * 2));

        // メタリックゴールド風のグラデーション
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0,    '#8B7339');
        g.addColorStop(0.25, '#C9A96E');
        g.addColorStop(0.5,  '#E4C889');
        g.addColorStop(0.75, '#C9A96E');
        g.addColorStop(1,    '#6E5A2C');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 粒子テクスチャ
        for (let i = 0; i < 1200; i++) {
          ctx.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .15})`;
          ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
        }
        // 斜めハイライトライン
        ctx.globalAlpha = .25;
        for (let i = -canvas.height; i < canvas.width; i += 40) {
          ctx.strokeStyle = 'rgba(255,255,255,.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + canvas.height, canvas.height);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // SCRATCH HERE テキスト
        ctx.font = `700 ${Math.floor(canvas.width * .08)}px "Cormorant Garamond", serif`;
        ctx.fillStyle = 'rgba(11,14,26,.85)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S C R A T C H', canvas.width / 2, canvas.height / 2 - canvas.width * .06);
        ctx.font = `600 ${Math.floor(canvas.width * .055)}px "Cormorant Garamond", serif`;
        ctx.fillText('HERE', canvas.width / 2, canvas.height / 2 + canvas.width * .02);
        ctx.font = `500 ${Math.floor(canvas.width * .028)}px "Noto Serif JP", serif`;
        ctx.fillStyle = 'rgba(11,14,26,.6)';
        ctx.fillText('COAT YOUR REWARD', canvas.width / 2, canvas.height / 2 + canvas.width * .08);
      };
      setupCanvas();

      let isDrawing = false;
      let unlocked = false;
      let lastProgressCheck = 0;

      const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        const pt = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
        const rw = r.width  > 0 ? r.width  : canvas.width  / 2;
        const rh = r.height > 0 ? r.height : canvas.height / 2;
        return {
          x: (pt.clientX - r.left) * (canvas.width  / rw),
          y: (pt.clientY - r.top)  * (canvas.height / rh),
        };
      };

      const checkProgress = () => {
        try {
          const step = Math.floor(canvas.width / 40);
          let transparent = 0, total = 0;
          for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
              const d = ctx.getImageData(x, y, 1, 1).data;
              if (d[3] < 128) transparent++;
              total++;
            }
          }
          const pct = transparent / total;
          // データ駆動の数値値：CSS では width 0% 〜 100% を超えうるので JS で制御
          $bar[0].style.width = Math.min(100, pct * 250) + '%';
          if (pct >= 0.4 && !unlocked) {
            unlocked = true;
            $hint.text('取得権利が確定しました');
            triggerUnlock();
          }
        } catch (err) {
          console.warn('[scratch progress check error]', err);
        }
      };

      const scratch = (x, y) => {
        if (unlocked) return;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        const radius = Math.max(30, canvas.width * .08);
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        const now = performance.now();
        if (now - lastProgressCheck > 120) {
          lastProgressCheck = now;
          checkProgress();
        }
      };

      const triggerUnlock = () => {
        $sc.addClass('is-unlocked');
        ctx.globalCompositeOperation = 'destination-out';
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const maxR = Math.hypot(canvas.width, canvas.height) / 1.8;
        let r = maxR * 0.3;
        const sweep = () => {
          r += maxR * 0.06;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          if (r < maxR) {
            setTimeout(sweep, 16);
          } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // 受け取りボタンを表示
            setTimeout(() => {
              const $btn = $('<button class="js-scratch-claim" type="button">ベネフィットを受け取る</button>');
              $sc.find('.sc-wrap').append($btn);
              setTimeout(() => $btn.addClass('is-visible'), 20);
              $btn.on('click', () => {
                $sc.removeClass('is-active');
                setTimeout(() => {
                  $sc.remove();
                  openCoupon();
                }, 400);
              });
            }, 400);
          }
        };
        sweep();
      };

      // mouse
      canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        $finger.addClass('is-hidden');
        const p = getPos(e); scratch(p.x, p.y);
      });
      canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const p = getPos(e); scratch(p.x, p.y);
      });
      window.addEventListener('mouseup', () => { isDrawing = false; });

      // touch
      canvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        $finger.addClass('is-hidden');
        const p = getPos(e); scratch(p.x, p.y);
      }, { passive: true });
      canvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const p = getPos(e); scratch(p.x, p.y);
      }, { passive: false });
      canvas.addEventListener('touchend', () => { isDrawing = false; }, { passive: true });
    };

    $(document).on('click', '.js-scratch-open-btn', (e) => {
      $(e.currentTarget).closest('.nbw').hide();
      showScratchCard();
    });
    $(document).on('click', '.js-coupon-open-btn', (e) => {
      $(e.currentTarget).closest('.nbw').hide();
      openCoupon();
    });
    $(document).on('click', '.js-coupon-close',    closeCoupon);
    $(document).on('keydown', (e) => { if (e.key === 'Escape' && $overlay.hasClass('is-active')) closeCoupon(); });
  }

  // クーポンモーダルを閉じた後の演出カード。表示後に次のステップへ自動で進める。
  function showActivatedCard() {
    const sparkles = Array.from({ length: 12 }, () => {
      const x = (Math.random() * 100).toFixed(1);
      const y = (Math.random() * 100).toFixed(1);
      const d = (Math.random() * 2).toFixed(2);
      return `<div class="activated__sparkle" style="left:${x}%;top:${y}%;animation-delay:${d}s" aria-hidden="true"></div>`;
    }).join('');

    const $wrap = $('<div class="act-wrap">').html(
      `<div class="activated">
        <div class="act-ribbon"><div class="act-bow"><span></span></div>SPECIAL GIFT ACTIVATED</div>
        <div class="activated__sparkles" aria-hidden="true">${sparkles}</div>
        <div class="activated__inner">
          <div class="activated__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18"/><path d="M12 8c-2-3-5-4-5-2s3 2 5 2 5 0 5-2-3-1-5 2z"/></svg></div>
          <div class="activated__title">あなた様専用の特典が<br>すべて有効になりました</div>
          <div class="activated__sub">期限内に枠の仮押さえをお済ませください</div>
          <div class="activated__timer-label">Valid Until</div>
          <div class="activated__timer"><span class="js-act-timer">23:59:59</span></div>
        </div>
      </div>`
    );
    $('#js-chat').append($wrap);
    $wrap[0].scrollIntoView({ behavior: 'smooth', block: 'start' });

    initActivatedTimer();
    setTimeout(() => { if (_advanceSurvey) _advanceSurvey(); }, 1500);
  }

  // 24時間カウントダウン。最初に開いた時刻を localStorage に保存し、リロードしても復元する。
  // タブが裏に行ったら止める／戻ったら再開。
  function initActivatedTimer() {
    const KEY = 'sururim_timer_target';
    let target;
    const stored = localStorage.getItem(KEY);
    if (stored && Number(stored) > Date.now()) {
      target = Number(stored);
    } else {
      target = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(KEY, String(target));
    }

    let _rafId;
    const tick = () => {
      const rem = Math.max(0, target - Date.now());
      const h = String(Math.floor(rem / 3600000)).padStart(2, '0');
      const m = String(Math.floor((rem % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((rem % 60000) / 1000)).padStart(2, '0');
      $('.js-act-timer').text(`${h}:${m}:${s}`);
      if (rem > 0) _rafId = requestAnimationFrame(tick);
    };
    _rafId = requestAnimationFrame(tick);

    window.addEventListener('pagehide', () => cancelAnimationFrame(_rafId), { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(_rafId);
      else _rafId = requestAnimationFrame(tick);
    });
  }

  // 「本日 X 名が完了」の表示用。時間帯ごとの重み + 800〜1000 の下駄でリアルっぽい数値を作る。
  const LIVE_COUNT_CFG = {
    hourWeights: [2,1,1,0,0,0,3,8,18,32,45,58,70,80,88,95,105,115,122,128,132,135,120,60],
    key: () => 'sururim_count_' + new Date().toDateString(),
    base: 800, range: 200, ms: 5000, chance: 0.6,
  };

  // 同日内ならキャッシュ値を返す。日が変われば新しい値を生成。
  function getLiveCount() {
    const c = LIVE_COUNT_CFG;
    const stored = localStorage.getItem(c.key());
    if (stored) return Number(stored);
    const now = new Date();
    const h = now.getHours();
    let base = 0;
    for (let i = 0; i < h; i++) base += c.hourWeights[i] || 10;
    base += Math.floor((c.hourWeights[h] || 10) * now.getMinutes() / 60);
    base += c.base + Math.floor(Math.random() * c.range);
    localStorage.setItem(c.key(), String(base));
    return base;
  }

  // 数秒ごとにライブカウントをじわじわ増やしてリアルタイム感を出す
  function initLiveCount() {
    $('.js-live-count').text(getLiveCount().toLocaleString());
    const c = LIVE_COUNT_CFG;
    const tick = () => {
      if (Math.random() < c.chance) {
        const $el = $('.js-live-count');
        if (!$el.length) return;
        const next = (parseInt($el.text().replace(/,/g, ''), 10) || 1200) + Math.floor(Math.random() * 2) + 1;
        $el.text(next.toLocaleString());
        localStorage.setItem(c.key(), String(next));
      }
    };
    let _id = setInterval(tick, c.ms);
    window.addEventListener('pagehide', () => clearInterval(_id), { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(_id);
      else _id = setInterval(tick, c.ms);
    });
  }

  // クーポンを開いた時の紙吹雪。3秒で fade out する一発演出。
  function fireConfetti() {
    const cv = document.getElementById('confetti');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    const colors = ['#C9A96E','#E4C889','#9A8248','#F5E6B8','#8B95A8','#E8E4DC'];
    const ps = Array.from({ length: 120 }, () => ({
      x: cv.width / 2 + Math.random() * 200 - 100, y: cv.height / 2 - 100,
      vx: (Math.random() - .5) * 14, vy: Math.random() * -14 - 4,
      w: Math.random() * 8 + 4, h: Math.random() * 4 + 2,
      c: colors[Math.floor(Math.random() * colors.length)],
      r: Math.random() * 360, rv: (Math.random() - .5) * 12, a: 1,
    }));
    let frame = 0; const maxF = 180;
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => {
        p.vy += .25; p.x += p.vx; p.y += p.vy; p.r += p.rv;
        p.a = Math.max(0, 1 - frame / maxF);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r * Math.PI / 180);
        ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (++frame < maxF) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, cv.width, cv.height);
    };
    draw();
  }

  // 日付フォーマット。'YYYY-MM-DD HH:mm:ss(dow)' のようなトークンを置換する。
  function formatDate(date, format) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const tokens = [
      ['YYYY', d.getFullYear()], ['MM', pad(d.getMonth() + 1)], ['DD', pad(d.getDate())],
      ['hh', pad(d.getHours())], ['mm', pad(d.getMinutes())],   ['ss', pad(d.getSeconds())],
      ['dow', ['日','月','火','水','木','金','土'][d.getDay()]],
      // 先に処理されると「YYYY」と重複して置換されるため、必ず後に処理する
      ['M', d.getMonth() + 1], ['D', d.getDate()],
      ['h', d.getHours()],     ['m', d.getMinutes()], ['s', d.getSeconds()],
    ];
    return tokens.reduce((result, [key, value]) => result.replace(new RegExp(key, 'g'), value), format);
  }
});
