<?php

namespace App\Routing\Middlewares;

require_once __DIR__ . '/../services/auth.service.php';
require_once __DIR__ . '/../routing/router/RoutesData.php';

use App\Routing\RoutesData;
use App\Services\AuthService;
use Closure;

function onlyAuthed(): Closure {
	return function ($request, $next) {
		$authService = AuthService::getInstance();
		if ($authService->isAuthorized) $next();
		else RoutesData::redirect(RoutesData::$ROUTES['APP_AUTH']['ROOT']);
	};
}

function forNotAuthed(): Closure {
	return function ($request, $next) {
		$authService = AuthService::getInstance();
		if (!$authService->isAuthorized) $next();
		else RoutesData::redirect(RoutesData::$ROUTES['APP_HOME']);
	};
}