<?php

require_once __DIR__ . '/../router/Router.php';
require_once __DIR__ . '/../../middlewares/auth.middleware.php';
require_once __DIR__ . '/../../services/auth.service.php';
require_once __DIR__ . '/../router/RoutesData.php';

use App\Routing\RoutesData;
use App\Routing\Router;
use App\Common\Session\UserSession;
use App\Routing\Middlewares;
use App\Services\AuthService;

$homeRouter = new Router(RoutesData::$ROUTES['APP_HOME']);
$authService = AuthService::getInstance();

$homeRouter->get('/', Middlewares\onlyAuthed(), function () use ($authService) {
	require_once __DIR__ . '/../../../templates/home.phtml';
});

$homeRouter->addCallbackOnEachHandlerCall(function () use ($authService) {
	if ($authService->isAuthorized) {
		UserSession::regenerate();
	}
});

$homeRouter->run();