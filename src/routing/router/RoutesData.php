<?php

namespace App\Routing;

use JetBrains\PhpStorm\NoReturn;

class RoutesData {
	public static array $ROUTES = [
		'APP_ROOT' => '/app',
		'APP_HOME' => '/app/home',
		'APP_AUTH' => [
			'ROOT' => '/app/auth',
			'SIGNIN' => '/signin',
			'SIGNUP' => '/signup',
			'LOGOUT' => '/logout',
		],
		'APP_USER' => [
			'ROOT' => '/app/user',
			'CHANGE' => '/change',
			'DELETE' => '/delete',
		],
	];

	#[NoReturn] public static function redirect(string $route): void {
		$scheme = $_SERVER['REQUEST_SCHEME'];
		$host = $_SERVER['HTTP_HOST'];
		$fullRoute = $scheme . '://' . $host . $route;

		header('Location: ' . $fullRoute);
		exit();
	}
}