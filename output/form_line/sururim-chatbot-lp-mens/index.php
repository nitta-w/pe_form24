<?php
require_once __DIR__ . '/../../common.php';

$url = ad_line_url();
$lineat_flag = is_display_line_popup();
$bot_basic_id = ad_messaging_api_bot_basic_id();
?>
<!doctype html>
<html lang="ja">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>スルリム式 脂肪除去プログラム for MEN｜LINE限定 プレミアムベネフィット</title>
	<meta name="description"
		content="スルリム式 for MENは、切らず・筋肉は残したまま・皮下脂肪細胞の「数」を最大35%破壊し、リバウンドしにくい身体へ導く男性専用医療プログラム。LINE限定特別価格。無料コンサルテーション予約受付中。">
	<meta name="keywords" content="スルリム式,スルリム式forMEN,男性脂肪除去,ジュノビューティークリニック,男性部分痩せ,下腹部,脇腹,二の腕,メンズ医療痩身,LINE友だち追加" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link
		href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700;900&family=Cormorant+Garamond:wght@400;500;600;700&family=Poppins:wght@500;600;700;800;900&display=swap"
		rel="stylesheet">
	<link rel="stylesheet" href="js/time-calendar-sync/style.css">
	<link rel="stylesheet" href="css/style.css">

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
	<script src="../../js/common.js"></script>
	<script type="module" src="js/script.js"></script>

	<!-- LINE popup -->
	<script src="../../js/jquery.cookie.js"></script>
	<?php if ($lineat_flag) { ?>
		<link rel="stylesheet" href="../../line-at-pop/line-at-pop.css">
		<script src="../../line-at-pop/popup.js"></script>
	<?php } ?>
	<!--/ LINE popup -->
	<?= r_rt_header() ?>
	<?= r_rt_header_lp() ?>
	<?= r_rt_header_sim_only() ?>
</head>

<body>
	<?= ptengine() ?>
	<input type="hidden" name="bot_basic_id" value="<?= $bot_basic_id ?>">

	<div class="page-wrap">
		<main>
			<!-- 進捗バー -->
			<div class="prog" id="js-prog">
				<div class="prog__bars" id="js-prog-bars"></div>
				<div class="prog__m">
					<span id="js-prog-label">Step 1 / 9</span>
					<strong id="js-prog-rem">あと9問</strong>
				</div>
			</div>

			<!-- ヘッダー -->
			<header class="page-header">
				<div class="page-header__logo">
					<svg width="26" height="26" viewBox="0 0 24 24" fill="#C9A96E">
						<path transform="translate(1.4,8.55) scale(0.3)"
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						<path transform="translate(6.6,4.825) scale(0.45)"
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						<path transform="translate(15.4,8.55) scale(0.3)"
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
					</svg>
				</div>
				<div class="page-header__name">
					KENT
					<small>Private Consultant</small>
				</div>
			</header>

			<!-- チャット (JS が追記) -->
			<div class="chat" id="js-chat"></div>

			<!-- 下部固定 CTA (3点セット) -->
			<div class="js-fixed-btn">
				<div class="fixed-btn__inner">
					<p class="fixed-btn__micro">電子カルテの情報が <strong>自動でLINEに同期</strong>されます</p>
					<a class="js-cta-link" href="" data-href="<?= $url ?>">
						<svg viewBox="0 0 24 24" fill="none" width="22" height="22">
							<path
								d="M19.365 10.41C19.365 7.103 16.043 4.42 11.96 4.42c-4.083 0-7.404 2.683-7.404 5.99 0 2.963 2.632 5.444 6.183 5.915.241.052.569.159.651.364.074.186.048.478.024.667l-.105.631c-.033.186-.148.73.638.398.786-.332 4.243-2.498 5.79-4.277h-.001c1.068-1.17 1.629-2.358 1.629-3.698z"
								fill="currentColor" />
						</svg>
						LINE追加で特典を受領する
					</a>
					<p class="fixed-btn__sub">あなた様専用の特典がLINEに届きます</p>
				</div>
			</div>
		</main>
	</div>

	<!-- クーポンポップアップ -->
	<div class="js-coupon-overlay">
		<div class="js-coupon-wrap">
			<div class="cpn-header">
				<div class="cpn-header__badge">For You Only</div>
				<h2 class="cpn-header__title" id="coupon-title">あなた様専用の<br>3大特典</h2>
				<p class="cpn-header__sub">コンサルテーション完了の御礼として</p>
			</div>
			<div class="cpn-card" id="js-cpn-card-1">
				<div class="cpn-card__icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
						<path d="M6 3h12l3 6-9 12L3 9z" />
						<path d="M3 9h18M9 3l3 6 3-6M12 9l-3 12M12 9l3 12" />
					</svg>
				</div>
				<div class="cpn-card__num">Gift 01</div>
				<div class="cpn-card__title">初回限定 プレミアム価格</div>
				<div class="cpn-card__price"><span>9,800</span><span class="yen">円</span></div>
				<div class="cpn-card__note">税込 / 1部位目</div>
				<div class="cpn-card__desc">期限内に枠の仮押さえを確定いただきますと有効化されます</div>
			</div>
			<div class="cpn-card" id="js-cpn-card-2">
				<div class="cpn-card__icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
						stroke-linejoin="round">
						<path d="M2 18h20M3 7l4 6 5-8 5 8 4-6v11H3z" />
						<circle cx="12" cy="13" r="1" fill="currentColor" />
					</svg>
				</div>
				<div class="cpn-card__num">Gift 02</div>
				<div class="cpn-card__title">2部位目以降も特別価格継続</div>
				<div class="cpn-card__price"><span>14,800</span><span class="yen">円〜</span></div>
				<div class="cpn-card__note">税込</div>
				<div class="cpn-card__desc cpn-card__desc--note">※ 1部位のみのご利用でも可能でございます</div>
			</div>
			<div class="cpn-card" id="js-cpn-card-3">
				<div class="cpn-card__icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
						<rect x="8" y="2" width="8" height="20" rx="4" />
						<line x1="8" y1="12" x2="16" y2="12" />
					</svg>
				</div>
				<div class="cpn-card__num">Gift 03</div>
				<div class="cpn-card__title">人気の医療施術が1つ無料</div>
				<div class="cpn-card__desc">飲む医療ダイエット・ボツリヌス施術・美容内服薬など<br>お好きなメニューを1つお選びいただけます</div>
			</div>
			<button class="js-coupon-close" id="js-coupon-close">すべて受け取る</button>
		</div>
	</div>

	<canvas id="confetti"></canvas>

	<footer class="page-footer">
		※自由診療／副作用:内出血・腫れ・鈍痛(1〜2週間)／効果には個人差があります<br>
		<a href="../../company.html">運営者情報</a><a href="../../privacy_policy.html">プライバシーポリシー</a>
	</footer>

	<?= r_rt() ?>
	<?= r_rt_lp() ?>
	<?= r_rt_sim_only() ?>
</body>

</html>