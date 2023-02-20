<?php

require_once __DIR__ . '/../common/MySession.php';

use App\Common\Session\UserSession;

try {
	UserSession::start();
	require_once __DIR__ . '/routes/AppRouter.php';
} catch (Error | Exception $e) {
	$error = new stdClass();
	$error->error = array(
		'message' => $e->getMessage(),
		'code' => 500,
	);
	echo json_encode($error);
}
