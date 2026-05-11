---
approved: true
approved_at: 2026-05-11
---

# リファクタリング仕様書

`input/sururim-chatbot-lp.html` を `template/form_line/calendar-lp/` の規約に従って `output/form_line/sururim-chatbot-lp/` へ再生成するための仕様書。コーディングルールは [`coding-rules.md`](../../../.claude/rules/coding-rules.md) を参照。

---

## 1. 背景と目的

### 1-1. 現状 (input)
- `input/sururim-chatbot-lp.html` 全 973 行、全 CSS/JS がインラインの単一 HTML。
- バニラ JS の自前チャットボット型 LP (18 ステップ)。
- jQuery / React 等のフレームワーク不使用。
- 画像ファイルは一切なし (全てインライン SVG / CSS グラデーションで代替)。
- 送信先は `line.me/R/ti/p/@897vblrf?var_XXXXXXX=...` (L-Step 変数 ID スキーマ)。
- 店舗マスタ (`CLINICS`)、シナリオ (`STEPS`)、クーポン、Before/After データはすべて JS 内ハードコード。

### 1-2. 目的
- `template/form_line/calendar-lp/` の **PHP 薄膜 + jQuery + フルード rem CSS** 構成に寄せる。
- カレンダー UI は `template/form_line/calendar-lp/js/time-calendar-sync/` を **モジュールとして再利用** する (自前 `renderCal` を捨てる)。
- 広告計測 (`ad_count`)、LINE ポップアップ、リターゲタグを template 準拠で組み込む。
- L-Step 連携部 (`buildUrl()` → `var_*` パラメータ) は `bot_basic_id` ごとのマッピング表に正規化。
- 1 ファイル完結 LP を、`output/sururim-chatbot-lp/` ディレクトリの `index.php / css/style.css / js/script.js / js/ajax.php / img/` に分割。

### 1-3. スコープ外
- 管理画面からのシナリオ編集機能。
- 新規デザイン変更 (見た目は可能な限り現行を踏襲)。
- 店舗マスタの DB 化 (当面 PHP 定数 / JSON で配列定義)。

---

## 2. 成果物のディレクトリ構成

```
output/sururim-chatbot-lp/
├── index.php
├── css/
│   └── style.css
├── js/
│   ├── script.js          … ES Module (`<script type="module">`)、jQuery 前提
│   └── ajax.php           … 広告計測 (type=5)
└── img/
    ├── logo.svg           … "MIRAI" ボットアバター or サイトロゴ
    ├── nav_01.svg 〜 nav_0N.svg       … 進捗ナビ (ステップ数分、彩色版)
    ├── nav_bw_01.svg 〜 nav_bw_0N.svg … 非アクティブ (モノクロ版)
    ├── icon_arrow.svg / icon_arrow-2.svg / icon_close.svg …
    ├── icon_gift.svg / icon_star.svg / icon_clock.svg …     … 現状インライン SVG を外出し
    ├── icon_line.webp                  … LINE ボタン用
    ├── ba_01.png / ba_02.png …        … Before/After プレースホルダ (画像差替え前提)
    └── coupon_01.webp / coupon_notice.webp …
```

### 共通リソース (既存前提)
- `../../common.php` (ヘルパ関数群)
- `../../js/common.js`, `../../js/jquery.cookie.js`
- `../../js/time-calendar-sync/` (カレンダーモジュール、`calendar-spec.md` 参照)
- `../../line-at-pop/`

---

## 3. 画面フローとステップ仕様

現行 `STEPS` 18 段を、template の **カルーセル (`.js-csl__item`)** に 1 ステップ = 1 item で展開する。

| # | id | 種別 | 取得値 | ナビ表示 |
|---|----|------|--------|--------|
| 0 | intro | bot | - | - (プロローグ) |
| 1 | gender | 単一選択 | `gender` | nav_01 |
| 2 | age | 単一選択 (grid) | `age` | nav_02 |
| 3 | e1 | 共感メッセージ | - | (継続) |
| 4 | parts | 複数選択 (8 択) | `body_part[]` | nav_03 |
| 5 | e2 | 共感メッセージ | - | (継続) |
| 6 | edu | 教育コンテンツ | - | - |
| 7 | diet | 複数選択 | `diet[]` | nav_04 |
| 8 | e3 | 実績＋ライブカウンター | - | - |
| 9 | reasons | 理由カルーセル | - | - |
| 10 | ba | Before/After | - | - |
| 11 | merit | メリット説明 | - | - |
| 12 | coupon | クーポンポップアップ | `coupon` | nav_05 |
| 13 | reserve-benefit | 優先仮予約訴求 | - | - |
| 14 | area | 地域選択 | `clinic_area` | nav_06 |
| 15 | clinic | 店舗選択 | `clinic_shop`, `clinic_id` | nav_07 |
| 16 | reserve | カレンダー + 第1〜第3希望 | `date_1`, `date_2`, `date_3` | nav_08 |
| 17 | final | 確認 + LINE 誘導 CTA | - | - |

### 3-1. ナビ表示の簡略化判断
ユーザーの選択アクションが発生するステップのみナビに反映 (8 段)。純演出ステップ (intro, e1, e2, e3, edu, reasons, ba, merit, reserve-benefit) はナビに含めない。`nav_01.svg`〜`nav_08.svg`、非アクティブ版 `nav_bw_01.svg`〜`nav_bw_08.svg` を用意する (デザインは後日差し替え可)。

### 3-2. 選択値の data 属性ブリッジ
各ステップで選択値を確認画面に流し込むため、`input[data-<name>-target]` で保持し、最終画面の `[data-confirm-value-<name>]` に JS で文字列を埋める (`handleInputChangeToDataTarget('body_part')` を横展開)。

---

## 4. HTML (index.php) 実装指針

### 4-1. ヘッダ定型
[`coding-rules.md §1-1`](../../../.claude/rules/coding-rules.md) の必須要素表の読込順を厳守。head 全体は `template/form_line/calendar-lp/index.php` を丸コピーし可変部のみ差し替える。CTA 先 URL は `<?= ad_line_url() ?>` に統一。

### 4-2. body 骨格

head は `coding-rules.md §1-1` の必須要素表を厳守 (`template/form_line/calendar-lp/index.php` 丸コピー)。body の LP 固有部分は以下の構造に従う:

```html
<body>
  <?= ptengine() ?>
  <input type="hidden" name="bot_basic_id" value="<?= $bot_basic_id ?>">

  <div class="page-wrap">
    <main>
      <header class="page-header">
        <h1 class="page-header__logo">
          <img src="img/logo.svg" alt="MIRAI" width="..." height="...">
        </h1>
      </header>

      <!-- 進捗ナビ -->
      <div class="csl__nav">
        <div class="js-csl__nav-item csl__nav-item is-active"><img src="img/nav_01.svg" width="..." height="..." alt=""></div>
        <!-- ×8 -->
      </div>

      <!-- カルーセル本体 -->
      <div class="js-csl">
        <div class="js-csl__item is-active" data-step="gender">...</div>
        <div class="js-csl__item" data-step="age">...</div>
        ...
        <div class="js-csl__item" data-step="final">...</div>
      </div>

      <!-- 下部固定 CTA (coding-rules §3 CTA 3点セット必須) -->
      <div class="js-fixed-btn fixed-btn">
        <a class="js-cta-link cta-btn" href="" data-href="<?= $url ?>">
          <img src="img/icon_line.webp" alt="" width="..." height="..." loading="lazy" decoding="async">LINE で受け取る
        </a>
      </div>
    </main>
  </div>

  <!-- 計測タグ -->
  <?= r_rt() ?>
  <?= r_rt_lp() ?>
  <?= r_rt_sim_only() ?>
</body>
```

### 4-3. 分離対象ブロック (input → output)

| input の行 | 分離先 |
|---|---|
| L11-354 `<style>` | `css/style.css` |
| L383-971 `<script>` | `js/script.js` |
| L387 `BOT_BASIC_ID` | `<input type="hidden" name="bot_basic_id" value="<?= $bot_basic_id ?>">` 経由で JS に渡す |
| L389 `VAR_IDS` | `js/script.js` の `varMapping` (bot_basic_id キー) |
| L420-427 `CLINICS` | `js/script.js` 内定数 or `js/clinics.json` |
| L430-470 `STEPS` | `js/script.js` 内定数 (管理画面化は将来) |
| L617-623 `reasons`, L632-637 `BA`, L829 時間スロット | 同 `js/script.js` 内マスタ |
| L396-416 `ICO`, L362/L479 `AVSV` | **SVG ファイルに外出し** (`img/icon_*.svg`, `img/logo.svg`) |
| インライン `style="..."` (30 箇所超) | `css/style.css` + `u-*` ユーティリティ |

### 4-4. ID 指向 → class/data 指向への置換
動的生成 DOM 上の以下 ID は原則 `class` / `data-*` に置換する:

| 旧 ID | 代替 |
|---|---|
| `#chat` | `.js-chat` |
| `#actTimer`, `#actTimer2` | `.js-act-timer` (querySelectorAll 対応) |
| `#cSel`, `#cNb` | `[name="clinic_shop"]` / `[name="area"]` で参照 (coding-rules クリニック取得ルール §4 準拠) |
| `#calP`, `#calN`, `#calDone` | カレンダーモジュールに委譲 |
| `#baP`, `#baN`, `#baSl`, `#baDs`, `#baCap` | `.js-ba-prev`, `.js-ba-next`, `.js-ba-slide`, `.js-ba-dots`, `.js-ba-caption` |
| `#cpnOv`, `#cpnWrap`, `#cpnClose` | `.js-coupon-overlay`, `.js-coupon-wrap`, `.js-coupon-close` |
| `#liveCount` | `.js-live-count` (複数可) |
| `#prefs`, `#pt0..2`, `#pd0..2`, `#cc1..3` | data 属性化 (`data-pref-index="0"` 等) |

静的で 1 つしか存在しない要素 (`#js-clinic-selector`, `#js-time-calendar-1`) は ID のまま可。

### 4-5. ダイアログの a11y 対応
```html
<div class="js-coupon-overlay coupon-overlay" role="dialog" aria-modal="true" aria-labelledby="coupon-title">
  ...
</div>
```
フォーカストラップ実装。`Esc` キーで閉じる。

---

## 5. CSS 移行指針

### 5-1. 変換手順
1. `input` の `<style>` 内 CSS 変数定義 (L23-28) を捨て、**template の `:root` フルード rem 設計** に置換。
2. 既存の `px` 指定を `rem` に換算 (`1rem = 10px @375px`)。例: `font-size: 14px` → `font-size: 1.4rem`。
3. BEM フラット化: `.opt--m` のような `--modifier` 書式を `.c-opt.is-selected` 等 `is-*` に書き換え。
4. Utility 層を template の `u-*` 一覧に統合。重複は削除。
5. インライン `style` はすべて外部 CSS のクラス化 or `u-*` で解消。
6. `@media (max-width: 480px)` のような固定幅 BP は撤廃 (フルード rem + `--max-width: 600` で代替)。

### 5-2. セクション分割
template の区切り (`Reset → Base → Utility → Page → Animation → Accordion`) に合わせる。Page セクション内でカルーセル (`/******** Carousel ********/`)、チャット (`/******** Chat ********/`)、カレンダー埋込 (`/******** Calendar ********/`)、クーポンモーダル (`/******** Coupon Popup ********/`)、Before/After (`/******** BA ********/`)、CTA (`/******** CTA ********/`) でサブセクション化。

### 5-3. 色のトークン化 (推奨)
現状 `--primary:#ff6b9d` 等の部分定義を、template 側にまだ無い **LP 独自カラーとして限定的に `:root` に残す**ことを許容。ただし `u-color-red` / `u-color-red-2` 系は template の値 (`#EF4B7D` / `#f1183d`) を基準とする。

---

## 6. JavaScript 移行指針

### 6-1. エントリ

`script.js` は `<script type="module" src="js/script.js">` で読み込む (calendar-spec §1 の import 構文を成立させるため。coding-rules §1 テンプレの `<script src>` からの**明示的逸脱**。他の必須要素は維持)。

```js
import { embedTimeCalendar } from '../../js/time-calendar-sync/main.js';

$(() => {
  const botBasicId = $('[name="bot_basic_id"]').val();

  surveyController(botBasicId);
  initCalendar();
  initAreaClinic();
  initBeforeAfter();
  initCouponPopup();
  initLiveCount();
  initActivatedCard();

  // 以下関数定義 (coding-rules §1 の巻き上げパターン)...
});
```

機能単位で `function` 宣言し、状態を持つ機能 (`surveyController` 等) は関数内の `state` オブジェクトで管理する (coding-rules JS §1 準拠)。

### 6-2. `surveyController` 設計

**state 必須プロパティ** (coding-rules JS §2 準拠):

| プロパティ | 初期値 | 意味 |
|---|---|---|
| `isMoving` | `false` | 遷移アニメ中フラグ (二重操作防止) |
| `currentStep` | `1` | 現在画面番号 (1 始まり) |
| `achievedMaxStep` | `1` | 到達最大画面番号 (戻っても保持) |
| `maxStep` | `$('.js-csl__item').length` | 画面総数 |
| `adCountStatus` | **`3`** | 計測ステータス ID (デフォルト 3 スタート) |
| `adCountStatusMax` | `$('.js-csl__item').length + 2` | 計測ステータス上限 |

- `STEPS` 配列を input L430-470 から移植し、`state.currentStep` / `state.maxStep` で制御。
- `moveScreen(isNext)` でカルーセルアイテムの `.is-active` 付け外し (coding-rules §3-1 準拠)。
- `validation()` は `switch (state.currentStep)` で画面ごとにバリデート (coding-rules §3-2 準拠)。
- `onClickSelectBtn` / `onClickPrevBtn` / `onClickCtaBtn` の雛形は coding-rules §3-3〜3-5 を完全コピー。
- `postAdCountStatus` は coding-rules §6 を完全コピー (改変禁止)。
- `addParamsToCtaUrl()` は下記 §6-4 に従う。

### 6-3. カレンダー統合
現行 `renderCal()` (input L797-874) を全削除し、`embedTimeCalendar` を使用:

```js
function initCalendar() {
  const fetchUrl = new URL('/js/sururim_time_schedule.php', window.location.origin);
  const cal = embedTimeCalendar({
    parentSelector: '#js-time-calendar-1',
    checkBoxAttrName: 'date_1',  // 第1希望
    scheduleFetchUrl: fetchUrl,
    options: {
      couponSettings: { isAllTimeCoupon: true, showStartDays: 0, showDays: 7, showTimeList: [] },
    },
  });
  cal.init();

  // 店舗 <select> の change でカレンダーを再描画 (coding-rules クリニック取得ルール §6 準拠)
  $('[name="clinic_shop"]').on('change', async function () {
    const $selected = $(this).find(':selected');
    const clinicId = $selected.data('clinic-id');
    if (!clinicId) return;
    await cal.createCalendar({ params: { clinicId } });
  });
}
```

カレンダーの詳細仕様・オプション・DOM 構造・エラーハンドリングは [`calendar-spec.md`](../../../.claude/rules/calendar-spec.md) を参照。

第1〜第3希望を入力する現行仕様 (`prefs` / `pt0..2` / `pd0..2`) は、**1つの embedTimeCalendar インスタンスで `maxSelectedDate: 3`** として実装する (モジュールオプション拡張が必要なら別途検討。現状は第1希望のみとし、第2/第3 は別ステップに分割する運用で初期対応)。

### 6-4. CTA URL 構築

`addParamsToCtaUrl` は **coding-rules JS §5 を完全コピー** (URL 生成・パラメータセット・`$('.js-cta-link').each(...)` は改変禁止)。変更可能なのは次の 3 点のみ:

1. **取得項目**: このLP で収集する値 (`gender`, `age`, `bodyPart`, `diet`, `coupon`, `clinic`, `date_1` 等)
2. **アカウント ID**: `switch (botBasicId)` の `case` 値 (`'897vblrf'` 等)
3. **mapping ID**: `varMapping['XXXXXXX']` のキー (`input L389` の `VAR_IDS` 値を流用)

```js
const addParamsToCtaUrl = () => {
  // --- 取得項目 (LP 固有) ---
  const selectedBodyPart = [];
  $('[name="body_part"]:checked').map((_, el) => selectedBodyPart.push($(el).val()));
  const bodyPart = `,${selectedBodyPart.join(',')},`;
  const coupon = $('[name="coupon"]:checked').val()?.trim() ?? '';
  const requestClinic = $('[name="clinic_shop"]').val()?.trim() ?? '';
  const [requestDate, requestTime1] = ($('[name="date_1"]').val() ?? '').split(' ');
  const formattedRequestDate = formatDate(requestDate, 'MM月DD日(dow)');  // §6-5 参照

  const isCouponTime = $('[name="date_1"]').attr('data-tc-is-coupon-time') === 'true';
  const isToday      = $('[name="date_1"]').attr('data-tc-is-today') === 'true';
  const isCalendarError = $('[data-tc-is-error]').length > 0;

  const botBasicId = $('[name="bot_basic_id"]').val().trim();
  const varMapping = {};

  // --- アカウント ID / mapping ID (LP 固有) ---
  switch (botBasicId) {
    case '897vblrf':
      varMapping['XXXXXXX'] = bodyPart;       // bodyPart
      varMapping['XXXXXXX'] = coupon;         // coupon
      varMapping['XXXXXXX'] = requestClinic;  // clinic
      if (!isCalendarError) {
        varMapping['XXXXXXX'] = formattedRequestDate;
        varMapping['XXXXXXX'] = requestTime1;
        varMapping['XXXXXXX'] = isCouponTime ? '日時特典あり' : '日時特典なし';
        if (isToday) varMapping['XXXXXXX'] = '当日希望';
      }
      break;
  }

  // --- URL 生成 (改変禁止) ---
  $('.js-cta-link').each((_, element) => {
    const $link = $(element);
    const url = new URL($link.attr('data-href'));
    Object.keys(varMapping).forEach((key) => {
      url.searchParams.set(`var_${key}`, varMapping[key]);
    });
    $link.attr('href', url.toString());
  });
};
```

`XXXXXXX` 部分は `input L389` の `VAR_IDS` 定数の各値で置き換える。`gender` / `age` / `diet` の各項目も同様に追記する。

### 6-5. `formatDate` (完全コピー必須)

**coding-rules JS §4 を完全コピー** (改変禁止・トークン順序変更禁止)。varMapping に渡す日付は必ず `formatDate(date, 'MM月DD日(dow)')` 形式。詳細は coding-rules JS §4 参照。

### 6-6. エリア→クリニック取得

**coding-rules「クリニック一覧取得ルール」を完全準拠** (エンドポイント・メソッド・ヘッダ・ボディ・`data-clinic-list-error` の仕様は改変禁止)。

- エリア `<select name="area">` の `change` で `fetchClinicList(areaId)` を呼ぶ。
- `areaId` が空文字の場合は fetch を呼ばない。
- エラー時は `$('[name="clinic_shop"]').attr('data-clinic-list-error', '')` を付与。
- クリニック `<select>` は未選択時 `disabled`、取得成功後に `removeAttr('disabled')`。

詳細コードは coding-rules クリニック一覧取得ルール §2 を参照。

### 6-7. ライブカウンター / タイマー
- `setInterval` は **ページ離脱時 (`pagehide` / `visibilitychange`) に `clearInterval`** (coding-rules パフォ §5 準拠。現状 input L951 は未解除)。
- `startLiveCount()` を `initLiveCount()` にリネーム。定数 (`hourWeights` 等) は関数外部の `const LIVE_COUNT_CONFIG = { ... }` に分離。
- `showActivatedCard()` の `setInterval` も同様にクリーンアップ。

### 6-8. 広告計測統合

`postAdCountStatus` は **coding-rules JS §6 を完全コピー** (改変禁止)。呼び出しタイミング:

1. **ページ読み込み時** (`init()` 内で 1 回)
2. **画面が進んだ時** (`onClickSelectBtn` で `state.adCountStatus++` の直後)

**戻る時は `postAdCountStatus()` を呼ばない** (coding-rules §3-4 準拠)。`ajax.php` は `template/form_line/calendar-lp/js/ajax.php` から流用。

### 6-9. セキュリティ改善
- `addUsr(labels.join('、'))` (input L532) の `.innerHTML` 代入は `.textContent` へ (coding-rules セキュリティ §1 準拠)。
- `icon(name, w)` による文字列結合 HTML は、**テンプレ対象を固定リスト** とし `ICO[name]` 引数型をユニオン型のコメントで明示。

### 6-10. アクセシビリティ
- `user-scalable=no` を meta から削除。
- SVG のみのボタンに `aria-label`。
- モーダルに `role="dialog"` + `aria-modal="true"` + フォーカストラップ。
- `prefers-reduced-motion` を尊重 (`window.matchMedia('(prefers-reduced-motion: reduce)')` 判定で `scrollIntoView({ behavior: 'auto' })` に切替)。

---

## 7. 画像資産の準備

### 7-1. 外部化対象
input はインライン SVG 主体のため、以下を **実ファイル化**:

| 旧 | 新 |
|---|---|
| `AVSV` (L362/L479 アバター) | `img/logo.svg` |
| `ICO.chin/arm/belly/thigh/back/...` (部位アイコン) | `img/icon_part_01.svg` 〜 `img/icon_part_08.svg` |
| `ICO.run/salad/spa/pill/sad/...` | `img/icon_<name>.svg` |
| `ICO.chk` (L408 チェック) | `img/icon_check.svg` |
| `ICO.arr/gift/star/cal/clock/tag/heart/syringe` | `img/icon_<name>.svg` |
| カレンダー左右矢印 (L823 インライン) | モジュール同梱の `../../js/time-calendar-sync/img/icon__arrow-left.svg` / `icon__arrow-right.svg` を利用 (calendar-spec §2 参照) |
| Before/After (L647 グラデーション placeholder) | `img/ba_01.png` 〜 (実症例画像差し替え。著作権・医療広告規制に配慮) |

### 7-2. 新規 FV
`input` には FV 画像がないため、`img/fv.webp` を新規制作するか、現行のチャット UI をそのままトップに配置してヘッダのみ簡易化する。暫定は後者。

### 7-3. LINE ボタン
`img/icon_line.webp` (LINE 緑のボタン or ロゴ) を用意。ヘッダロゴは `img/logo.svg` で兼用可。

---

## 8. 実装ステップ (推奨順序)

1. **雛形作成** — `output/sururim-chatbot-lp/` に template/form_line/calendar-lp をコピーし、`index.php` / `style.css` / `script.js` / `ajax.php` を空/最小で置く。
2. **CSS 移植** — input の `<style>` を `css/style.css` に貼り付け、§5 の変換ルールで正規化。
3. **JS 骨格移植** — input の `<script>` を `js/script.js` に貼り付け、ES Module + `$(() => {...})` でラップ。`BOT_BASIC_ID` 直参照を hidden input 経由に変更。
4. **HTML 静的化** — input の `<div class="app">` 内の動的生成 DOM を、`js-csl__item` の静的 HTML に書き起こす。各ステップの UI を固定マークアップに展開。
5. **ID → class/data 置換** — §4-4 の対応表で全置換。JS セレクタも同期して書き換え。
6. **カルーセル統合** — 現行 `render()` / `next()` を削除し、template の `surveyController` パターンに置換。
7. **カレンダー統合** — `renderCal()` を削除し、`embedTimeCalendar` を組込。エンドポイント `/js/sururim_time_schedule.php` の前提を確認。
8. **CTA URL 統合** — `buildUrl()` / `openLine()` を `addParamsToCtaUrl()` に置換。varMapping を定数化。
9. **広告計測組込** — `ajax.php` を template/form_line/calendar-lp から流用し、`postAdCountStatus()` を `surveyController` の step 遷移フックから呼ぶ。
10. **アイコン外部化** — `ICO` / `AVSV` を SVG ファイルに書き出し、`<img>` 参照に置換。
11. **a11y 改修** — `user-scalable=no` 削除、`aria-*` 付与、モーダル対応。
12. **動作確認** — §9 の検証手順を実施。

---

## 9. 検証手順

### 9-1. 静的確認
- `php -l output/sururim-chatbot-lp/index.php` および `ajax.php` で構文チェック。
- ブラウザで開いて console エラーなし。
- DevTools > Network で CSS/JS がキャッシュバスター付きで読めていること。
- Lighthouse Accessibility スコア 90+ を目標 (現行は `user-scalable=no` で減点)。

### 9-2. 機能確認
- 各ステップでバリデーション (未選択で次へ進めない)。
- カルーセル遷移アニメ (fadeIn/fadeOut) が動く。
- 第1希望日時選択 (カレンダー) が `input[name="date_1"]` に反映。
- 店舗選択変更時にカレンダーが再描画。
- CTA クリックで `href` に `var_*` パラメータが全て乗っている (DevTools > Elements で確認)。
- 広告計測: step 遷移時に `./js/ajax.php` に POST が飛ぶ、cookie `status_id` が更新される。
- ローカル (`127.0.0.1`) ではカレンダーが `dummy-data.json` にフォールバック。
- クーポンモーダル: 表示 → クローズ → 紙吹雪演出 → フォーカス復帰。
- Before/After スライダー操作。

### 9-3. 回帰確認
- 現行 LP と並べて UI/UX (色、余白、文言、ステップ数) の差分を目視比較。
- CTA 遷移先 URL の `var_*` パラメータ数と値が現行と一致。
- LINE 誘導先 (`@897vblrf`) が同一。

---

## 10. オープン項目 (要確認)

実装開始前にユーザーに確認推奨:

1. **`/js/sururim_time_schedule.php` のエンドポイント実体はあるか？** (現行サイト本番側で稼働中の前提で良いか)
2. **`var_*` の VAR_IDS (input L389) はそのままで良いか、新 bot_basic_id でマッピング追加が必要か？**
3. **Before/After の症例画像 (`ba_01.png` 等) は別途支給か、現行のプレースホルダ継続か？**
4. **ナビアイコン (nav_01.svg 〜) のデザインはどうするか？** (新規制作が必要)
5. **第2/第3希望日時の入力方式** は、1 カレンダーで `maxSelectedDate=3` か、ステップを3分割 (`date_1` / `date_2` / `date_3` の各ステップでカレンダー再利用) のどちらか。
6. **`BOT_BASIC_ID` を環境ごとに切り替える方式** (PHP 側 `ad_messaging_api_bot_basic_id()` からの出力で良いか)。
7. **景表法観点の文言** (「残り N 名」「24時間限定」) を PHP 側で変数化するか否か。
8. **`<script type="module">` 採用の coding-rules 側への反映**: 本 LP は calendar-spec §1 の import 構文を成立させるため `<script type="module" src="js/script.js">` を使用する (coding-rules §1 テンプレの `<script src>` からの明示的逸脱)。この逸脱を coding-rules.md の LP 共通ルールとして昇格させるか否か。
