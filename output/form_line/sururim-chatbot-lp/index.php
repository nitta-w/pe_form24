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
	<title>スルリム式脂肪破壊術｜LINE限定 特別クーポン配布中</title>
	<meta name="description" content="スルリム式の部分痩せ専門プログラム。気になる部位の脂肪細胞にピンポイントアプローチ。特別価格クーポンをLINEでお届け。無料カウンセリング予約受付中。">
	<meta name="keywords" content="슬림,スルリム式,脂肪破壊術,ジュノビューティークリニック,部分痩せ,二の腕痩せ,脚痩せ,美尻,LINE友だち追加,LINE限定メニュー" />
	<link
		href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&family=Poppins:wght@600;700;800;900&display=swap"
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
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
						<circle cx="9" cy="11" r="1.5" fill="#2B2B2B" />
						<circle cx="15" cy="11" r="1.5" fill="#2B2B2B" />
						<path d="M9 14.5 Q12 16.5 15 14.5" stroke="#C2614A" stroke-width="1.4" fill="none" stroke-linecap="round" />
					</svg>
				</div>
				<div class="page-header__name">
					MIRAI
					<small>スルリム式 美容コンシェルジュ</small>
				</div>
			</header>

			<!-- チャット (JS が追記) -->
			<div class="chat" id="js-chat"></div>

			<!-- 下部固定 CTA (3点セット) -->
			<div class="js-fixed-btn">
				<div class="fixed-btn__inner">
					<p class="fixed-btn__micro">本日の電子カルテの情報を <strong>LINEで送信</strong></p>
					<a class="js-cta-link" href="" data-href="<?= $url ?>">
						<svg viewBox="0 0 24 24" fill="none" width="22" height="22">
							<path
								d="M19.365 10.41C19.365 7.103 16.043 4.42 11.96 4.42c-4.083 0-7.404 2.683-7.404 5.99 0 2.963 2.632 5.444 6.183 5.915.241.052.569.159.651.364.074.186.048.478.024.667l-.105.631c-.033.186-.148.73.638.398.786-.332 4.243-2.498 5.79-4.277h-.001c1.068-1.17 1.629-2.358 1.629-3.698z"
								fill="currentColor" />
						</svg>
						LINE追加で特典を受け取る
					</a>
					<p class="fixed-btn__sub">すべてのクーポンがあなたのLINEに届きます</p>
				</div>
			</div>
		</main>
	</div>

	<!-- クーポンポップアップ -->
	<div class="js-coupon-overlay">
		<div class="js-coupon-wrap">
			<div class="cpn-header">
				<div class="cpn-header__badge">SPECIAL GIFT</div>
				<h2 class="cpn-header__title" id="coupon-title">あなた専用の<br>3大特典をご用意しました</h2>
				<p class="cpn-header__sub">診断完了のお礼として特別にお届けします</p>
			</div>
			<div class="cpn-card" id="js-cpn-card-1">
				<div class="cpn-card__icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
						<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
						<line x1="7" y1="7" x2="7.01" y2="7" />
					</svg>
				</div>
				<div class="cpn-card__num">GIFT 01</div>
				<div class="cpn-card__title">初回限定 超特別価格</div>
				<div class="cpn-card__price"><span>9,800</span><span class="yen">円</span></div>
				<div class="cpn-card__note">（税込）/ 1部位目</div>
				<div class="cpn-card__desc">期限内に枠の仮押さえを確定で有効化されます</div>
			</div>
			<div class="cpn-card" id="js-cpn-card-2">
				<div class="cpn-card__icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
						<rect x="3" y="8" width="18" height="13" rx="2" />
						<path d="M12 8v13M3 12h18" />
						<path d="M12 8c-2-3-5-4-5-2s3 2 5 2 5 0 5-2-3-1-5 2z" />
					</svg>
				</div>
				<div class="cpn-card__num">GIFT 02</div>
				<div class="cpn-card__title">2部位目以降もずっと特別価格</div>
				<div class="cpn-card__price"><span>14,800</span><span class="yen">円〜</span></div>
				<div class="cpn-card__note">（税込）</div>
				<div class="cpn-card__desc cpn-card__desc--note">※1部位のみのご利用でもOKです</div>
			</div>
			<div class="cpn-card" id="js-cpn-card-3">
				<div class="cpn-card__icon">
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
					</svg>
				</div>
				<div class="cpn-card__num">GIFT 03</div>
				<div class="cpn-card__title">人気の美容施術が1つ無料</div>
				<div class="cpn-card__desc">飲む医療ダイエット・ボツリヌス施術・美容内服薬など<br>お好きなメニューをお選びいただけます</div>
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