<?php

require_once __DIR__ . '/../router/Router.php';
require_once __DIR__ . '/../../services/auth.service.php';
require_once __DIR__ . '/../../services/users.service.php';
require_once __DIR__ . '/../../common/MySession.php';
require_once __DIR__ . '/../../middlewares/auth.middleware.php';
require_once __DIR__ . '/../../middlewares/error.middleware.php';
require_once __DIR__ . '/../router/RoutesData.php';

use App\Routing\Router;
use App\Routing\RoutesData;
use App\Services\UsersService;
use App\Services\AuthService;
use App\Common\Session\UserSession;
use App\Routing\Middlewares;

$userRouter = new Router(RoutesData::$ROUTES['APP_USER']['ROOT']);
$usersService = UsersService::getInstance();
$authService = AuthService::getInstance();

$userRouter->put(RoutesData::$ROUTES['APP_USER']['CHANGE'], Middlewares\onlyAuthed(), function () use ($usersService, $authService) {
	sleep(1.5);
	$json = file_get_contents('php://input');
	$jsonAssociative = json_decode($json, true);
	$currentUserId = UserSession::getUserData()['id'];
	$user = $usersService->getUser(UserSession::getUserData()['login']);

	$authService->verifyPasswords($jsonAssociative['password'], $user->hashedPassword);

	if (isset($jsonAssociative['password'])) {
		unset($jsonAssociative['password']);
	}

	$userData = $usersService->editUser(array_merge($jsonAssociative, array('id' => $currentUserId)));

	$user = new stdClass();
	$user->user = $userData;
	$user->changedData = $jsonAssociative;

	if (!empty($userData)) {
		$authService->authorize($userData);
	}

	unset($user->user->hashedPassword);

	header('Content-Type', 'application/json');
	echo json_encode($user);
})(Middlewares\respError());


$userRouter->delete(RoutesData::$ROUTES['APP_USER']['DELETE'], Middlewares\onlyAuthed(), function () use ($usersService, $authService) {
	$currentUserId = UserSession::getUserData()['id'];
	$usersService->deleteUser($currentUserId);
	$authService->unAuthorize();
	RoutesData::redirect(RoutesData::$ROUTES['APP_HOME']);
})(Middlewares\respError());

$userRouter->run();

