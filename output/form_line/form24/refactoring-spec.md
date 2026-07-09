---
approved: true
approved_at: 2026-07-09
---

# form24（脂肪破壊クエスト）再生成仕様書

## 1. 背景・目的

- **入力**: `input/sururim-dungeon-lp.html`（1858行・1ファイル完結）。美容クリニック（JUNOクリニック想定）の脂肪溶解注射「スルリム」訴求 LP を、RPG ダンジョン探索ゲーム（脂肪破壊クエスト）として作り込んだ独自 HTML。ユーザーの回答をゲーム進行の中で収集し、最終的に LINE（L-Step）の `var_*` 変数付き URL に送出する。
- **目的**: `template/form_line/calendar-lp/` の規約に沿った PHP + jQuery + CSS 構成へ再生成し、`output/form_line/form24/` に配置する。既存の広告計測（`ad_count`）・LINE ポップアップ・リタゲタグ・CTA 契約と統合する。
- **出力先ディレクトリ名**: `form24`（ユーザー承認済み）。

## 2. 移行方針（ユーザー承認済み）

- **ハイブリッド維持**: テンプレ必須骨格（index.php ベースライン・CTA 3点セット・リタゲタグ・LINE ポップアップ・`page-wrap>main`・ad_count 計測）にゲーム本体を載せる。ゲーム独自の演出（canvas 紙吹雪・Web Audio・ピクセルアート SVG・タイプライター・FLOW 制御）は案件固有として維持する。インライン `<style>`/`<script>`/`onclick`/インライン `style=` は外部ファイル・規約準拠マークアップへ分離する。
- **カレンダー: time-calendar-sync 採用**: 入力の独自 `renderCal()` を廃し、`template/form_line/calendar-lp/js/time-calendar-sync/` を採用する。

## 3. スコープ外

- 実素材（症例写真・脂肪細胞イメージ等）への差し替え。入力のドット絵 SVG プレースホルダはそのまま維持する。
- クリニック一覧の `houreisen_list.php` フェッチ導入（入力の JS 内ハードコード `CLINICS` を維持。§10 参照）。
- 本番用 `schedule.php`（空き状況データ）の実装（§10 オープン項目）。

## 4. 成果物ディレクトリ構成

```
output/
├── js/                      ← template/js/ をコピー（初回のみ・全案件共通）
│   ├── common.js
│   └── jquery.cookie.js
├── line-at-pop/             ← template/line-at-pop/ をコピー（初回のみ・全案件共通）
└── form_line/
    └── form24/
        ├── refactoring-spec.md   ← 本ファイル
        ├── index.php
        ├── css/style.css
        ├── js/script.js           ← type="module"（カレンダー import のため）
        ├── js/ajax.php            ← calendar-lp/js/ajax.php をコピー（ad_count 用）
        ├── js/time-calendar-sync/ ← calendar-lp/js/time-calendar-sync/ をコピー（無改変）
        └── img/                   ← 現状不要（全ドット絵は SVG 生成）
```

## 5. カレンダーモジュールの実装確認（重要・入力の想定と異なる）

`template/form_line/calendar-lp/js/time-calendar-sync/main.js` を精読した結果、抽象仕様書 `.claude/rules/calendar-spec.md` の一般的記述とは異なり、**この案件向けに具体実装が固定されている**ことを確認した。

- **日付は単一選択**（`checkBoxAttrName` の checkbox は排他制御。`maxSelectedDate` オプションは「日付の複数選択数」ではなく **「同一日付に対する希望時間帯の本数（第1〜第3希望時間）」** として使われている）。
- 生成される `<select>` は `${checkBoxAttrName}_time_1` / `_time_2` / `_time_3`（`checkBoxAttrName: 'date_1'` なら `date_1_time_1〜3`）。
- **入力 HTML の独自カレンダー（3つの異なる日付をそれぞれ選び、各日付に1つの時間を選ぶ）とは構造が異なる**。本モジュールは「1つの来院希望日 + その日の希望時間帯を最大3つ」という設計。
- **CSS クラス名が入力の独自カレンダーとほぼ一致**（`.cal` `.cal__head` `.cal__month` `.cal__nav` `.cal__dow` `.cal__grid` `.cal__day` `.pop-tag` `.pref` `.pref__row` `.pref__label` `.pref__date` `.pref__time` `.pref__clear`）。テーマ色は CSS カスタムプロパティ（`--pk` `--pk-bg` `--bdr` `--ink` `--ink2` `--gold` `--shc`）で上書き可能。本モジュールは同系案件向けに事前調整済みと判断し、**無改変で採用**する。
- 休診 `.cal__day.closed`（「休診」表示）、満席 `.past`/`.full`（「満席」表示）は style.css に実装済み。
- エラー時: `$parent` に `data-tc-is-error=""` 付与 + `.js-tc-message` にエラー文言表示。**利用側 LP が追加文言を出す必要はない**（`.claude/rules/calendar-spec.md` §11-3 準拠）。

### 5-1. 採用する日時収集モデル（入力からの変更点）

入力の「第1〜第3希望＝異なる日付それぞれに時間を1つ」というモデルを廃し、**「来院希望日1つ＋その日の希望時間帯を第1〜第3希望として選ぶ」**モデルに変更する。ゲーム内テキスト（`cal` ステップの案内文・確認メッセージ）もこれに合わせて調整する。

- 変更前（入力）: 「第1希望: 7/10 14:30 / 第2希望: 7/12 10:00 / 第3希望: 7/15 16:00」
- 変更後（form24）: 「ご来院希望日: 7/10 / 第1希望時間: 14:30 / 第2希望時間: 16:00 / 第3希望時間: 【指定しない】」

## 6. 画面フロー / ステップ仕様

入力 `FLOW` 配列（`input/sururim-dungeon-lp.html:1076-1110`）の全ステップを維持する。変更点は `cal` ステップ（カレンダー実装の置換）のみ。

| # | t | floor | 内容 | 変更 |
|---|---|---|---|---|
| 1 | msgs | 1 | オープニング（MIRAI 挨拶） | 維持 |
| 2 | doors2 | 1 | 性別選択（扉2択） | 維持 |
| 3 | menu | 2 | 年代選択（グリッドメニュー） | 維持 |
| 4 | msgs | 2 | つなぎ演出 | 維持 |
| 5 | menu | 3 | 気になる部位（複数選択） | 維持 |
| 6 | msgs | 3 | つなぎ演出 | 維持 |
| 7 | edu | 4 | 脂肪細胞クリスタル解説カード | 維持 |
| 8 | menu | 5 | ダイエット歴（複数選択） | 維持 |
| 9 | social | 5 | 社会的証明（ライブカウント） | 維持 |
| 10 | reasons | 6 | 5つの理由（石碑タブレット） | 維持 |
| 11 | ba | 7 | Before/After 鏡 | 維持 |
| 12 | boss | 7 | ボス戦（脂肪スライム） | 維持 |
| 13 | msgs | 7 | つなぎ演出 | 維持 |
| 14 | chest | 8 | 宝箱開封 → GIFT ポップアップ | 維持 |
| 15 | vip | 8 | 優先仮押さえ権の案内 | 維持 |
| 16 | area | 9 | エリア選択（6区分） | 維持 |
| 17 | clinic | 9 | クリニック選択（`<select>`） | 維持 |
| 18 | **cal** | 9 | **希望日時選択** | **time-calendar-sync へ置換（§5-1）** |
| 19 | final | 10 | 電子カルテ・戦利品一覧・CTA | CTA を3点セット化 |

## 7. HTML / CSS / JS 移行指針

### 7-1. index.php

`template/form_line/calendar-lp/index.php`（全55行）を丸ごとコピーし、以下のみ差し替える。

| 場所 | 差し替え内容 |
|---|---|
| `<title>` | `脂肪破壊クエスト｜宝箱の中に特別チケット` |
| `<meta description>` | ゲーム訴求に合わせた説明文（新規作成） |
| Google Fonts `<link>` | 既存の `Zen Maru Gothic + Poppins` に加え、ゲーム用 `DotGothic16` + `Press Start 2P` を追加読み込み（`&display=swap` 必須） |
| `<main>` 内 | ゲーム DOM 骨格（`.app` `.title` `.hud` `.stage` `.ov` `#flash` `#confetti`）を配置 |
| CTA | `.fcta` 内の `<button onclick="openLine()">` を `<a href="" data-href="<?= $url ?>" class="js-cta-link fcta__btn">` に置換 |

その他（PHP ヘッダ・head インクルード順序・LINE ポップアップブロック・`r_rt_*`・`ptengine()`・`bot_basic_id` hidden・`page-wrap`）は削除・順序変更しない。

### 7-2. css/style.css

セクション順 `Reset → Base → Utility → Page → Animation`、先頭 `@charset "utf-8";` を厳守。

- **Reset**（`calendar-lp/css/style.css:3-80`）／**Base**（`:82-244`）／**Utility**（`:246-335`）は無改変コピー。
- 入力の `<style>`（`input:12-585`）を **Page / Animation** セクションへ移植。規約是正:
  - インライン `style="..."` の静的値（`bottom:26px` `width:88px` `visibility:hidden` `grid-column:1/-1` 等）を BEM クラス化。実行時に決まる純粋な数値（`left/bottom %`・`rotate deg`・`animation-delay`）のみ JS 注入を許容。
  - `select`（クリニック選択・カレンダー時間セレクト）の `font-size` を `1.6rem` 以上に是正（入力は `16px` 相当だが `.pref__time select` は時代不計算 → 明示確認）。
  - `mask`/`backdrop-filter` 使用箇所（本入力には該当なし。確認のみ）。
  - `.app { height: 100dvh }` は既に dvh 使用のため維持。
- `time-calendar-sync/style.css` のテーマ色変数（`--pk` `--pk-bg` `--bdr` `--ink` `--ink2` `--gold` `--shc`）を `.app` 配下でゲームのダーク配色に上書き（`--pk:#FF4785` 等は入力の既存パレットと一致するため多くはそのまま流用可）。

### 7-3. js/script.js

- 先頭で `import { embedTimeCalendar } from './time-calendar-sync/main.js';`（`type="module"` 前提）。
- 入力の `<script>`（`input:640-1856`）のゲーム制御（`CONFIG` / `ST` / `FLOW` / `run()` / `runStep()` / 各種演出関数）を移植。
- **テンプレ標準の `state`/`.js-csl__item` カルーセル構造は採用しない**（ゲームの線形 FLOW 制御と構造が異なるため）。代わりに以下のテンプレ契約点を FLOW 制御に注入する（受容した規約逸脱として明記・§9）。
  - **CTA**: `openLine()`/`buildUrl()` を廃し、`addParamsToCtaUrl()`（`.claude/rules/coding-js.md` §5 準拠）を実装。`$('.js-cta-link').each(...)` で `data-href` に `var_*` を付与。
  - **ad_count 計測**: `postAdCountStatus()`（テンプレ完全コピー）を導入。`state.adCountStatus`（初期値3）を `runStep()` 前進ごとに `++` → 送信。戻り操作（本ゲームには「戻る」操作が無いため実質常時前進）は該当なし。
  - **インラインハンドラ撤廃**: `onclick="openLine()"` を削除し、CTA は `.js-cta-link` の `click` イベントで `onClickCtaBtn` 相当の処理（`addParamsToCtaUrl()` 実行）にバインド。
- **カレンダー統合**（`cal` ステップ、`input:1519-1523,1601-1680` を置換）:
  1. `#body` に `#js-time-calendar-1 > .js-tc / .js-tc-list` を動的挿入。
  2. `embedTimeCalendar({ parentSelector:'#js-time-calendar-1', checkBoxAttrName:'date_1', scheduleFetchUrl:'js/sururim_schedule.php', options:{ maxSelectedDate:3, useScheduleDummyData:false, couponSettings:{ isAllTimeCoupon:true, showStartDays:0, showDays:7, showTimeList:[] } } })` → `cal.init()`。
  3. クリニック確定後（`clinic` ステップ完了時）に `cal.createCalendar({ params:{ clinicId: ST.a.clinicId, days:21 } })` を呼ぶ。`clinicId` は `renderClinicStep()` で `js/sururim_list.php` から取得した実 ID（レスポンスの `clinic_id`）を使用（旧ダミー値方式は廃止）。
  4. 「これで決定」ボタン（`.js-tc-list` 直下に案件固有で設置）を `[name="date_1"]` の `change` で活性化制御し、クリックで `runStep` を前進させる（`.claude/rules/calendar-spec.md` の実装例パターンに準拠）。
- **クリニック一覧取得（`js/sururim_list.php` 連携）**: 入力の `CLINICS` ハードコードは廃止。`area` ステップでは coding-js.md § クリニック一覧取得ルールのエリアID対応表（1〜6）に準拠した `AREA_OPTS`（ラベルは入力表記を維持、値は数値エリアID）を使用し、`ST.a.area`（表示用ラベル）と `ST.a.areaId`（数値ID・fetch用）を分離保持。`clinic` ステップ（`renderClinicStep()`）でエリアID確定後に `POST js/sururim_list.php { area_id }` を実行し、レスポンス `{ clinic_id, value, label }` から `<select>` を動的構築。取得失敗時は `data-clinic-list-error` 属性＋`ST.a._isClinicListError=true` を設定し、`<select>` は disabled のまま進行ボタンを活性化する（coding-js.md §5-3 準拠）。
- **エラー状態の永続化**: `runStep()` は毎ステップ `#body` を `innerHTML=''` でクリアするため、`data-tc-is-error` / `data-clinic-list-error` の DOM 属性は次ステップ遷移時に消失する。そのため `ST.a._isCalendarError` / `ST.a._isClinicListError` に検知時点で永続化し、`addParamsToCtaUrl()`（最終画面）はこの2フラグを参照する（DOM 属性は直接参照しない）。
- **セキュリティ/品質**: `eval`/`Function`/`document.write` 不使用を維持。ユーザー入力の DOM 反映は既存通り `zk()`（全角変換）経由でも動的値のみ・`escapeHTML` は不要（外部入力を受け取らないため）。`setInterval`（BGM `input:1042-1055`、ライブカウント `input:1794-1804`、タイマー `input:1587-1599`）を `pagehide`/`visibilitychange` で `clearInterval` するよう追加。

## 8. input → output 分離対象表

| input 行番号 | 内容 | 移行先 |
|---|---|---|
| 1-10 | `<head>` 静的メタ・フォント | `index.php` head（可変部差し替え） |
| 11-585 | インライン `<style>` | `css/style.css`（Page/Animation セクション） |
| 587-638 | `<body>` ゲーム DOM 骨格 | `index.php` `<main>` 内 |
| 629-636 | 旧 fixed LINE CTA（`onclick="openLine()"`） | CTA 3点セット化（`class="js-cta-link"`） |
| 640-1856 | `<script>` ゲーム制御全体 | `js/script.js` |
| 1070-1110 | `FLOW` 定義 | `js/script.js`（無改変） |
| 1519-1523, 1601-1680 | `cal` ステップ・`renderCal()` | `js/script.js`（time-calendar-sync 呼び出しに置換。§7-3） |
| 1764-1778 | `buildUrl()` / `openLine()` | `addParamsToCtaUrl()` へ再構成 |

## 9. ID → class/data 置換表・受容した規約逸脱

| 項目 | 入力 | form24 | 理由 |
|---|---|---|---|
| CTA トリガー | `<button onclick="openLine()">` | `<a href="" data-href="<?= $url ?>" class="js-cta-link fcta__btn">` | インラインハンドラ禁止・CTA 3点セット必須 |
| 画面遷移構造 | 独自 `FLOW`/`ST`/`run()` | 維持（規約の `.js-csl__item` カルーセルは不採用） | ゲームの線形進行と多画面カルーセルは構造が根本的に異なるため。ad_count・CTA 契約のみ注入 |
| カレンダー日時モデル | 3日付×各1時間 | 1日付×時間3希望 | §5-1（モジュール実装が単一日付前提のため） |
| フォーム入力 | JS内 `ST.a` オブジェクトに直接格納（`<input>` 未使用） | 現状維持を検討 → **要相談（§10）** | `.claude/rules/coding-form-input.md` は「選択値は必ず `<input>` で保持」と規定するが、本ゲームは全選択を JS オブジェクト直接代入で管理する設計。全面 `<input>` 化はゲームの動的 DOM 生成（`menu()`/`doors2` 等）と衝突するため、本 spec では **現状の JS 状態管理を維持**する方針とする |

## 10. L-Step 変数マッピング（bot_basic_id = `897vblrf`）

| 収集項目 | ST.a キー | 種別 | var ID |
|---|---|---|---|
| 性別 | gender | 単一 | 2184987 |
| 年代 | age | 単一 | 2184988 |
| 気になる部位 | body_parts | 複数（`,`結合） | 2184994 |
| ダイエット歴 | diet | 複数 | 2460256 |
| クーポン | coupon（固定`3大特典クーポン`） | 単一 | 2184995 |
| エリア | area（表示ラベル。数値ID は `areaId` として別保持） | 単一 | 2184547 |
| クリニック | clinic（`isClinicListError` 時は送信しない） | 単一 | 2184548 |
| 来院希望日 | 選択日（`date_1` の `.val()`、`formatDate(…,'MM月DD日(dow)')`） | 単一 | 2184549 |
| 第1希望時間 | `date_1_time_1` | 単一 | 2184551 |
| 第2希望時間 | `date_1_time_2` | 単一 | 2349621 |
| 第3希望時間 | `date_1_time_3` | 単一 | 2433745 |
| （未使用）reserve_date2 | — | — | 2349620 — **本モデルでは日付が単一のため送信しない** |
| （未使用）reserve_date3 | — | — | 2433744 — **同上** |
| LP識別 | 固定`sururim_quest_v1` | 単一 | 2504096 |

エラーコード: `isCalendarError`（カレンダーfetch失敗時に `ST.a._isCalendarError` へ永続化）→ `E01_カレンダー表示`。`isClinicListError`（`js/sururim_list.php` fetch失敗時に `ST.a._isClinicListError` へ永続化）→ `E02_店舗表示`。

## 11. 実装ステップ順序

1. **Phase 0（本 spec の承認）** ← 現在ここ
2. **Phase 1**: インフラ配置（`output/js/`・`output/line-at-pop/`・`form24/js/time-calendar-sync/`・`js/ajax.php` コピー、空ファイル配置）
3. **Phase 2**: `index.php` 骨格構築（`diff` で非破壊確認）
4. **Phase 3**: CSS 移植（Reset/Base/Utility コピー → Page/Animation 移植・規約是正）
5. **Phase 4**: JS 移植・非カレンダー部（ゲーム制御・CTA 契約化・ad_count フック）
6. **Phase 5**: カレンダー置換（time-calendar-sync 統合・§5-1 モデル変更の文言調整・var マッピング完成）
7. **Phase 6**: 検証（§12）

## 12. 検証手順

- `diff template/form_line/calendar-lp/index.php output/form_line/form24/index.php` で可変部以外の差分ゼロを確認。
- `/page-check form24` で6セクション（必須コード・JS構造・カレンダー・状態更新・動的生成・パフォーマンス）を検証。
- Playwright MCP で実進行確認: タイトル→各フロア→ボス戦→宝箱→カルテ→CTA 表示、カレンダー描画・日付+3希望時間選択、CTA クリックで `var_*` 付与済み URL 生成（`isCalendarError` 分岐含む）。
- iOS Safari 相当（WebKit）で `select` 16px・`100dvh`・タップ操作を確認。
- PHP 未定義関数警告（`common.php` 実体なし）は無視。

## 13. オープン項目（ユーザー確認待ち）

1. **カレンダー日時モデルの変更（§5-1）**: 入力は「3つの異なる日付それぞれに時間」だったが、テンプレモジュールの実装は「1つの日付＋時間帯3希望」。**この UX 変更で問題ないか確認をお願いします**。
2. ~~schedule.php（空き状況データ）~~ **解決済み**: ユーザーより `js/sururim_schedule.php`（BigQuery連携・`clinic-calendar-464805` プロジェクト実装）の提供を受け、`js/form24/js/sururim_schedule.php` に配置・連携済み。`useScheduleDummyData: false` に変更。ただし `google-bigquery-api/vendor/autoload.php` と認証情報 JSON（`google-bigquery-api-...json`）はサイトルート（`output/` の2階層上、`common.php` 等と同階層）に存在する前提。**ローカル環境にはこの実体が無いため、`google-bigquery-api` 未配置時は fetch が失敗し、カレンダーはエラー表示＋進行許可のフォールバック状態になる（想定挙動）**。ローカルで正常系（ダミーデータ）を見たい場合は `php -S 127.0.0.1:<port>` など、hostname を `127.0.0.1` に固定したローカルサーバーで確認すること（`time-calendar-sync/main.js` がこの hostname 時のみ自動でダミーデータへフォールバックする）。
3. ~~clinicId の採番~~ **解決済み**: クリニック一覧も `js/sururim_list.php`（同 BigQuery プロジェクト、`area_id` → `{clinic_id, value, label}`）に置き換え、レスポンスの実 `clinic_id` を使用するよう変更。入力の `CLINICS` ハードコードは削除。エリアは coding-js.md のエリアID対応表（1〜6）に準拠する数値IDで送信し、表示ラベルは入力表記（「関西」等）を維持。
4. **フォーム入力の `<input>` 化（§9 の表）**: `.claude/rules/coding-form-input.md` の原則（選択値は必ず `<input>` で保持）と、本ゲームの JS 状態管理（`ST.a` 直接格納）の間に構造的な相違がある。全選択を `<input type="radio/checkbox">` 化するとゲームの動的 DOM 生成と大きく衝突するため、**現状の JS 状態管理維持で進めてよいか確認をお願いします**（LINE 送信は `var_*` パラメータ経由であり `<input>` の有無は送信結果に影響しないため実害は無いと判断）。
5. **本番デプロイ前提の確認**: `js/sururim_schedule.php` / `js/sururim_list.php` は `__DIR__ . '/../../../google-bigquery-api/...'`（サイトルート想定）を参照する。本番サーバーに `google-bigquery-api/`（vendor一式＋認証JSON）が配置されていることの確認をお願いします。
5. **実素材差し替え**: ドット絵 SVG プレースホルダ（症例写真・脂肪細胞イメージ等）は本 Phase では差し替えない。
