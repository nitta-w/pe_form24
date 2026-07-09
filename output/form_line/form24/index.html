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
	<title>脂肪破壊クエスト｜宝箱の中に特別チケット</title>
	<meta name="description" content="ダンジョンを探索しながら脂肪タイプを診断するゲーム型コンテンツ。最深部の宝箱には特別チケットが入っています。">
	<meta name="keywords" content="" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link
		href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap"
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
			<div class="app" id="app">

				<!-- TITLE -->
				<div class="title" id="title">
					<div class="title__stars" id="tStars"></div>
					<div class="title__battle" id="tBattle"></div>
					<div class="title__sup">JUNO CLINIC PRESENTS</div>
					<div class="title__logo">脂肪破壊<br /><span>クエスト</span></div>
					<div class="title__sub">落ちない脂肪の正体を探す ３分間の冒険<br />最深部の <em>たからばこ</em> には特別チケット</div>
					<button class="title__start" id="tStart">&#9654; START</button>
					<div class="title__foot">TAP TO START YOUR QUEST</div>
				</div>

				<!-- HUD -->
				<div class="hud">
					<div class="hud__floor" id="hFloor">B1F</div>
					<div class="hud__map" id="hMap"></div>
					<button class="hud__snd" id="hSnd" aria-label="サウンド切替"></button>
					<div class="hud__timer" id="hTimer"><small>チケット有効期限</small><span id="hTimerV">23:59:59</span></div>
				</div>

				<!-- STAGE -->
				<div class="stage" id="stage">
					<div class="scene" id="scene"></div>
					<div class="win">
						<div class="msgwin pf" id="msgwin">
							<div class="msgwin__name" id="msgName">MIRAI</div>
							<div class="msgwin__t" id="msgT"></div>
							<div class="tapguide"><span class="tapguide__hand" id="tapHand"></span><span
									class="tapguide__t">タップですすむ</span></div>
						</div>
						<div class="body" id="body"></div>
					</div>
				</div>

				<!-- GIFT OVERLAY -->
				<div class="ov" id="ov">
					<div class="ov__wrap" id="ovWrap"></div>
				</div>
				<div class="flash" id="flash"></div>
				<canvas id="confetti"></canvas>

				<!-- LINE CTA -->
				<div class="fcta" id="fcta">
					<div class="fcta__inner">
						<p class="fcta__micro">クエストの記録（電子カルテ）を <b>LINEにセーブ</b></p>
						<a href="" data-href="<?= $url ?>" class="js-cta-link fcta__btn">
							<svg viewBox="0 0 24 24" fill="none">
								<path
									d="M19.365 10.41C19.365 7.103 16.043 4.42 11.96 4.42c-4.083 0-7.404 2.683-7.404 5.99 0 2.963 2.632 5.444 6.183 5.915.241.052.569.159.651.364.074.186.048.478.024.667l-.105.631c-.033.186-.148.73.638.398.786-.332 4.243-2.498 5.79-4.277h-.001c1.068-1.17 1.629-2.358 1.629-3.698z"
									fill="currentColor" />
								<path
									d="M9.053 8.86h-.52c-.08 0-.144.064-.144.143v3.228c0 .079.065.143.144.143h.52c.08 0 .144-.064.144-.143V9.003c0-.079-.064-.143-.144-.143zM12.629 8.86h-.52a.143.143 0 00-.143.143v1.917L10.49 8.923a.137.137 0 00-.012-.014l-.009-.008a.114.114 0 00-.012-.01l-.007-.004a.111.111 0 00-.014-.008l-.006-.003a.111.111 0 00-.014-.006l-.007-.002-.015-.004h-.008l-.015-.002H9.85a.143.143 0 00-.143.143v3.228c0 .079.064.143.143.143h.52a.143.143 0 00.143-.143v-1.916l1.479 1.999a.147.147 0 00.037.036l.008.005a.12.12 0 00.014.007l.007.003a.11.11 0 00.011.004l.011.003.007.002a.151.151 0 00.037.005h.52a.143.143 0 00.143-.143V9.003a.143.143 0 00-.143-.143zM7.795 11.57H6.383V9.003a.143.143 0 00-.143-.143h-.52a.143.143 0 00-.143.143v3.228c0 .038.015.073.04.098l.002.002.001.002c.025.025.06.04.099.04h2.076c.08 0 .143-.064.143-.144v-.52a.143.143 0 00-.143-.143zM16.253 9.666a.143.143 0 00.143-.143v-.52a.143.143 0 00-.143-.143h-2.076a.143.143 0 00-.099.04l-.002.002-.001.002a.14.14 0 00-.04.098v3.228a.14.14 0 00.04.098l.002.002.001.002c.025.025.06.04.099.04h2.076c.08 0 .143-.064.143-.144v-.52a.143.143 0 00-.143-.143H14.84v-.546h1.412a.143.143 0 00.143-.143v-.52a.143.143 0 00-.143-.144H14.84v-.546h1.412z"
									fill="#fff" />
							</svg>
							LINE追加で特典を受け取る
						</a>
						<p class="fcta__sub">すべてのクーポンがあなたのLINEに届きます</p>
					</div>
				</div>

			</div>
		</main>
	</div>

	<?= r_rt() ?>
	<?= r_rt_lp() ?>
	<?= r_rt_sim_only() ?>
</body>

</html>
