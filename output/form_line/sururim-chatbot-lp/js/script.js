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
      gift:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18"/><path d="M12 8c-2-3-5-4-5-2s3 2 5 2 5 0 5-2-3-1-5 2z"/></svg>`,
      star:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
      cal:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      clock:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      tag:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
      heart:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
      syringe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M18 2l4 4M15 5l6 6-11 11H4v-6L15 5z"/><path d="M8 16l-2-2"/></svg>`,
    };

    // 表示名 → API の area_id
    const AREA_IDS = {
      '北海道・東北': '1', '関東': '2', '中部': '3',
      '関西': '4', '中国・四国': '5', '九州・沖縄': '6',
    };

    // チャットのシナリオ定義。type で振る舞いが分岐する。
    const STEPS = [
      { id: 'intro', type: 'bot', auto: true, msgs: [
        'こんにちは。スルリム式 美容コンシェルジュの <strong>MIRAI</strong> です。',
        'これからお体のお悩みに合った <em>最適な部分痩せプラン</em> を一緒に見つけていきますね。',
        'まず簡単な質問をさせてください。',
      ]},
      { id: 'gender', type: 'choice', key: 'gender', prompt: '性別を教えていただけますか？', opts: [
        { l: '女性', v: '女性' }, { l: '男性', v: '男性' },
      ]},
      { id: 'age', type: 'choice', key: 'age', grid: true, prompt: '年代を教えてください。（診断の精度が上がります）', opts: [
        { l: '17歳以下・高校生', v: '17歳以下・高校生' }, { l: '18〜19歳<br><span>※高校生を除く</span>', v: '18〜19歳' },
        { l: '20代', v: '20代' }, { l: '30代', v: '30代' },
        { l: '40代', v: '40代' }, { l: '50代', v: '50代' },
        { l: '60代', v: '60代' }, { l: '70代以上', v: '70代以上' },
      ]},
      { id: 'e1', type: 'bot', auto: true, msgs: [
        'ありがとうございます。年代によって脂肪が落ちにくい部位が変わるので、とても大切な情報です。',
        'では次に——<strong>一番大切な質問</strong>です。',
      ]},
      { id: 'parts', type: 'choice', key: 'body_part', multi: true,
        prompt: '<strong>今、一番気になっている部位</strong>はどこですか？<br><small>複数選択できます</small>', opts: [
          { l: 'アゴ下・フェイスライン', v: 'アゴ下・フェイスライン'    },
          { l: '二の腕',               v: '二の腕'    },
          { l: 'お腹（上部）',          v: 'お腹（上部）'    },
          { l: 'お腹（下部）',          v: 'お腹（下部）'    },
          { l: 'ウエスト・脇腹',        v: 'ウエスト・脇腹'    },
          { l: '太もも（外側）',        v: '太もも（外側）' },
          { l: '太もも（内側）',        v: '太もも（内側）' },
          { l: '背中・ハミ肉',          v: '背中・ハミ肉'      },
      ]},
      { id: 'e2', type: 'bot', auto: true, msgs: [
        'そうですよね…。その部位は <em>普通のダイエットでは最も落としにくいエリア</em> のひとつなんです。',
        'なぜ「部分的に残ってしまう」のか、理由をお伝えしますね。',
      ]},
      { id: 'edu', type: 'edu' },
      { id: 'diet', type: 'choice', key: 'diet', multi: true,
        prompt: 'ちなみに、これまでに試されたダイエットはありますか？', opts: [
          { l: '運動・ジム',       v: '運動・ジム'    },
          { l: '食事制限',         v: '食事制限' },
          { l: 'エステ・マッサージ', v: 'エステ・マッサージ'  },
          { l: 'サプリ・置き換え',  v: 'サプリ・置き換え'  },
          { l: '特になし',         v: '特になし'    },
      ]},
      { id: 'e3', type: 'bot', auto: true, special: 'social', msgs: [
        'お気持ち、とてもよく分かります。',
        'この診断を受けてくださった方の <strong>9割以上</strong> が、同じような経験をされています。',
      ]},
      { id: 'reasons',         type: 'reasons'         },
      { id: 'ba',              type: 'ba'              },
      { id: 'merit', type: 'bot', auto: true, msgs: [
        'Before/Afterをご覧いただきありがとうございます。',
        'スルリム式は<br>'
          + icon('chk', 14) + ' ピンポイントの脂肪におよそ15分<br>'
          + icon('chk', 14) + ' ダウンタイムほぼなし<br>'
          + icon('chk', 14) + ' 脂肪細胞の"数"を減らしリバウンドしにくい<br>'
          + 'という特徴がございます。',
      ]},
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

    const AVSV = `<div class="av-s" aria-hidden="true"><img src="img/avatar.svg" width="14" height="14" alt=""></div>`;

    // 進捗バーの再描画
    function prog() {
      const $bars = $('#js-prog-bars');
      const total = state.totalUserStep;
      const cur   = Math.min(state.step, total);
      const giftIcon = `<div class="prog__icon" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--pk)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13"/><path d="M3 12h18"/><path d="M12 8c-2-3-5-4-5-2s3 2 5 2 5 0 5-2-3-1-5 2z"/></svg></div>`;
      const barsHtml = Array.from({ length: total }, (_, i) => {
        const cls = i < cur ? 'prog__s done' : i === cur ? 'prog__s cur' : 'prog__s';
        return `<div class="${cls}">${GIFT_STEPS.includes(i) ? giftIcon : ''}</div>`;
      }).join('');
      $bars.html(barsHtml);
      $('#js-prog-label').text(`Step ${cur + 1} / ${total}`);
      const rem = Math.max(0, total - cur);
      $('#js-prog-rem').text(rem > 0 ? `あと${rem}問` : '診断完了');
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
          for (let i = 0; i < s.msgs.length; i++) {
            await showTyp(600 + i * 100);
            const $m = addBot(s.msgs[i]);
            if (i === 0 && _sn) scrollToEl($m[0]);
            await sl(250);
          }
          if (s.special === 'social') {
            await sl(200);
            addCard(
              `<div class="soc">
                <div class="soc__dots" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
                <div class="soc__txt">本日 <strong class="js-live-count">1,200</strong>名 がLINE診断を完了<br><strong>93%</strong> が「もっと早く知りたかった」と回答</div>
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
              <div class="card__t">脂肪が"部分的に"残る本当の理由</div>
              <div class="card__b">
                <div class="edu__video">
                  <video src="img/edu_fat.mp4" preload="none" loop muted playsinline class="js-ignore-video-play js-dynamic-video"></video>
                </div>
                <p>普通のダイエットでは脂肪細胞の<em>大きさ</em>が変わるだけ。<strong>数は減りません。</strong></p>
                <p>スルリム式は脂肪細胞を <strong>最大35%破壊</strong>。数自体を減らすことで、リバウンドしにくい体質へ導きます。</p>
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
          const $rm = addBot('スルリム式が選ばれている<strong>5つの理由</strong>をご紹介しますね。');
          if (_sn) scrollToEl($rm[0]);
          const reasons = [
            { num:'01', title:'1回で従来の約5回分',     desc:'FDA承認のデオキシコール酸を高濃度配合。少ない回数で効果を実感いただけます', ico:'syringe' },
            { num:'02', title:'脂肪細胞を最大35%破壊',  desc:'脂肪細胞の"数"自体を減らすため、リバウンドしにくい仕組みです',            ico:'heart'   },
            { num:'03', title:'1部位およそ15分',        desc:'切開不要・麻酔不要。お仕事帰りにも通えます。当日シャワーOK',               ico:'clock'   },
            { num:'04', title:'ダウンタイムほぼなし',    desc:'翌日からメイク可能。一時的な腫れや内出血は通常1〜2週間で改善します',        ico:'star'    },
            { num:'05', title:'韓国で大バズの超人気メニュー', desc:'韓国で爆発的に流行した施術を、JUNOが日本人の体質に合わせて独自にパワーアップ。効果と安全性を両立しています', ico:'tag' },
          ];
          const html = reasons.map(r =>
            `<div class="rsn"><div class="rsn__img"><video src="img/reason${r.num}.mp4" preload="none" loop muted playsinline class="js-ignore-video-play js-dynamic-video"></video></div>
             <div class="rsn__body"><div class="rsn__num">REASON ${r.num}</div>
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
            `<button class="nb nb--ba">${icon('star', 14)} スルリム式 Before/After を見る</button>`
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

        case 'coupon': {
          if (DEBUG_MODE) { next(); break; }
          await showTyp(900);
          const $cm1 = addBot('ここまでお付き合いいただき、ありがとうございます。');
          if (_sn) scrollToEl($cm1[0]);
          await sl(300);
          addBot('診断結果に基づいて、<strong>あなた専用の特別ギフト</strong>をご用意しました。');
          await sl(300);
          // ボタン押下でクーポンモーダルを開く（モーダル制御は initCouponPopup 側）
          const $cpnBtn = $('<div class="nbw nbw--c">').html(
            `<button class="nb nb--cpn js-coupon-open-btn">
              ${icon('gift', 16)} あなた専用の特別特典を開く
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
                <p>現在、スルリム式は <strong class="em--acc">大変混み合っている</strong> 状況です。</p>
                <p>特に <strong class="em--acc em--ul">土日祝やお仕事帰りの時間帯</strong> は通常1〜2週間待ちになることも。</p>
                <p class="card__note">
                  ${icon('star', 14)} <strong>このページ限定</strong>で、人気枠を含めた<strong class="em--pk">優先的な仮押さえ</strong>が可能です。次のステップで最寄りクリニックと希望日時をお選びください。
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
          const $am = addBot('枠の仮押さえをする<strong>最寄りクリニック</strong>を検索しましょう。');
          scrollToEl($am[0]);
          await sl(200);
          renderAreaOpts();
          break;
        }

        case 'clinic': {
          await showTyp(500);
          const $cm = addBot('下記から店舗をお選びください。');
          scrollToEl($cm[0]);
          await sl(200);
          renderClinic();
          break;
        }

        case 'reserve': {
          await showTyp(600);
          const $rv = addBot(
            `${icon('cal', 16)} <strong>優先仮予約</strong>の日時を選択してください。<br><small>LINE経由限定で <strong>土日祝の人気枠も対象</strong> です</small>`
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

    // Before/After 症例カードの初期描画。スライド制御は initBeforeAfter 側のイベント委譲で行う。
    function renderBA() {
      const BA = [
        { part: '二の腕',  cap: '<strong>A様 29歳｜二の腕</strong> <span class="ba-tag">#スルリム1回</span><br>半袖の季節に間に合わせたいと来院されました' },
        { part: 'お腹',    cap: '<strong>Y様 32歳｜下腹部</strong> <span class="ba-tag">#産後</span><br>運動では戻らなかった下腹部が2週間で変化' },
        { part: '太もも',  cap: '<strong>M様 27歳｜太もも内側</strong> <span class="ba-tag">#スキニー</span><br>内もものすき間ができたとお喜びの声' },
        { part: 'アゴ下',  cap: '<strong>S様 34歳｜アゴ下</strong> <span class="ba-tag">#小顔</span><br>フェイスラインがシャープに。横顔に自信が持てるように' },
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
            <div class="ba-av" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="11" r="1.4" fill="#2B2B2B"/><circle cx="15" cy="11" r="1.4" fill="#2B2B2B"/></svg></div>
            <div class="ba-mt"><strong>sururim_official</strong><small>症例ギャラリー</small></div>
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
        `<div class="field__l"><span>店舗選択</span><span class="bdg">必須</span></div>
         <select name="clinic_shop" class="field__sel" disabled>
           <option value="">読み込み中...</option>
         </select>
         <p class="field__help">${icon('chk', 12)} 全院カウンセリング無料 ／ 医師が丁寧にヒアリングいたします</p>`
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
          <div class="gift__head"><h3>あなたが今日獲得した特別ギフト</h3><p>LINE追加で電子カルテ情報が自動送信されます</p></div>
          <div class="gift__list">
            <div class="gift__item"><div class="gift__ico">${icon('tag', 16)}</div><div class="gift__info"><strong>初回特別価格</strong>1部位目</div><div class="gift__val">9,800円</div></div>
            <div class="gift__item"><div class="gift__ico">${icon('gift', 16)}</div><div class="gift__info"><strong>2部位目以降</strong><small class="gift__sub"></small></div><div class="gift__val">14,800円〜</div></div>
            <div class="gift__item"><div class="gift__ico">${icon('heart', 16)}</div><div class="gift__info"><strong>人気美容施術</strong>1つ無料プレゼント</div><div class="gift__val">0円</div></div>
            <div class="gift__item"><div class="gift__ico">${icon('cal', 16)}</div><div class="gift__info"><strong>優先仮予約</strong><small class="gift__detail">${reserveDetail}</small></div>${reserveVal}</div>
            <div class="gift__item"><div class="gift__ico">${icon('chk', 16)}</div><div class="gift__info"><strong>${bodyPartLabel}</strong>初回特別価格</div><div class="gift__val">9,800円</div></div>
          </div>
        </div>`
      );
      scrollToEl($giftCard[0]);

      addCard(
        `<div class="card card--line">
          <div class="card__t card__t--line">LINE追加でできること</div>
          <div class="card__b card__b--lg">
            <p>${icon('chk', 13)} <strong>特典・クーポンはすべてLINEに自動送信</strong>されます</p>
            <p>${icon('chk', 13)} 仮押さえの情報もLINEに届くため<strong>再入力は不要</strong>です</p>
            <p>${icon('chk', 13)} 予約日の変更や施術についてのご質問も<strong>LINEからOK</strong></p>
          </div>
        </div>`
      );
      await sl(400);
      addCard(`<div class="urg">このページからの登録は <strong>本日あと残り12名</strong></div>`);

      await sl(300);
      addCard(
        `<div class="timer-box">
          <div class="timer-box__label">特典の受け取り期限</div>
          <div class="timer-box__time"><span class="js-act-timer">23:59:59</span></div>
          <div class="timer-box__note">期限を過ぎると特典が無効になります</div>
          <div class="timer-box__cta">このままLINE追加で<br>すべての特典があなたのLINEに届きます</div>
          <div class="timer-box__sub">消したい場所の脂肪を<br>思う存分破壊してください</div>
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
      const gender = $('[name="gender"]:checked').val()?.trim() ?? '';
      const age    = $('[name="age"]:checked').val()?.trim() ?? '';

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
          varMapping['2184987'] = gender;
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
      '<strong>A様 29歳｜二の腕</strong> <span class="ba-tag">#スルリム1回</span><br>半袖の季節に間に合わせたいと来院されました',
      '<strong>Y様 32歳｜下腹部</strong> <span class="ba-tag">#産後</span><br>運動では戻らなかった下腹部が2週間で変化',
      '<strong>M様 27歳｜太もも内側</strong> <span class="ba-tag">#スキニー</span><br>内もものすき間ができたとお喜びの声',
      '<strong>S様 34歳｜アゴ下</strong> <span class="ba-tag">#小顔</span><br>フェイスラインがシャープに。横顔に自信が持てるように',
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
          <div class="activated__title">あなた専用の特典が<br>すべて有効になりました</div>
          <div class="activated__sub">期限内に仮押さえをお済ませください</div>
          <div class="activated__timer-label">有効期限</div>
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
    const colors = ['#FF4785','#FFB5CC','#E5B95F','#FF7BA9','#62E088','#FFE0A8'];
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
