<?php

require_once __DIR__ . '/../router/Router.php';
require_once __DIR__ . '/../../services/auth.service.php';
require_once __DIR__ . '/../../middlewares/auth.middleware.php';
require_once __DIR__ . '/../../middlewares/error.middleware.php';
require_once __DIR__ . '/../router/RoutesData.php';

use App\Routing\RoutesData;
use App\Routing\Router;
use App\Services\AuthService;
use App\Routing\Middlewares;

$authRouter = new Router(RoutesData::$ROUTES['APP_AUTH']['ROOT']);
$authService = AuthService::getInstance();

$authRouter->get('/', Middlewares\forNotAuthed(),function () {
	require_once __DIR__ . '/../../../templates/auth.phtml';
});

$authRouter->post(RoutesData::$ROUTES['APP_AUTH']['SIGNIN'], function () use ($authService) {
	sleep(2);
	$json = file_get_contents('php://input');
	$jsonAssociative = json_decode($json, true);

	$user = $authService->signin($jsonAssociative);

	http_response_code(201);
	header('Content-Type: application/json');;
	echo json_encode($user);
})(Middlewares\respError(401));

$authRouter->post(RoutesData::$ROUTES['APP_AUTH']['SIGNUP'], function () use ($authService) {
	sleep(2);
	$json = file_get_contents('php://input');
	$jsonAssociative = json_decode($json, true);
	$user = $authService->signup($jsonAssociative);

	http_response_code(201);
	header('Content-Type', 'application/json');
	echo json_encode($user);
})(Middlewares\respError());

$authRouter->get(RoutesData::$ROUTES['APP_AUTH']['LOGOUT'], Middlewares\onlyAuthed(), function () use ($authService) {
	sleep(1);

	$authService->logout();

	RoutesData::redirect(RoutesData::$ROUTES['APP_AUTH']['ROOT']);
});

$authRouter->run();