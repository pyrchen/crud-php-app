<?php

require_once __DIR__ . '/../router/Router.php';
require_once __DIR__ . '/../router/RoutesData.php';

use App\Routing\RoutesData;
use App\Routing\Router;

$AppRouter = new Router('/app');

$AppRouter->get('/', function() {
	RoutesData::redirect(RoutesData::$ROUTES['APP_HOME']);
});

$AppRouter->addNotFoundHandler(function () {
	RoutesData::redirect(RoutesData::$ROUTES['APP_HOME']);
});

$AppRouter->run();

try {
	require_once __DIR__ . '/../routes/HomeRouter.php';
	require_once __DIR__ . '/../routes/AuthRouter.php';
	require_once __DIR__ . '/../routes/UserRouter.php';
} catch (Error | Exception $e) {
	throw $e;
}